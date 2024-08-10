import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import WidgetsBuilder from './pages/WidgetsBuilder';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Widgets from './pages/Widgets';
import ProfilePage from './pages/Profile';
import Community from './pages/Community';
import DashboardPreview from './pages/DashboardPreview';

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes>
        {/* Protect paths with private route except for homepage */}
        <Route path="/" element={<Home />} />
        <Route path="/create-widget" element={<PrivateRoute element={WidgetsBuilder} />} />
        <Route path="/dashboard" element={<PrivateRoute element={Dashboard} /> } />
        <Route path="/widgets" element={<PrivateRoute element={Widgets} /> } />
        <Route path="/community" element={<PrivateRoute element={Community} />}></Route>
        <Route path="/profile" element={<PrivateRoute element={ProfilePage} /> }></Route>
        <Route path="/dashboard-preview" element={<PrivateRoute element={DashboardPreview} />}></Route>
      </Routes>

    </ThemeProvider>

  );
};

export default App;