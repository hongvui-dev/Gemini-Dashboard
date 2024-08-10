import React, { useState, useEffect, useRef } from 'react';
import { ref, query, limitToFirst, startAfter, get, orderByKey } from 'firebase/database';
import { Container, Box, Tabs, Tab, TextField, Button, CircularProgress, Typography, IconButton, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert, FormControlLabel, Checkbox } from '@mui/material';
import { Search as SearchIcon, ThumbUp as ThumbUpIcon, ThumbUpOffAlt as ThumbUpOffAltIcon, Visibility as PreviewIcon, Add as AddIcon, Close as CloseIcon, } from '@mui/icons-material';
import styles from '../styles/components.module.css';
import { dynamicTextTruncate } from '../utils/helper';
import { database } from '../utils/firebaseConfig';
import { useAuth } from '../utils/authProvider';
import { getUserWidgetRef, getData, getUserWidgetsRef, updateData, pushData, removeData, getPublicPages } from '../utils/databaseCRUD';
import { useNavigate } from 'react-router-dom';



const Community = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQueryWidgets, setSearchQueryWidgets] = useState('');
  const [searchQueryTemplates, setSearchQueryTemplates] = useState('');
  const [searchQueryBuiltInTemplates, setSearchQueryBuiltInTemplates] = useState('');
  const [widgets, setWidgets] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [widgetsEnd, setWidgetsEnd] = useState(false);
  const [templatesEnd, setTemplatesEnd] = useState(false);
  const [widgetLastKey, setWidgetLastKey] = useState(null);
  const [templateLastKey, setTemplateLastKey] = useState(null);
  const [totalWidgets, setTotalWidgets] = useState([]);
  const [totalTemplates, setTotalTemplates] = useState([]);
  const [totalBuiltInTemplates, setTotalBuiltInTemplates] = useState([]);
  const [likedWidgets, setLikedWidgets] = useState(new Set());
  const [likedTemplates, setLikedTemplates] = useState(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSearchCancelled, setIsSearchCancelled] = useState(false);
  const [widgetsDialogOpen, setWidgetsDialogOpen] = useState(false);
  const [userWidgets, setUserWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarErrorMessage, setSnackbarErrorMessage] = useState('');
  const [widgetsToDelete, setWidgetsToDelete] = useState([]);
  const [widgetsToDeleteText, setWidgetsToDeleteText] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [builtInTemplates, setBuiltInTemplates] = useState([]);

  const INITIAL_ITEMS_PER_BATCH = 50;
  const ADDITIONAL_ITEMS_PER_LOAD = 10;

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser.uid;
  

  const searchRef = useRef({ widgets: [], templates: [], builtInTemplates: [] });

  
  useEffect(() => {
    //Get user widgets
    fetchUserWidgets();
  }, [currentUser]);

  useEffect(() => {
    //Fetch tabs content
    if (tabValue === 0 && widgets.length === 0) {
      fetchWidgets();
    } else if (tabValue === 1 && templates.length === 0) {
      fetchTemplates();
    } else if (tabValue === 2 && builtInTemplates.length === 0) {
      loadBuiltInTemplates();
    }
  }, [tabValue, builtInTemplates.length, templates.length, widgets.length]);


  useEffect(() => {
    //Search ref
    searchRef.current.widgets = totalWidgets;
    searchRef.current.templates = totalTemplates;
    searchRef.current.builtInTemplates = totalBuiltInTemplates;
  }, [totalWidgets, totalTemplates, totalBuiltInTemplates]);

  const fetchUserWidgets = async () => {
    if (currentUser) {
      //Get user widgets in case need to delete later
      const userWidgetsRef = getUserWidgetsRef(userId);
      const snapshot = await getData(userWidgetsRef);
      const userWidgetsData = snapshot.val();
      setUserWidgets(userWidgetsData ? Object.entries(userWidgetsData) : []);
    }
  };


  //Let user like if never this widget was never liked by this user before
  const handleLike = async (pageId, myWidgetId, type) => {

    const userLikedItemsRef = ref(database, `users/${userId}/liked${type === 'widget' ? 'Widgets' : 'Templates'}`);

    const itemRef = ref(database, `publicPages/${pageId}${type === 'widget' ? `/widgets/${myWidgetId}` : ''}`);
    const [itemSnapshot, userLikedItemsSnapshot] = await Promise.all([
      getData(itemRef),
      getData(userLikedItemsRef)
    ]);

    const item = itemSnapshot ? itemSnapshot.val() : {};
    const userLikedItems = userLikedItemsSnapshot ? userLikedItemsSnapshot.val() : {};


    if (type === 'widget' && !userLikedItems[myWidgetId]) {
      const newLikes = (item.likes || 0) + 1;
      await updateData(itemRef, { likes: newLikes });
      await updateData(userLikedItemsRef, { [myWidgetId]: true });

      setWidgets(prevWidgets =>
        prevWidgets.map(widget =>
          widget.id === myWidgetId
            ? { ...widget, likes: newLikes }
            : widget
        )
      );
    } else if (type === 'template' && !userLikedItems[pageId]) {
      const newLikes = (item.likes || 0) + 1;
      await updateData(itemRef, { likes: newLikes });

      await updateData(userLikedItemsRef, { [pageId]: true });


      setTemplates(prevTemplates =>
        prevTemplates.map(template =>
          template.pageId === pageId
            ? { ...template, likes: newLikes }
            : template
        )
      );
    }
  };

  //Widgets load more
  const fetchWidgets = async (loadMore = false) => {

    setLoading(true);
    let publicPagesQuery = query(
      getPublicPages(),
      orderByKey(),
      limitToFirst(INITIAL_ITEMS_PER_BATCH)
    );




    if (loadMore && widgetLastKey) {
      publicPagesQuery = query(
        getPublicPages(),
        orderByKey(),
        startAfter(widgetLastKey),
        limitToFirst(ADDITIONAL_ITEMS_PER_LOAD)
      );
    }
    

    const snapshot = await get(publicPagesQuery);
    const pagesData = snapshot.val();

    let widgetsArray = [];


    if (pagesData) {
      for (const pageId in pagesData) {
        const page = pagesData[pageId];
        if (page.widgets) {
          const widgets = page.widgets;

          for (const widgetId in widgets) {
            const widget = widgets[widgetId];
            if (widget.isPublishedAsWidget) {
              widgetsArray.push({ ...widget, id: widgetId, pageId, displayName: page.displayName });
            }
          }
        }
      }

      widgetsArray.sort((a, b) => (b.likes || 0) - (a.likes || 0));

      setWidgets([...widgets, ...widgetsArray]);

      setTotalWidgets([...widgets, ...widgetsArray]);



      const lastKey = Object.keys(pagesData).length > 0 ? Object.keys(pagesData).pop() : null;

      setWidgetLastKey(lastKey);

      if (widgetsArray.length <= 0 && lastKey) {
        fetchWidgets(true);
      }


      setWidgetsEnd(false);

    } else {
      setWidgetsEnd(true);

    }


    setLoading(false);
  };

  //Templates load more
  const fetchTemplates = async (loadMore = false) => {
    setLoading(true);

    let templatesQuery = query(
      getPublicPages(),
      orderByKey(),
      limitToFirst(INITIAL_ITEMS_PER_BATCH)
    );

    if (loadMore && templateLastKey) {
      templatesQuery = query(
        getPublicPages(),
        orderByKey(),
        startAfter(templateLastKey),
        limitToFirst(ADDITIONAL_ITEMS_PER_LOAD)
      );
    }

    const snapshot = await get(templatesQuery);
    const pagesData = snapshot.val();


    let templatesArray = [];

    if (pagesData) {


      for (const pageId in pagesData) {

        const page = pagesData[pageId];

        let dashboardWidgetsFiltered = [];

        if (page.widgets) {
          const widgets = page.widgets;

          for(const widgetId in widgets) {
            const widget = widgets[widgetId];
            if (widget.isPublishedAsTemplateWidget) {
              dashboardWidgetsFiltered.push(widget);
            }
          }
        }



        templatesArray.push({ widgets: dashboardWidgetsFiltered, templateName: page.templateName || "", pageId, displayName: page.displayName, likes: page.likes });
      
      }

      templatesArray.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  
      setTemplates([...templates, ...templatesArray]);

      setTotalTemplates([...templates, ...templatesArray]);

      const lastKey = Object.keys(pagesData).length > 0 ? Object.keys(pagesData).pop() : null;
      setTemplateLastKey(lastKey);

      if (templatesArray.length <= 0 && lastKey) {
        fetchTemplates(true);
      }

      setTemplatesEnd(false);
    } else {

      setTemplatesEnd(true);
    }

    setLoading(false);
  };

  //Load built-in templates
  const loadBuiltInTemplates = async () => {
    setLoading(true);
    try {
      const templateFiles = ['template1.json', 'template2.json', 'template3.json'];
      const templatePromises = templateFiles.map(file => fetch(`/templates/${file}`).then(res => res.json()));
      const builtInTemplatesData = await Promise.all(templatePromises);
      setBuiltInTemplates(builtInTemplatesData);
      setTotalBuiltInTemplates(builtInTemplatesData)

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error loading built-in templates:', error);
    } 
  };

  //Search through widgets, may remove in future
  const searchWidgets = async () => {
    if (!searchQueryWidgets) return;

    setSnackbarMessage('Searching...');
    setSnackbarOpen(true);
    setIsSearchCancelled(false);

    let searchResults = [];
    const widgetsToSearch = searchRef.current.widgets;

    for (const widget of widgetsToSearch) {
      if (
        widget.title.toLowerCase().includes(searchQueryWidgets.toLowerCase()) ||
        widget.systemInstructions?.toLowerCase().includes(searchQueryWidgets.toLowerCase()) ||
        widget.prompt?.toLowerCase().includes(searchQueryWidgets.toLowerCase())
      ) {
        searchResults.push(widget);
      }
    }

    setIsSearchCancelled(true);
    setSnackbarOpen(false);

    //searchResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setWidgets(searchResults);

    return searchResults;
  };

  //Search through templates, may remove in future
  const searchTemplates = async () => {
    if (!searchQueryTemplates) return;

    setSnackbarMessage('Searching...');
    setSnackbarOpen(true);
    setIsSearchCancelled(false);

    let searchResults = [];
    const templatesToSearch = searchRef.current.templates;


    for (const template of templatesToSearch) {

      if (
        template.templateName.toLowerCase().includes(searchQueryTemplates.toLowerCase()) ||
        template.widgets.some(widget =>
          widget.title?.toLowerCase().includes(searchQueryTemplates.toLowerCase()) ||
          widget.systemInstructions?.toLowerCase().includes(searchQueryTemplates.toLowerCase()) ||
          widget.prompt?.toLowerCase().includes(searchQueryTemplates.toLowerCase())
        )
      ) {
        searchResults.push(template);
      }
    }

    setIsSearchCancelled(true);
    setSnackbarOpen(false);

    searchResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setTemplates(searchResults);

    return searchResults;
  };

  //Search built in templates
  const searchBuiltInTemplates = async () => {



    if (!searchQueryBuiltInTemplates) return;

    setSnackbarMessage('Searching...');
    setSnackbarOpen(true);
    setIsSearchCancelled(false);

    let searchResults = [];
    const templatesToSearch = searchRef.current.builtInTemplates;


    for (const template of templatesToSearch) {

      
      if (
        template.templateName.toLowerCase().includes(searchQueryBuiltInTemplates.toLowerCase()) ||
        template.widgets.some(widget =>
          widget.title?.toLowerCase().includes(searchQueryBuiltInTemplates.toLowerCase()) ||
          widget.systemInstructions?.toLowerCase().includes(searchQueryBuiltInTemplates.toLowerCase()) ||
          widget.prompt?.toLowerCase().includes(searchQueryBuiltInTemplates.toLowerCase())
        )
      ) {
        searchResults.push(template);
      }
    }

    setIsSearchCancelled(true);
    setSnackbarOpen(false);

    searchResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setBuiltInTemplates(searchResults);

    return searchResults;
  };

  //Tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  //Widgets search query
  const handleSearchWidgets = (event) => {
    setSearchQueryWidgets(event.target.value);
  };

  //Templates search query
  const handleSearchTemplates = (event) => {
    setSearchQueryTemplates(event.target.value);
  };

  const handleSearchBuiltInTemplates = (event) => {
    setSearchQueryBuiltInTemplates(event.target.value);
  };

  //Clear search results
  const handleClearSearchResults = () => {
    if (tabValue === 0) {
      setSearchQueryWidgets('');
      setWidgets(totalWidgets);
      //fetchWidgets();
    } else if (tabValue === 1) {
      setSearchQueryTemplates('');
      setTemplates(totalTemplates);
      //fetchTemplates();
    }else if (tabValue === 2) {
      setSearchQueryBuiltInTemplates('');
      setBuiltInTemplates(totalBuiltInTemplates);
    }
  };

  //Widgets load more
  const handleLoadMoreWidgets = () => {
    fetchWidgets(true);
  };

  //Templates load more
  const handleLoadMoreTemplates = () => {
    fetchTemplates(true);
  };

  //Preview widget or template
  const handlePreview = (item, type) => {
    const idParam = type === 'widget' ? `pageId=${item.pageId}&widgetId=${item.id}` : `pageId=${item.pageId}`;
    navigate(`/dashboard-preview?${idParam}`);
  };

  //Preview built-in template
  const handleBuiltInTemplatePreview = (item) => {
    localStorage.setItem('geminiDashboardPreviewTemplate', JSON.stringify(item));
    navigate(`/dashboard-preview?type=template-preview`);
  };

  //Add built-in template widgets to user widget's storage
  const handleBuiltInTemplateAdd = async (template) => {
    setSelectedTemplate(template);

    const userWidgetsRef = getUserWidgetsRef(userId);
    const snapshot = await getData(userWidgetsRef);
    const latestUserWidgets = snapshot.exists() ? Object.entries(snapshot.val()) : [];

    const templateWidgetsCount = template.widgets.length;
    const remainingQuota = 6 - latestUserWidgets.length;

    if (templateWidgetsCount <= remainingQuota) {
      template.widgets.forEach(widget => {
        pushData(userWidgetsRef, widget);
      });
      fetchUserWidgets();
      setSuccessMessage('Template widgets successfully added!');
    } else {
      const widgetsToDeleteCount = templateWidgetsCount - remainingQuota;
      setWidgetsToDeleteText(new Array(widgetsToDeleteCount).fill(false));
      setWidgetsDialogOpen(true);
    }
  };

  //Add widget to user widgets storage
  const handleWidgetAdd = async (widget) => {
    setSelectedWidget(widget);

    const userWidgetsRef = getUserWidgetsRef(userId);
    const snapshot = await getData(userWidgetsRef);
    const latestUserWidgets = snapshot.exists() ? Object.entries(snapshot.val()) : [];


    if (latestUserWidgets.length < 6) {
      const userWidgetsRef = getUserWidgetsRef(userId);
      pushData(userWidgetsRef, widget).then(() => {
        fetchUserWidgets();
        setSuccessMessage('Widget successfully added!');
      });
    } else {
      setWidgetsDialogOpen(true);
    }
  };


  //Let user replace widget so to add more if they have more than 6 widgets
  const handleWidgetReplace = async (oldWidgetId, newWidget) => {
    if (currentUser) {
      const userWidgetsRef = getUserWidgetsRef(userId);
      await removeData(getUserWidgetRef(userId, oldWidgetId));
      await updateData(userWidgetsRef, {
        [newWidget.id]: newWidget,
      });
      fetchUserWidgets();
      setSnackbarMessage('Widget replaced successfully!');
      setSnackbarOpen(true);
    }
  };

  //Close widgets dialog
  const handleWidgetsDialogClose = () => {
    setWidgetsDialogOpen(false);
    setSelectedWidget(null);
  };

  //Reset snackbar
  const handleSnackbarClose = () => {
    setSuccessMessage('');
  };

  //Add template widgets
  const handleTemplateAdd = async (template) => {
    setSelectedTemplate(template);

    const userWidgetsRef = getUserWidgetsRef(userId);
    const snapshot = await getData(userWidgetsRef);
    const latestUserWidgets = snapshot.exists() ? Object.entries(snapshot.val()) : [];

    const templateWidgetsCount = template.widgets.length;
    const remainingQuota = 6 - latestUserWidgets.length;

    if (templateWidgetsCount <= remainingQuota) {
      template.widgets.forEach(widget => {
        pushData(userWidgetsRef, widget);
      });
      fetchUserWidgets();
      setSuccessMessage('Template widgets successfully added!');
    } else {
      const widgetsToDeleteCount = templateWidgetsCount - remainingQuota;
      setWidgetsToDeleteText(new Array(widgetsToDeleteCount).fill(false));
      setWidgetsDialogOpen(true);
    }
  };

  //Add template widgets after user decided to remove what widgets in their storage
  const handleTemplateWidgetsAdd = async () => {
    const userWidgetsRef = getUserWidgetsRef(userId);
    const snapshot = await getData(userWidgetsRef);
    const latestUserWidgets = snapshot.exists() ? Object.entries(snapshot.val()) : [];

    const widgetsToRemove = latestUserWidgets.filter(([id], index) => widgetsToDelete[index]);

    const widgetsToRemoveCount = widgetsToRemove.length;
    const templateWidgetsCount = selectedTemplate.widgets.length;
    const remainingQuota = 6 - latestUserWidgets.length;

    if (widgetsToRemoveCount !== (templateWidgetsCount - remainingQuota)) {
      setSnackbarErrorMessage('The number of widgets selected for removal does not match the required number.');
      return;
    }

    const removePromises = widgetsToRemove.map(([id]) => {
      const widgetRef = getUserWidgetRef(userId, id);
      return removeData(widgetRef);
    });

    await Promise.all(removePromises);

    const addPromises = selectedTemplate.widgets.map(widget => {
      return pushData(userWidgetsRef, widget);
    });

    await Promise.all(addPromises);

    fetchUserWidgets();
    setWidgetsDialogOpen(false);
    setSuccessMessage('Template widgets successfully added!');
  };

  //Checkbox for widgets to be deleted
  const handleWidgetsDeleteCheckboxChange = (index) => {
    const newWidgetsToDelete = [...widgetsToDelete];
    newWidgetsToDelete[index] = !newWidgetsToDelete[index];
    setWidgetsToDelete(newWidgetsToDelete);
  };

  return (
    <Container maxWidth="md">
      <Box>
        <Box className={styles.communityTabWrapper}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Widgets" />
            <Tab label="Templates" />
            <Tab label="Built-In Templates" />
          </Tabs>
        </Box>
        <Box className={styles.communityWrapper} >
          <TextField
            label="Search"
            value={
              tabValue === 0 ? searchQueryWidgets
              : tabValue === 1 ? searchQueryTemplates
              : searchQueryBuiltInTemplates
            }
            onChange={
              tabValue === 0 ? handleSearchWidgets
              : tabValue === 1 ? handleSearchTemplates
              : handleSearchBuiltInTemplates
            }
            variant="outlined"
            fullWidth
            className={styles.communitySearchWrapper}
          />
          <Button variant="contained" color="primary"   onClick={() => {
            if (tabValue === 0) {
              searchWidgets();
            } else if (tabValue === 1) {
              searchTemplates();
            } else if (tabValue === 2) {
              searchBuiltInTemplates();
            }
          }}>
            <SearchIcon /> Search
          </Button>
          <Button variant="contained" color="primary" onClick={handleClearSearchResults} className={styles.communitySearchClear} >
            Clear
          </Button>

          {loading && (
        <Box
        className={styles.loadingWrapperNoOverlay}
        >
          <CircularProgress />
        </Box>
      )}
          <Box>
    
            {tabValue === 0 && widgets.length > 0 && (widgets.map(widget => (
              <Box key={widget.id} className={styles.communityItemBox} >
                <Box className={styles.communityItemInnerWrapper}>

                  <Typography variant="h5" component="h5" className={styles.bold}>
                    {dynamicTextTruncate(widget.title, 20)}
                  </Typography>
                  <Typography variant="body2">{dynamicTextTruncate(widget.prompt, 100)}</Typography>
                  <Typography variant="body2">Author: {dynamicTextTruncate(widget.displayName, 100)}</Typography>
                  <Box className={styles.communityLikeWrapper} >
                    <IconButton onClick={() => handleLike(widget.pageId, widget.id, 'widget')}>
                      {likedWidgets.has(widget.id) ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
                    </IconButton>
                    <Typography variant="body2" className={styles.communityLike}>
                      Likes: {widget.likes || 0}
                    </Typography>
                  </Box>
                </Box>
                <Box className={styles.communityBtnWrapper}>
                  <Box className={styles.communityBtnInnerWrapper} >
                    <Button variant="outlined" onClick={() => handlePreview(widget, 'widget')} startIcon={<PreviewIcon />} >
                      Preview
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleWidgetAdd(widget)}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Box>
            )))}
            {tabValue === 1 && templates.length > 0 && (templates.filter(template => template.widgets && template.widgets.length > 0).map(template => (
              <Box key={template.pageId} className={styles.communityItemBox}>
                <Box className={styles.communityItemInnerWrapper}>

                  <Typography variant="h5" component="h5" className={styles.bold}>
                  {dynamicTextTruncate(template.templateName, 20)}
                  </Typography>
                  <Typography variant="body2">Author: {dynamicTextTruncate(template.displayName, 100)}</Typography>
                  <Typography variant="body2">
                    Widgets: {dynamicTextTruncate(template.widgets.map(widget => widget.title).join(', '), 100)}
                  </Typography>
                  <Box className={styles.communityLikeWrapper} >
                    <IconButton onClick={() => handleLike(template.pageId, -1, 'template')}>
                      {likedTemplates.has(template.pageId) ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
                    </IconButton>
                    <Typography variant="body2" className={styles.communityLike}>
                      Likes: {template.likes || 0}
                    </Typography>
                  </Box>
                </Box>
                <Box className={styles.communityBtnWrapper}>
                <Box className={styles.communityBtnInnerWrapper} >
                    <Button variant="outlined" onClick={() => handlePreview(template, 'template')} startIcon={<PreviewIcon />} >
                      Preview
                    </Button>
                    <Button variant="outlined" startIcon={<AddIcon />}  onClick={() => handleTemplateAdd(template)}>
                      Add
                    </Button>

                  </Box>
                </Box>
              </Box>
            )))}

            {tabValue === 2 && builtInTemplates.length > 0 && (builtInTemplates.map(template => (
              <Box key={template.pageId} className={styles.communityItemBox}>
                <Box className={styles.communityItemInnerWrapper}>
                  <Typography variant="h5" component="h5" className={styles.bold}>
                    {dynamicTextTruncate(template.templateName, 20)}
                  </Typography>
                  <Typography variant="body2">Author: {dynamicTextTruncate(template.displayName, 100)}</Typography>
                  <Typography variant="body2">
                    Widgets: {dynamicTextTruncate(template.widgets.map(widget => widget.title).join(', '), 100)}
                  </Typography>
                </Box>
                <Box className={styles.communityBtnWrapper}>
                  <Box className={styles.communityBtnInnerWrapper}>
                    <Button variant="outlined" onClick={() => handleBuiltInTemplatePreview(template.widgets)} startIcon={<PreviewIcon />}>
                      Preview
                    </Button>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleBuiltInTemplateAdd(template)}>
                      Add
                    </Button>
                  </Box>
                </Box>
              </Box>
            )))}
          </Box>
          <Box className={styles.communityLoadMoreWrapper}>
            {tabValue === 0 && !widgetsEnd && !loading && (
              <Button className={styles.communityLoadMoreButton} variant="outlined" onClick={handleLoadMoreWidgets}>Load More Widgets</Button>
            )}
            {tabValue === 1 && !templatesEnd && !loading && (
              <Button className={styles.communityLoadMoreButton} variant="outlined" onClick={handleLoadMoreTemplates}>Load More Templates</Button>
            )}
          </Box>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
        <Dialog
          open={widgetsDialogOpen}
          onClose={handleWidgetsDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle  className={styles.dialogTitle}>{selectedTemplate ? 'Replace Widgets for Template' : 'Replace Widget'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedTemplate ?
                `You need to delete ${widgetsToDeleteText.length} widget(s) to add this template.` :
                `You have ${6 - userWidgets.length} widgets quota remaining.`}
            </DialogContentText>
            {selectedTemplate ? (
              userWidgets.map(([id, widget], index) => (
                <Box key={id} className={styles.communityDialogItemWrapper} >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={widgetsToDelete[index]}
                        onChange={() => handleWidgetsDeleteCheckboxChange(index)}
                      />
                    }
                    label={widget.title}
                  />
                  <Typography variant="body">{widget.prompt}</Typography>
                </Box>
              ))
            ) : (
              userWidgets.map(([id, widget]) => (
                <Box key={id}  className={styles.communityDialogItemWrapper}>
                  <Typography variant="h5" component="h5"  className={styles.bold}>
                    {widget.title}
                  </Typography>
                  <Typography variant="body">{widget.prompt}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleWidgetReplace(id, selectedWidget)}
                  >
                    Replace
                  </Button>
                </Box>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleWidgetsDialogClose}>Cancel</Button>
            {selectedTemplate && (
              <Button onClick={handleTemplateWidgetsAdd}>Add Template Widgets</Button>
            )}
          </DialogActions>
        </Dialog>
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(snackbarErrorMessage)}
          autoHideDuration={6000}
          onClose={() => setSnackbarErrorMessage('')}
          message={snackbarErrorMessage}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbarErrorMessage('')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </Container>
  );
};

export default Community;
