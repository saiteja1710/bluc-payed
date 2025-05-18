import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useMyContext } from './MyContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { interest } = useMyContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(location.search);
      const newToken = queryParams.get('token');
      const isProfileComplete = queryParams.get('isProfileComplete');

      if (newToken) {
        localStorage.setItem('token', newToken);
        
        if (isProfileComplete === 'false') {
          navigate('/profile');
        } else {
          navigate('/');
        }
      }

      if (token) {
        try {
          const response = await api.auth.checkAuth();
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, [location, navigate]);

  const login = async (email, password) => {
    const response = await api.auth.login(email, password);
    const { token, isProfileComplete } = response.data;
    
    localStorage.setItem('token', token);
    setUser(response.data.user);

    if (!isProfileComplete) {
      navigate('/profile');
    }

    return response.data.user;
  };

  const loginWithGoogle = () => {
    if (user) {
      console.log('User already logged in');
      return;
    }
    if (interest) {
      localStorage.setItem('interest', interest);
    }
    window.location.href = `${process.env.VITE_CLIENT_URL}/api/auth/google`;
  };

  const signup = async (email, password) => {
    const response = await api.auth.signup({ email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const updateProfile = async (profileData) => {
    const response = await api.user.updateProfile(profileData);
    setUser(prev => ({
      ...prev,
      ...response.data,
      isProfileComplete: true
    }));
    return response.data;
  };

  const value = {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};