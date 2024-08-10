import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from '@mui/material';
import { Menu as MenuIcon} from '@mui/icons-material';
import styles from '../styles/components.module.css'
import { useAuth } from '../utils/authProvider';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';


const Header = () => {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = sessionStorage.getItem('geminiDashboardCurrentUser');
  const location = useLocation();

  //Open sidebar
  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };


  //Close sidebar
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  //Set app bar title based on path
  const getTitle = (path) => {
    switch (path) {
      case '/':
        return 'Home';
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard-preview':
        return 'Preview';
      case '/create-widget':
        return 'Create Widget';
      case '/widgets':
        return 'My Widgets';
      case '/profile':
        return 'Profile';
      case '/community':
        return 'Community';
      default:
        return 'Gemini Dashboard';
    }
  };

  return (
    <>
      {/* Show hamburger menu, page title, and user profile photo */}
      {currentUser && storedUser && (<AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleSidebarOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h6" className={styles.headerTitle}>
            {getTitle(location.pathname)}
          </Typography>
          <Box className={styles.userWrapper} >
            <Typography variant="body1" className={styles.userName}>
              {currentUser.displayName}
            </Typography>
            <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />
          </Box>
        </Toolbar>
      </AppBar>
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </>

  );
};

export default Header;