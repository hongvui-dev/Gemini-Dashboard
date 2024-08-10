import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#83a5ff', 
      contrastText: '#fff', 
    },
    secondary: {
      main: '#f7d6ab', 
      contrastText: '#000', 
    },
    complementary: {
      main: '#ff9f83', 
    },
    background: {
      default: '#f3f4f6', 
      paper: '#ffffff', 
    },
    text: {
      primary: '#333333', 
      secondary: '#666666', 
    },
    error: {
      main: '#f44336', 
    },
    warning: {
      main: '#ff9800', 
    },
    info: {
      main: '#2196f3', 
    },
    success: {
      main: '#4caf50', 
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: '5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', 
          textTransform: 'none', 
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
        },
      },
    },
  },
});

export default theme;