import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AccountCircle, People, Widgets, Logout, Build, SelfImprovement } from '@mui/icons-material';
import styles from '../styles/components.module.css';
import { useAuth } from '../utils/authProvider';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();


  //Logout user by clearing session
  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      classes={{
        paper: styles.sidebarWrapper, 
      }}

    >
      <List>
        <ListItem
          onClick={onClose}
          component={Link} to="/dashboard"
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <SelfImprovement />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem
          onClick={onClose}
          component={Link} to="/widgets"
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <Widgets />
          </ListItemIcon>
          <ListItemText primary="Widgets" />
        </ListItem>
        <ListItem
          onClick={onClose}
          component={Link} to="/create-widget"
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <Build />
          </ListItemIcon>
          <ListItemText primary="Create Widgets" />
        </ListItem>
        <ListItem
          onClick={onClose}
          component={Link} to="/community"
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <People />
          </ListItemIcon>
          <ListItemText primary="Community" />
        </ListItem>
        <ListItem
          onClick={onClose}
          component={Link} to="/profile"
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem
          component={Link}
          onClick={handleLogout}
          className={styles.sideBarListItem}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>

      </List>
    </Drawer>
  );
};

export default Sidebar;