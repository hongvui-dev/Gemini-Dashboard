import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardMedia, Typography, Snackbar, Alert } from '@mui/material';
import { PhotoLibrary } from '@mui/icons-material';
import styles from '../styles/components.module.css';
import { useAuth } from '../utils/authProvider';
import { getUserRef, getData, updateData } from '../utils/databaseCRUD';

const ProfilePage = () => {
  //const [dashboardName, setDashboardName] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const { currentUser } = useAuth();
  const userId = currentUser.uid;

  useEffect(() => {
    //Set some default images from unsplash 
    setImageOptions([
      'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1599081593734-5e65dd7abfba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ]);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setBackgroundUrl(selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {

    //Get user data to pre-populate fields e.g. bg url and dashboard name
    const fetchUserData = async () => {

      const userRef = getUserRef(userId);
      const snapshot = await getData(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data) {
          setBackgroundUrl(data.dashboardBackgroundUrl || '');
          //setDashboardName(data.dashboardName || '');
        }
      };
    };

    fetchUserData();
  }, [userId]);


  const showErrorSnackbar = (msg) => {



    setErrorMessage(msg);
    setSnackbarOpen(true);
  };

  //Close error message
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  //Open image browser
  const handleImageDialogOpen = () => {
    setOpenImageDialog(true);
  };

  //Close image browser
  const handleImageDialogClose = () => {
    setOpenImageDialog(false);
  };

  //Save selected image
  const handleImageSave = async () => {
    const userRef = getUserRef(userId);
    //await updateData(userRef, { dashboardBackgroundUrl: backgroundUrl, dashboardName });
    await updateData(userRef, { dashboardBackgroundUrl: backgroundUrl });
    handleImageDialogClose();

    showErrorSnackbar("Success")
    
  };

  //Set image selected
  const handleImageSelect = (url) => {
    setSelectedImage(url);
    handleImageDialogClose();
  };


  return (
    <Container maxWidth="sm">
      <Box my={4}>

        {/* <TextField
          fullWidth
          label="Dashboard Name"
          variant="outlined"
          margin="normal"
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
        /> */}

        <TextField
          fullWidth
          label="Dashboard Background URL"
          variant="outlined"
          margin="normal"
          value={backgroundUrl}
          onChange={(e) => setBackgroundUrl(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleImageDialogOpen}>
                <PhotoLibrary />
              </IconButton>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleImageSave}
        >
          Save
        </Button>

        <Dialog open={openImageDialog} onClose={handleImageDialogClose}>
          <DialogTitle className={styles.dialogTitle}>Select a Background Image</DialogTitle>
          <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
              Images are sourced from Unsplash.
            </Typography>
            <Grid container spacing={2}>
              {imageOptions.map((url, index) => (
                <Grid item xs={4} key={index}>
                  <Card onClick={() => handleImageSelect(url)} className={styles.pointerCursor}>
                    <CardMedia
                      component="img"
                      image={url}
                      className={styles.cardMediaWrapper}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImageDialogClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            {errorMessage}
          </Alert>
        </Snackbar>

      </Box>
    </Container>
  );
};

export default ProfilePage;