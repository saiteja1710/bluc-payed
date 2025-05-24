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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { interest } = useMyContext();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const response = await api.user.getProfile();
      const userData = response.data;
      setUser(userData);

      // Only show profile modal if user exists but profile is not complete
      if (userData && !userData.fullName && !userData.dateOfBirth && !userData.gender) {
        setShowProfileModal(true);
      } else {
        setShowProfileModal(false);
      }

      return userData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(location.search);
      const newToken = queryParams.get('token');

      if (newToken) {
        localStorage.setItem('token', newToken);
        await fetchUserProfile();
        navigate('/');
      } else if (token) {
        await fetchUserProfile();
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, [location, navigate]);

  const login = async (email, password) => {
    const response = await api.auth.login(email, password);
    const { token } = response.data;

    localStorage.setItem('token', token);
    await fetchUserProfile();
    navigate('/');
  };

  const loginWithGoogle = () => {
    if (user) {
      return;
    }

    if (interest) {
      localStorage.setItem('interest', interest);
    }

    const backendUrl = import.meta.env.PROD
      ? 'https://bluc-payed.vercel.app'
      : 'http://localhost:3000';

    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const signup = async (email, password) => {
    const response = await api.auth.signup({ email, password });
    const { token } = response.data;

    localStorage.setItem('token', token);
    await fetchUserProfile();
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowProfileModal(false);
    navigate('/');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.user.updateProfile(profileData);
      const updatedUser = {
        ...user,
        ...response.data,
        isProfileComplete: true
      };
      setUser(updatedUser);
      setShowProfileModal(false);
      return response.data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    showProfileModal,
    setShowProfileModal,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};