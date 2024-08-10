import React, { useEffect, useState, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from '../styles/components.module.css';
import { Container, Box, Paper, Typography, IconButton, CircularProgress, Alert, Snackbar, Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import FlashcardContainer from '../widgets/FlashcardContainer';
import QuizContainer from '../widgets/QuizContainer';
import Text from '../widgets/Text';
import Question from '../widgets/Question';
import { useAuth } from '../utils/authProvider';
import { getUserWidgetsRef, getUserRef, getUserWidgetRef, updateData, getData } from '../utils/databaseCRUD';
import { apiUrl } from '../utils/envConfig';
import { findNextAvailablePosition, formatToHTML, fetchWidgetData, isDuplicate } from '../utils/helper';
import axios from 'axios';


const Dashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loadingWidgetId, setLoadingWidgetId] = useState(null);

  const { currentUser } = useAuth();
  const userId = currentUser.uid;
  const userIdToken = sessionStorage.getItem('geminiDashboardIdToken');

  const [longPressDialogOpen, setlongPressDialogOpen] = useState(false);
  const actionBarRef = useRef(null);
  const lastTapRef = useRef(0);

  const handleDoubleTap = (event) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 5000) {
      setlongPressDialogOpen(true);

    }

    lastTapRef.current = now;
  };

  const handleRearrangeWidgets = () => {

    const newLayout = [];

    const columns = 3;
    const width = 12;
    const rowHeight = 200;

    widgets.forEach((widget, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;

      const x = column * (width / columns);
      const y = row * rowHeight;

      newLayout.push({
        ...widget,
        w: 4,
        h: 3,
        x,
        y,
      });
    });

    // Update the layout
    handleLayoutChange(newLayout);


    setlongPressDialogOpen(false);
  };

  useEffect(() => {
    const container = actionBarRef.current;

    if (container) {
      container.addEventListener('dblclick', handleDoubleTap);
    }

    return () => {
      if (container) {
        container.removeEventListener('dblclick', handleDoubleTap);
      }
    };
  }, []);

//Get user widgets
const fetchWidgets = async () => {
  if (currentUser) {
    setLoading(true);


    const userRef = getUserRef(userId);
    const userWidgetsRef = getUserWidgetsRef(userId);


    const [userSnapshot, snapshot] = await Promise.all([
      getData(userRef),
      getData(userWidgetsRef),
    ]);

    const userData = userSnapshot.val();
    if (userData) {
      setBackgroundUrl(userData.dashboardBackgroundUrl || '');
    }

    try {

      const widgetsData = [];
      const loadedLayout = [];
      const fetchPromises = [];

      const screenWidth = window.innerWidth;
      const isMobile = screenWidth <= 768;

      let snapshotVal = snapshot ? snapshot.val() : {};


      let widgetsArray = []
      for (const [key, value] of Object.entries(snapshotVal)) {
        let widget = { ...value, i: key };
        widgetsArray.push(widget)
      }


      //call to gemini endpoint
      var count = 1;

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


      const updatedLayout = [];

      for (const currWidget of widgetsArray) {
        let widget = { ...currWidget, i: currWidget.i };
      
        if (widget.isInDashboard) {
          if (!widget.content) {
            const fetchPromise = delay(count * 1000)
              .then(() => fetchWidgetData(widget, userIdToken, apiUrl, showErrorSnackbar))
              .then(content => {
         
                Object.assign(widget, { content });
  
                const widgetRef = getUserWidgetRef(userId, widget.i);
                updateData(widgetRef, { content });
                
                const position = findNextAvailablePosition(widget, updatedLayout);
                if (!isDuplicate(widget, updatedLayout)) {
                  updatedLayout.push({ ...widget, x: position.x, y: position.y });
                }
      
                widgetsData.push(widget);
      
                setWidgets(prevWidgets => {
                  const widgetExists = prevWidgets.some(existingWidget => existingWidget.i === widget.i);
                  if (!widgetExists) {
                    return [...prevWidgets, widget];
                  }
                  return prevWidgets;
                });
              });
      
            fetchPromises.push(fetchPromise);
          } else {
            

            if (isMobile) {
  
              //Has mobile x y or not
              if (widget.mobX == null || widget.mobY == null || widget.mobW == null || widget.mobH == null) {
                const position = findNextAvailablePosition(widget, updatedLayout);
                updatedLayout.push({ ...widget, x: position.x, y: position.y });

              } else {

                updatedLayout.push({ ...widget, x: widget.mobX, y: widget.mobY, w: widget.mobW, h: widget.mobH });
                
              }   

          } else {

              //Has desktop x y or not
              if (widget.x == null || widget.y == null) {
                const position = findNextAvailablePosition(widget, updatedLayout);
                updatedLayout.push({ ...widget, x: position.x, y: position.y });
              } else {


                updatedLayout.push(widget);
              }           
          }
      
            widgetsData.push(widget);
            
          }
        }
      
        count++;
      }
      
      Promise.all(fetchPromises).finally(() => {
        setWidgets(widgetsData);
        setLayout(updatedLayout);
        setLoading(false);
      });

    } catch (error) {
      const errorResponse = error.response?.data || {};

      showErrorSnackbar(errorResponse);

      console.error(`Error getting data for widget:`, error);
    }


  }
};
  useEffect(() => {

    

    fetchWidgets();
  }, [currentUser, userId, userIdToken]);

  //Remove widget from dashboard
  const handleOnRemove = async (widgetId) => {
    try {

      setLayout((prevLayout) => prevLayout.filter(widget => widget.i !== widgetId));
      setWidgets((prevWidgets) => prevWidgets.filter(widget => widget.i !== widgetId));

      const widgetRef = getUserWidgetRef(userId, widgetId);
      await updateData(widgetRef, { isInDashboard: false });

    } catch (error) {
      console.error(`Error removing widget ${widgetId}:`, error);
    }
  };

  //Refresh widget
  const handleOnRefresh = async (widgetId) => {
    setLoadingWidgetId(widgetId);

    try {
      const fetchPromises = [];


      const widgetRef = getUserWidgetRef(userId, widgetId);

      const snapshot = await getData(widgetRef);

      let snapshotVal = [];
      if (snapshot != null) {
        const myWidget = snapshot.val();
        snapshotVal = [myWidget];
      }
      

      //call to gemini endpoint
      var count = 1;

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


      
      for (const currWidget of snapshotVal) {
        let widget = { ...currWidget, i: widgetId};
      
   
          const fetchPromise = delay(count * 0)  
            .then(() => fetchWidgetData(widget, userIdToken, apiUrl, showErrorSnackbar))
            .then(content => {
              Object.assign(widget, { content });


              const widgetRef = getUserWidgetRef(userId, widgetId);
              updateData(widgetRef, { content })
    
              setWidgets((prevWidgets) => {
                const updatedWidgets = [...prevWidgets];
                const widgetIndex = updatedWidgets.findIndex(widget => widget.i === widgetId);
    
                if (widgetIndex !== -1) {
                  updatedWidgets[widgetIndex] = { content, i: widgetId, ...widget };
                }
    
                return updatedWidgets;
              });
    
              setLoadingWidgetId(null);
            })
      
          fetchPromises.push(fetchPromise);

      
        count++;
      }
      
      Promise.all(fetchPromises)
        .finally(() => {
          setLoading(false);
        });

    } catch (error) {

      setLoadingWidgetId(null);

      const errorResponse = error.response?.data || {};

      showErrorSnackbar(errorResponse);

      console.error(`Error getting data for widget:`, error);
    }


  };

  //When user rearrange widgets
  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    saveLayout(newLayout);
  };

  //Show error message
  const showErrorSnackbar = (errors) => {


    const errorsArray = Array.isArray(errors) ? errors : [errors];

    const messages = errorsArray.map(error => {
      if (typeof error === 'object' && error !== null) {
        return Object.values(error).filter(msg => msg);
      }
      return error;
    }).flat();

    setErrorMessages(messages);
    setSnackbarOpen(true);
  };

  //Close error message
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //Update layout
  const saveLayout = (layout) => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;

    layout.forEach(widget => {
      const { i, x, y, w, h } = widget;
      const widgetRef = getUserWidgetRef(userId, i);

      if (isMobile) {
        updateData(widgetRef, { mobX: x, mobY: y, mobW: w, mobH: h });
      } else {
        updateData(widgetRef, { x, y, w, h });
      }
    });
  };

  //Show widget based on type
  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'flashcard':
        return <FlashcardContainer flashcards={widget.content} />;
      case 'quiz':
        return <QuizContainer quizzes={widget.content} />;
      case 'text':
        const firstItemContent = Array.isArray(widget.content) && widget.content.length > 0 ? widget.content[0]?.value : '';

        return <Text value={firstItemContent} />;
      case 'question':

        return <Question widget={widget} currentUser={currentUser} />;
      default:
        return <Typography variant="body2">No content available</Typography>;
    }
  };

  return (
    <Container
      maxWidth={false} disableGutters
      sx={{
        background: backgroundUrl ? `url(${backgroundUrl}) no-repeat center center` : 'none',
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}

    >
      <Box ref={actionBarRef}
        sx={{ padding: 1 }}
      ></Box>

      {loading && (
        <Box
          className={styles.loadingWrapper}
        >
          <CircularProgress />
        </Box>
      )}
      <Box>

        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={150}
          width={window.innerWidth}
          margin={[10, 10]}
          containerPadding={[10, 10]}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
        >

          {widgets.map((widget) => (
            <Box key={widget.i} sx={{ zIndex: 9, opacity: widget.isTranslucent ? 0.9 : 1 }}>
              <Paper className={styles.dashboardPaperWrapper}>
                <Box className={styles.dashboardWidgetBtnWrapper} >

                  <Box className={styles.dashboardWidgetBtnLeftWrapper}>
                    <IconButton size="small">
                      <DragIndicatorIcon className="drag-handle" />
                    </IconButton>
                    <Typography className={styles.dashboardWidgetTitle} variant="h6">{widget.title}</Typography>
                  </Box>

                  <Box className={styles.dashboardWidgetBtnRightWrapper} >
                    <Box>
                      <IconButton onClick={() => handleOnRefresh(widget.i)}>
                        <RefreshIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOnRemove(widget.i)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>


                </Box>
                <Box className={styles.widgetWrapper}>
                  {renderWidgetContent(widget)}
                </Box>
              </Paper>
              {loadingWidgetId === widget.i && (
                <Box
                  className={styles.dashboardWigetLoadingIndicator}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          ))}
        </GridLayout>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {errorMessages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </Alert>
      </Snackbar>


      <Dialog open={longPressDialogOpen} onClose={() => setlongPressDialogOpen(false)}>
        <DialogTitle className={styles.dialogTitle}>Rearrange Widgets</DialogTitle>
        <DialogContent>
          <p>Would you like to rearrange your widgets?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setlongPressDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRearrangeWidgets} color="primary">
            Rearrange
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
