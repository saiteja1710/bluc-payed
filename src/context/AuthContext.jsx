import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useMyContext } from './MyContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { interest } = useMyContext();

  // Check auth status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');

      if (token && interest) {
        try {
          // Simulated user auth for demo purposes
          setUser({
            id: 'user123',
            email: 'user@example.com',
            fullName: 'Demo User',
            gender: 'male',
            isPremium: false,
            interest: interest,
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, [interest]); // Wait for interest to be available

  // Simulate login
  const login = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate API

    const userData = {
      id: 'user123',
      email,
      fullName: 'Demo User',
      gender: 'male',
      isPremium: false,
    };

    localStorage.setItem('token', 'demo-token');
    setUser(userData);

    return userData;
  };

  // Simulate signup
  const signup = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(prev => ({
      ...prev,
      ...profileData,
    }));

    return { success: true };
  };

  // Upgrade to premium
  const upgradeSubscription = async (plan) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(prev => ({
      ...prev,
      isPremium: true,
      plan,
    }));

    return { success: true };
  };

  const value = {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    login,
    signup,
    logout,
    updateProfile,
    upgradeSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
