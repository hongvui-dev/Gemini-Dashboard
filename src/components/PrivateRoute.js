import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authProvider'; 

const PrivateRoute = ({ element: Component, ...rest }) => {
  const [isLoading, setIsLoading] = useState(true); 
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    //Get user from session
    const storedUser = sessionStorage.getItem('geminiDashboardCurrentUser');
    if (storedUser) {
      //Set user if exist
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser); 
      setIsLoading(false);
    } else {
      //Kick to homepage if doesn't exist
      navigate('/')
    }
  }, [navigate, setCurrentUser]);

  return (
    isLoading ? (
      <div>Loading...</div>
    ) : currentUser ? (
      <Component {...rest} />
    ) : (
      <Navigate to="/" />
    )
  );
};

export default PrivateRoute;