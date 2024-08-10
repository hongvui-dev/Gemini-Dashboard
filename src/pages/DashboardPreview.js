import React, { useEffect, useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from '../styles/components.module.css';
import { Container, Box, Paper, Typography, IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, DragIndicator as DragIndicatorIcon} from '@mui/icons-material';
import FlashcardContainer from '../widgets/FlashcardContainer';
import QuizContainer from '../widgets/QuizContainer';
import Text from '../widgets/Text';
import Question from '../widgets/Question';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../utils/authProvider';
import { getUserRef, getData, getUserPublicWidgetRef, getUserPublicWidgetsRef } from '../utils/databaseCRUD';
import { apiUrl } from '../utils/envConfig';
import { findNextAvailablePosition, getValidToken, fetchWidgetData } from '../utils/helper';


const DashboardPreview = () => {
  const [widgets, setWidgets] = useState([]);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loadingWidgetId, setLoadingWidgetId] = useState(null);

  const { currentUser } = useAuth();
  const userId = currentUser.uid;

  const location = useLocation();

  //Get query param values
  const queryParams = new URLSearchParams(location.search);
  const widgetId = queryParams.get('widgetId');
  const pageId = queryParams.get('pageId');
  const type = queryParams.get('type');


  useEffect(() => {
    fetchWidgets()
  }, [])

//Get user widgets
const fetchWidgets = async () => {
  

  const userIdToken = await getValidToken(currentUser);


  if (currentUser) {

    //Load specific widget from local storage if previewing from builder
    const previewWidget = JSON.parse(localStorage.getItem('geminiDashboardPreviewWidget'));
    const previewTemplate = JSON.parse(localStorage.getItem('geminiDashboardPreviewTemplate'));

    setLoading(true);

    let userWidgetsRef;
    const userRef = getUserRef(userId);
    const userSnapshot = await getData(userRef)

    const userData = userSnapshot?.val() || {};
    if (userData) {
      setBackgroundUrl(userData.dashboardBackgroundUrl || '');
    }

    if (type === 'user-preview' && previewWidget) {

      try {
        //const snapshot = await get(userWidgetsRef);
        const widgetsData = [];
        const loadedLayout = [];
        const fetchPromises = [];

        let snapshotVal = [previewWidget];

        //call to gemini endpoint
        var count = 1;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


        const updatedLayout = [...loadedLayout];  
        
        for (const value of snapshotVal) {
          let widget = { ...value, i: count };
        
          if (!widget.content) {
            const fetchPromise = delay(count * 0)  
              .then(() => fetchWidgetData(widget, userIdToken, apiUrl, showErrorSnackbar))
              .then(content => {
                Object.assign(widget, { content });
        
                const position = findNextAvailablePosition(widget, updatedLayout);
                updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
                widgetsData.push(widget);
                setWidgets(prevWidgets => [...prevWidgets, widget]);
              })
        
            fetchPromises.push(fetchPromise);
          } else {
            const position = findNextAvailablePosition(widget, updatedLayout);
            updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
            widgetsData.push(widget);
            setWidgets(prevWidgets => [...prevWidgets, widget]);  
          }
        
          count++;
        }
        
        Promise.all(fetchPromises)
          .finally(() => {
            setLayout(updatedLayout);
            setLoading(false);
          });

      } catch (error) {
        const errorResponse = error.response?.data || {};

        showErrorSnackbar(errorResponse);

        console.error(`Error getting data for widget:`, error);
      }



    } else if (type === 'template-preview' && previewTemplate) {




      try {
        //const snapshot = await get(userWidgetsRef);
        const widgetsData = [];
        const loadedLayout = [];
        const fetchPromises = [];

        let snapshotVal = previewTemplate;

        //call to gemini endpoint
        var count = 1;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


        const updatedLayout = [...loadedLayout];  
        
        for (const value of snapshotVal) {
          let widget = { ...value, i: count };
        
          if (!widget.content) {
            const fetchPromise = delay(count * 0)  
              .then(() => fetchWidgetData(widget, userIdToken, apiUrl, showErrorSnackbar))
              .then(content => {
                Object.assign(widget, { content });
        
                const position = findNextAvailablePosition(widget, updatedLayout);
                updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
                widgetsData.push(widget);
                setWidgets(prevWidgets => [...prevWidgets, widget]);
              })
        
            fetchPromises.push(fetchPromise);
          } else {
            const position = findNextAvailablePosition(widget, updatedLayout);
            updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
            widgetsData.push(widget);
            setWidgets(prevWidgets => [...prevWidgets, widget]);  
          }
        
          count++;
        }
        
        Promise.all(fetchPromises)
          .finally(() => {
            setLayout(updatedLayout);
            setLoading(false);
          });

      } catch (error) {
        const errorResponse = error.response?.data || {};

        showErrorSnackbar(errorResponse);

        console.error(`Error getting data for widget:`, error);
      }
    } else {
      
      if (widgetId) {


        userWidgetsRef = getUserPublicWidgetRef(pageId, widgetId);
        //userWidgetsRef = ref(database, `publicPages/${pageId}/widgets/${widgetId}`);
      } else if (pageId) {
        userWidgetsRef = getUserPublicWidgetsRef(pageId);
        //userWidgetsRef = ref(database, `publicPages/${pageId}/widgets`);
      }

      const userRef = getUserRef(userId);

      const [userSnapshot, snapshot] = await Promise.all([
        getData(userRef),
        getData(userWidgetsRef),
      ]);

      const userData = userSnapshot ? userSnapshot.val() : {};
      if (userData) {
        setBackgroundUrl(userData.dashboardBackgroundUrl || '');
      }


      try {
        //const snapshot = await get(userWidgetsRef);
        const widgetsData = [];
        const loadedLayout = [];
        const fetchPromises = [];


        let snapshotVal = snapshot ? snapshot.val() : {};
        if (widgetId) {
          snapshotVal = { [widgetId]: snapshot.val() }
        }

        let widgetsArray = []
        for (const [key, value] of Object.entries(snapshotVal)) {
          let widget = { ...value, i: key };
          widgetsArray.push(widget)
        }


        //call to gemini endpoint
        var count = 1;

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


        const updatedLayout = [...loadedLayout];  
        
        for (const currWidget of widgetsArray) {
          let widget = { ...currWidget, i: currWidget.i };
        
          if (!widget.content) {
            const fetchPromise = delay(count * 0)  
              .then(() => fetchWidgetData(widget, userIdToken, apiUrl, showErrorSnackbar))
              .then(content => {
                Object.assign(widget, { content });
        
                const position = findNextAvailablePosition(widget, updatedLayout);
                updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
                widgetsData.push(widget);
                setWidgets(prevWidgets => [...prevWidgets, widget]);
              })
        
            fetchPromises.push(fetchPromise);
          } else {
            const position = findNextAvailablePosition(widget, updatedLayout);
            updatedLayout.push({ ...widget, x: position.x, y: position.y });
        
            widgetsData.push(widget);
            setWidgets(prevWidgets => [...prevWidgets, widget]);  
          }
        
          count++;
        }
        
        Promise.all(fetchPromises)
          .finally(() => {
            setLayout(updatedLayout);
            setLoading(false);
          });

      } catch (error) {
        const errorResponse = error.response?.data || {};

        showErrorSnackbar(errorResponse);

        console.error(`Error getting data for widget:`, error);
      }



    }


  }
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
  
  //Refresh widget


  //When user rearrange widgets
  const handleLayoutChange = (newLayout) => {

    const isMobile = window.innerWidth <= 768;

    const columns = isMobile ? 1 : 3;
    const width = 12; 
    const rowHeight = 200;
  
    const widgetWidth = width / columns; 
    const widgetHeight = rowHeight; 
  
    const updatedLayout = newLayout.map((item, index) => {
    
      const x = isMobile ? 0 : (index % columns) * widgetWidth; 
      const y = Math.floor(index / columns) * widgetHeight;
  
      return {
        ...item,
        x,
        y,
        w: isMobile ? width : 4, 
        h: 3 
      };
    });
  
    setLayout(updatedLayout);
    
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
            <Box key={widget.i} sx={{ zIndex: 9, opacity: widget.isTranslucent ? 0.9 : 1 }} >
              <Paper className={styles.dashboardPaperWrapper}>
                <Box className={styles.dashboardWidgetBtnWrapper}>

                  <Box className={styles.dashboardWidgetBtnLeftWrapper}>
                    <IconButton size="small">
                    <DragIndicatorIcon className="drag-handle" />
                    </IconButton>
                    <Typography className={styles.dashboardWidgetTitle} variant="h6">{widget.title}</Typography>
                  </Box>

                  <Box className={styles.dashboardWidgetBtnRightWrapper} >
                    <Box>

                      <IconButton >
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
    </Container>
  );
};

export default DashboardPreview;
