import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Container, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Typography, MenuItem, Button, Card, CardContent, Checkbox, Menu } from '@mui/material';
import { AddCircle, RemoveCircle, Settings, Delete, GetApp } from '@mui/icons-material';
import { ref, child } from 'firebase/database';
import { database } from '../utils/firebaseConfig';
import { getUserRef, getUserWidgetRef, getData, getUserWidgetsRef, updateData, pushOnly, pushData, removeData, setData, getUserPublicWidgetRef, getUserPublicWidgetsRef, getUserPublicPageId, getUserPublicPageRef } from '../utils/databaseCRUD';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authProvider';
import { dynamicTextTruncate } from '../utils/helper';
import WidgetForm from '../components/WidgetForm';
import styles from '../styles/components.module.css'

const Widgets = () => {


  const formRef = useRef();

  const { currentUser } = useAuth();
  const userId = currentUser.uid;

  const [widgets, setWidgets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWidgets, setFilteredWidgets] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);


  const [anchorEl, setAnchorEl] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(true);

  const [isWidgetPublished, setIsWidgetPublished] = useState(false);

  const [publishingDialogOpen, setPublishingDialogOpen] = useState(false);


  const navigate = useNavigate();



  useEffect(() => {
    if (publishingDialogOpen) {
      // Fetch the widgets when the dialog is opened
      getUserWidgets()
    }
  }, [publishingDialogOpen, userId]);


   // Fetch the widgets 
  const getUserWidgets = async () => {
    if (currentUser) {
      setLoading(true);

      const userRef = getUserRef(userId);
      const userSnapshot = await getData(userRef);
      const user = userSnapshot.val();
      if (user.templateName) {
        setTemplateName(user.templateName)
      }

      const [publicPageSnapshot, userWidgetsSnapshot] = await Promise.all([
        getData(getUserPublicPageId(userId)),
        getData(getUserWidgetsRef(userId))
      ]);

      const userWidgets = userWidgetsSnapshot ? userWidgetsSnapshot.val() : null;
      const publicPageId = publicPageSnapshot ? publicPageSnapshot.val() : null;

      if (publicPageId != null) {


        const publicPageWidgetsSnapshot = await getData(getUserPublicWidgetsRef(publicPageId));

       
        if (publicPageWidgetsSnapshot !== null) {
          const publicPageWidgetsData = publicPageWidgetsSnapshot ? publicPageWidgetsSnapshot.val() : {};

          const mergedWidgetsData = Object.keys(userWidgets).map(widgetId => ({
            ...userWidgets[widgetId],
            id: widgetId,
            likes: (publicPageWidgetsData[widgetId]?.likes || null)
          }));
      
          setWidgets(mergedWidgetsData);
        } else {
          const mergedWidgetsData = Object.keys(userWidgets).map(widgetId => ({
            ...userWidgets[widgetId],
            id: widgetId,
          }));
      
          setWidgets(mergedWidgetsData);
        }

   
      } else {

        if (userWidgets != null) {
          const mergedWidgetsData = Object.keys(userWidgets).map(widgetId => ({
            ...userWidgets[widgetId],
            id: widgetId,
          }));
      
          setWidgets(mergedWidgetsData);
        } else {
          setWidgets([]);
        }


      }

      setLoading(false);


    }
  }

  useEffect(() => {

    

    getUserWidgets();
  }, [currentUser]);


  useEffect(() => {
    if (searchQuery) {
      setFilteredWidgets(
        widgets.filter(
          (widget) =>
            widget.systemInstructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
            widget.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            widget.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredWidgets(widgets);
    }
  }, [widgets, searchQuery]);


  const handleGoToCreateWidgetPage = () => {
    navigate('/create-widget');
  }

  //Add a widget to dashboard
  const handleAddToDashboard = async (widgetId) => {
    if (currentUser) {
    
      const widgetRef = getUserWidgetRef(userId, widgetId);
      await updateData(widgetRef, { isInDashboard: true });

      setWidgets(widgets.map(widget =>
        widget.id === widgetId ? { ...widget, isInDashboard: true } : widget
      ));
    }
  };

  //Remove a widget from dashboard
  const handleRemoveFromDashboard = async (widgetId) => {
    if (currentUser) {
   
      const widgetRef = getUserWidgetRef(userId, widgetId);
      await updateData(widgetRef, { isInDashboard: false });

      setWidgets(widgets.map(widget =>
        widget.id === widgetId ? { ...widget, isInDashboard: false } : widget
      ));
    }
  };

  //Delete a widget
  const handleDeleteWidget = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      if (currentUser) {
        try {

          const widgetRef = getUserWidgetRef(userId, widgetId);

          await removeData(widgetRef);

          setWidgets(widgets.filter(widget => widget.id !== widgetId));
          setFilteredWidgets(filteredWidgets.filter(widget => widget.id !== widgetId));


          //Delete from public pages too

          const userRef = getUserRef(userId);
          const userSnapshot = await getData(userRef);
          const userData = userSnapshot ? userSnapshot.val() : {};


          if (userData && userData.publicPageId) {
      
            const publicWidgetRef = getUserPublicWidgetRef(userData.publicPageId, widgetId);
    
            try {
                const snapshot = await getData(publicWidgetRef);
                if (snapshot.exists()) {
                    await removeData(publicWidgetRef);
                } 
            } catch (error) {
                console.error('Error deleting widget:', error);
            }
          
          }

          //Check if got any widgets published in community
          

          const widgetsRef = getUserWidgetsRef(userId);
          const userWidgetsSnapshot = await getData(widgetsRef)
          const userWidgets = userWidgetsSnapshot ? userWidgetsSnapshot.val() : null;
          if (userWidgets != null) {
            let anyWidgetPublished = false;

            Object.keys(userWidgets).map((key) => {
              const widget = userWidgets[key];
              
              
              if (widget.isPublishedAsWidget || widget.isPublishedAsTemplateWidget) {
                anyWidgetPublished = true;
              }
            });

  
            if (!anyWidgetPublished || Object.keys(userWidgets).length <= 0) {
              const publicPageRef = getUserPublicPageRef(userData.publicPageId);
              await removeData(publicPageRef); 
  
              const getUserPublicPageIdRef = getUserPublicPageId(userId);
              await removeData(getUserPublicPageIdRef); 
            }
          } else {
            const publicPageRef = getUserPublicPageRef(userData.publicPageId);
            await removeData(publicPageRef); 

            const getUserPublicPageIdRef = getUserPublicPageId(userId);
            await removeData(getUserPublicPageIdRef); 
          }

          

        } catch (error) {
          console.error(`Error deleting widget with ID ${widgetId}:`, error);
        }
      }
    }

  };





  const handleClose = () => {
    setOpen(false);
    setSelectedWidget(null);
  };


  //Download widget's schema and allow exclusion of certain key
  const handleDownload = (widgets, excludeKeys = []) => {
    const widgetArray = Array.isArray(widgets) ? widgets : [widgets];

    const filteredWidgets = widgetArray.map(widget => {
      return Object.keys(widget).reduce((acc, key) => {
        if (!excludeKeys.includes(key)) {
          acc[key] = widget[key];
        }
        return acc;
      }, {});
    });

    const json = JSON.stringify(filteredWidgets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = widgetArray.length === 1 ? `${widgetArray[0].title}.json` : 'widgets.json';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  //Export all widgets schema into 1 json file
  const exportAllWidgets = () => {
    handleDownload(widgets, ['id', 'content', 'likes', 'pageId', 'isPublishedAsWidget', 'isPublishedAsTemplateWidget', 'questionAnswer']);
    handleMenuClose();
  };

  //Export all dashboard widgets schema into 1 json file
  const exportDashboardWidgets = () => {
    const dashboardWidgets = widgets.filter(widget => widget.isInDashboard);
    handleDownload(dashboardWidgets, ['id', 'content', 'likes', 'pageId', 'isPublishedAsWidget', 'isPublishedAsTemplateWidget', 'questionAnswer']);
    handleMenuClose();
  };



  const handleImportDialogOpen = () => {
    setImportDialogOpen(true);
  };

  const handleImportDialogClose = () => {
    setImportDialogOpen(false);
    setError('');
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json) && json.length > 6) {
          setError('The file contains more than six items. Please upload a file with six or fewer items.');
        } else {
          const isValid = validateJson(json);
          if (isValid) {
            pushToFirebase(json);
            handleImportDialogClose();
            getUserWidgets();
          }
        }
      } catch (err) {
        setError('Invalid JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };


  const typeRequiredFields = {
    'flashcard': ['flashcardKey', 'flashcardValue'], 
    'text': ['textWidgetValue'], 
    'quiz': ['quizKey', 'quizValue'], 
    'question': ['questionKey', 'questionValue'], 
  };

  const validateJson = (json) => {

    const requiredKeys = ['title', 'systemInstructions', 'creativityLevel', 'prompt'];
    const validKeys = ['title', 'systemInstructions', 'creativityLevel', 'prompt', 'type', 'flashcardKey', 'flashcardValue', 'questionKey', 'questionValue', 'quizKey', 'quizValue', 'textWidgetValue', 'isInDashboard', 'isTranslucent', 'isQuickRefresh', 'customRefreshPrompt', 'w', 'h', 'x', 'y', 'mobW', 'mobH', 'mobX', 'mobY'];
    for (const item of json) {
      if (typeof item !== 'object' || Array.isArray(item)) {
        setError('Invalid JSON structure.');
        return false;
      }

      for (const key of requiredKeys) {
        if (!(key in item)) {
          setError(`Missing required key: ${key}`);
          return false;
        }
      }

      //Required fields based on type
      const type = item.type;
      if (!typeRequiredFields[type]) {
        setError(`Unknown type: ${type}`);
        return false;
      }
      const conditionRequiredKeys = typeRequiredFields[type];
  
      for (const key of conditionRequiredKeys) {
        if (!(key in item)) {
          setError(`Missing required key for type '${type}': ${key}`);
          return false;
        }
      }

      for (const key of Object.keys(item)) {
        if (!validKeys.includes(key)) {
          setError(`Invalid key found: ${key}`);
          return false;
        }
        if (!validateValue(key, item[key])) {
          setError(`Invalid value for key: ${key}`);
          return false;
        }
      }
    }
    return true;
  };


  const validateValue = (key, value) => {
    switch (key) {
      case 'title':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 50 ;
      case 'systemInstructions':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'prompt':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'customRefreshPrompt':
        return typeof value === 'string' && value.length <= 500 ;
      case 'type':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 200 ;
      case 'flashcardKey':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'flashcardValue':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'questionKey':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'questionValue':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'quizKey':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'quizValue':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'textWidgetValue':
        return typeof value === 'string' && value.trim() !== '' && value.length >=3 && value.length <= 500 ;
      case 'creativityLevel':
        return typeof value === 'number' && value >= 0 && value <= 1 ;
      case 'w':
      case 'h':
      case 'x':
      case 'y':
      case 'mobW':
      case 'mobH':
      case 'mobX':
      case 'mobY':
        return typeof value === 'number';
      case 'isInDashboard':
      case 'isQuickRefresh':
      case 'isTranslucent':
        return typeof value === 'boolean';
      default:
        return false;
    }
  };

  const pushToFirebase = (json) => {
    
    const userWidgetsRef = getUserWidgetsRef(userId);

    json.forEach((item) => {
      pushData(userWidgetsRef, item)
    });
  };



  const setFormRef = useCallback((ref) => {
    formRef.current = ref;
  }, []);



  //Manage publishing
  const handlePublishingDialogCheckboxChange = (widgetId, field) => (event) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === widgetId ? { ...widget, [field]: event.target.checked } : widget
      )
    );
  };

  const handlePublishingDialogUpdate = async () => {
    const userRef = getUserRef(userId);
    const userSnapshot = await getData(userRef);
    const user = userSnapshot.val();

    let publicPageId;

    if (user && user.publicPageId) {
      publicPageId = user.publicPageId;

     
    } else {
      const newPublicPageIdRef = await pushOnly(child(ref(database), 'publicPages'));

      publicPageId = newPublicPageIdRef.key;


      //await updateData(userRef, { publicPageId, templateName });

      await updateData(userRef, {
        publicPageId,
        templateName
      })


      await setData(ref(database, `publicPages/${publicPageId}`), {
        creatorUid: userId,
        displayName: user.displayName,
        templateName: templateName,
      });

    }


    const publicPageWidgetsRef = getUserPublicWidgetsRef(publicPageId);

    const publicPageWidgetsSnapshot = await getData(publicPageWidgetsRef);

    const publicPageWidgets = publicPageWidgetsSnapshot? publicPageWidgetsSnapshot.val() : {};

    const updates = {};
    let anyWidgetPublished = false;

    for (const widget of widgets) {
      const widgetRef = getUserWidgetRef(userId, widget.id);
      const updateObject = {
        isPublishedAsWidget: widget.isPublishedAsWidget || false,
        isPublishedAsTemplateWidget: widget.isPublishedAsTemplateWidget || false,
      };
      await updateData(widgetRef, updateObject);

      if (widget.isPublishedAsWidget || widget.isPublishedAsTemplateWidget) {
        updates[widget.id] = widget;
        anyWidgetPublished = true;
      } else if (publicPageWidgets[widget.id]) {
        updates[widget.id] = null; 
      }
    }

    await updateData(publicPageWidgetsRef, updates);

    if (!anyWidgetPublished) {
      const publicPageRef = getUserPublicPageRef(publicPageId);
      await removeData(publicPageRef); 

      const getUserPublicPageIdRef = getUserPublicPageId(userId);
      await removeData(getUserPublicPageIdRef); 
    }

    handlePublishingDialogClose();
  };


  const handlePublishingDialogOpen = () => {
    setPublishingDialogOpen(true);
  };

  const handlePublishingDialogClose = () => {
    setPublishingDialogOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>

        <Box className={styles.widgetsWrapper} >

          <Box>
            <Button
 
              variant="contained"
              color="primary"
              onClick={handleGoToCreateWidgetPage}
            >
              Create Widget
            </Button>
            
          </Box>
          <Box className={styles.marginLeft15}>
            <Button
 
              variant="contained"
              color="primary"
              onClick={handlePublishingDialogOpen}
            >
              Manage Publishing
            </Button>
            
          </Box>

          <Box className={styles.marginLeft15}>
            <Button
              aria-controls="import-menu"
              aria-haspopup="true"
              variant="contained"
              color="primary"
              onClick={handleImportDialogOpen}
            >
              Import
            </Button>

          </Box>
          <Box className={styles.marginLeft15}>
            <Button
              aria-controls="export-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              variant="contained"
              color="primary"
            >
              Export
            </Button>
            <Menu
              id="export-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={exportAllWidgets}>Export All Widgets</MenuItem>
              <MenuItem onClick={exportDashboardWidgets}>Export All Dashboard Widgets</MenuItem>
            </Menu>
          </Box>

        </Box>
        <Box className={styles.widgetsSearchWrapper} >
          <TextField
            fullWidth
            label="Search Widgets"
            variant="outlined"
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Grid container spacing={2}>
          {filteredWidgets.map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget.id}>
              <Card className={styles.widgetsCardWrapper}>
                <CardContent>
                  <Box className={styles.widgetsInnerWrapper} >
                    <Typography variant="h5" component="h5" className={styles.bold}>
                      {dynamicTextTruncate(widget.title, 20)}
                    </Typography>
        
                    <IconButton color="primary" onClick={() => handleDownload(widget, ['id', 'content', 'likes', 'pageId', 'isPublishedAsWidget', 'isPublishedAsTemplateWidget', 'questionAnswer'])}>
                      <GetApp />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {dynamicTextTruncate(widget.prompt, 80)}
                  </Typography>
                  {widget.likes != null && (
                    <Typography variant="body2" color="textSecondary">
                      Likes: {widget.likes}
                    </Typography>
                  )}
                </CardContent>
                <Box className={styles.widgetBtnWrapper} >
                  <IconButton
                    color="primary"
                    onClick={() => handleAddToDashboard(widget.id)}
                    disabled={widget.isInDashboard}
                  >
                    <AddCircle />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveFromDashboard(widget.id)}
                    disabled={!widget.isInDashboard}
                  >
                    <RemoveCircle />
                  </IconButton>
                  <IconButton color="primary" onClick={() => formRef.current.cusOpen(widget)}>
                    <Settings />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteWidget(widget.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>


      <WidgetForm
        ref={setFormRef}
        selectedWidget={selectedWidget}
        setSelectedWidget={setSelectedWidget}
        handleClose={handleClose}
        setOpen={setOpen}
        isDialog={true}
        open={open}
        getUserWidgets={getUserWidgets}
      ></WidgetForm>



      <Dialog open={importDialogOpen} onClose={handleImportDialogClose}>
        <DialogTitle className={styles.dialogTitle}>Import Widgets</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            className={styles.widgetDialogDropZone}

            color="textSecondary"
          >
            Drag and drop a JSON file here, or click to select a file.
            <input
              type="file"
              accept="application/json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="fileInput"
            />
          </Box>
          {error && <Typography color="error" className={styles.marginTop20}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImportDialogClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={publishingDialogOpen} onClose={handlePublishingDialogClose} maxWidth="md" fullWidth>
        <DialogTitle className={styles.dialogTitle}>Manage Publishing</DialogTitle>
        <DialogContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold' }}>
          <div style={{ width: '33%' }}>Widget Title</div>
          <div style={{ width: '33%', textAlign: 'center' }}>Publish as Widget</div>
          <div style={{ width: '33%', textAlign: 'center' }}>Publish as Template Widget</div>
        </div>
        {widgets.map((widget) => (
          <div key={widget.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ width: '33%' }}>{widget.title}</div>
            <div style={{ width: '33%', textAlign: 'center' }}>
              <Checkbox
                checked={widget.isPublishedAsWidget || false}
                onChange={handlePublishingDialogCheckboxChange(widget.id, 'isPublishedAsWidget')}
              />
            </div>
            <div style={{ width: '33%', textAlign: 'center' }}>
              <Checkbox
                checked={widget.isPublishedAsTemplateWidget || false}
                onChange={handlePublishingDialogCheckboxChange(widget.id, 'isPublishedAsTemplateWidget')}
              />
            </div>
          </div>
         
        ))}
        <TextField
          label="Template Name"
          fullWidth
          style={{ marginTop: '20px' }}
          variant="outlined"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </DialogContent>
        <DialogActions>
          <Button onClick={handlePublishingDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePublishingDialogUpdate} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box
        className={styles.loadingWrapper}
        >
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default Widgets;

