import React from 'react';
import { Typography, Container, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import styles from '../styles/components.module.css'
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup } from '../utils/firebaseConfig';
import { useAuth } from '../utils/authProvider';
import { getUserRef, getData, setData, getUserWidgetsRef } from '../utils/databaseCRUD';


const Home = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  //Login
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //Set session
      sessionStorage.setItem('geminiDashboardCurrentUser', JSON.stringify(user));
      setCurrentUser(user);

      const userRef = getUserRef(user.uid);

      const snapshot = await getData(userRef);

      if (snapshot == null) {
        //Create new user in database, don't store users' emails
        await setData(userRef, {
          //email: user.email,
          displayName: user.displayName,
        });

        if (user) {
          const userIdToken = await user.getIdToken();


          sessionStorage.setItem('geminiDashboardIdToken', userIdToken);

          
          const decodedToken = await user.getIdTokenResult(); 

          const expiresAt = decodedToken.exp * 1000; 
          sessionStorage.setItem('geminiDashboardIdTokenExpiration', expiresAt);
        }

        navigate('/create-widget');
      } else {
        //User already exists in database
        const widgetsRef = getUserWidgetsRef(user.uid);
        const widgetsSnapshot = await getData(widgetsRef);

        if (user) {
          const userIdToken = await user.getIdToken();

          sessionStorage.setItem('geminiDashboardIdToken', userIdToken);

          const decodedToken = await user.getIdTokenResult(); 
          
          const expiresAt = new Date(decodedToken.expirationTime).getTime();
          sessionStorage.setItem('geminiDashboardIdTokenExpiration', expiresAt);
        }

        //If user has widgets in dashboard, go to dashboard, else go to widgets. If no widgets at all, go to builder.
        if (widgetsSnapshot.exists()) {
          const widgets = widgetsSnapshot.val();
          const dashboardWidgets = Object.values(widgets).filter(widget => widget.isInDashboard);

          if (dashboardWidgets.length > 0) {
            navigate('/dashboard'); 
          } else {
            navigate('/widgets');
          }
        } else {
          navigate('/create-widget');
        }
      }

    } catch (error) {
      console.error('Login error: ', error);
    }
  };
  return (
    <Box className={styles.homeWrapper} >
      <Container>
        <Box
          className={styles.homeInnerWrapper}
        >
          <Box
            component="img"
            className={styles.homeLogoWrapper}
            alt="Hero Image"
            src="assets/images/gemini-robot.png"
          />
          <Typography className={styles.homeTitle} variant="h1" component="h1" gutterBottom>
            Gemini Dashboard
          </Typography>
          <Typography className={styles.homeDescription} variant="h5" component="h5" color="textPrimary">
            Build a personalized learning environment with reusable widgets to enhance your learning.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            className={styles.homeLoginBtn}
          >
            Login with Google
          </Button>
        </Box>
        <Box className={styles.homeCardParentWrapper}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className={styles.homeCardWrapper}>
                <CardContent>
                  <Typography variant="h5" component="h5" className={styles.homeCardTitle} >
                    Easy widget creation
                  </Typography>
                  <Typography variant="body1" component="p">
                    Empower users to create reusable Quiz, Flashcard, and other widgets that runs on Gemini API.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={styles.homeCardWrapper}>
                <CardContent>
                  <Typography variant="h5" component="h5" className={styles.homeCardTitle} >
                    One-time configuration
                  </Typography>
                  <Typography variant="body1" component="p">
                    Configure widgets once, use them forever. Users can also easily refresh widgets instead of repeated prompting.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={styles.homeCardWrapper}>
                <CardContent>
                  <Typography variant="h5" component="h5" className={styles.homeCardTitle}>
                    Community
                  </Typography>
                  <Typography variant="body1" component="p">
                    Easily find and use popular widgets and templates designed by other users. For newcomers, we offer a curated set of pre-built templates to get you started.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;