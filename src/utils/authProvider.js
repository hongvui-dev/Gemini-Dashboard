import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getAuth } from './firebaseConfig';
import { signOut } from 'firebase/auth';


const AuthContext = createContext();

//To get auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

//AuthProvider that can wrap children so they share the same context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);
  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user); 
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  //Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('geminiDashboardCurrentUser');
      setCurrentUser(null); 
      setIsLoggedIn(false); 
      navigate('/'); 
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};