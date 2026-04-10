import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Detect if we are running in a local development environment
const IS_LOCALHOST = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') || 
  window.location.hostname.endsWith('.local');

// Mock user for local development
const MOCK_USER = {
  id: 'local-dev-user',
  email: 'dev@ecoinsight.online',
  first_name: 'Local',
  last_name: 'Developer',
  username: 'local_dev',
  tier: 'Pro',
  onboarded: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (IS_LOCALHOST) {
      console.log("[AuthContext] Localhost detected, using mock user...");
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const checkUser = async (email) => {
    if (IS_LOCALHOST) return { exists: true, provider: 'password' };
    
    const res = await axios.post('/api/auth/check-user', { email });
    return res.data; // { exists: boolean, provider: string }
  };

  const login = async (email, password) => {
    if (IS_LOCALHOST) {
      setUser(MOCK_USER);
      return { user: MOCK_USER };
    }
    
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (firstName, lastName, email, password) => {
    if (IS_LOCALHOST) {
      setUser(MOCK_USER);
      return { user: MOCK_USER };
    }
    
    const res = await axios.post('/api/auth/signup', { firstName, lastName, email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    if (IS_LOCALHOST) {
      setUser(null);
      // No need to redirect on logout in dev if we want to stay on the same page
      // but if you want to see the landing page, you can still redirect
      window.location.href = '/';
      return;
    }
    
    await axios.post('/api/auth/logout');
    setUser(null);
    window.location.href = '/';
  };

  const loginWithGoogle = () => {
    if (IS_LOCALHOST) {
      setUser(MOCK_USER);
      return;
    }
    window.location.href = '/api/auth/google';
  };

  
  const updateProfile = async (profileData) => {
    if (IS_LOCALHOST) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      return { user: updatedUser };
    }
    
    const res = await axios.post('/api/auth/update-profile', profileData);
    setUser(res.data.user);
    return res.data;
  };

  const updatePassword = async (newPassword) => {
    if (IS_LOCALHOST) return { success: true };
    
    const res = await axios.post('/api/auth/update-password', { newPassword });
    return res.data;
  };

  const requestPasswordReset = async (email) => {
    if (IS_LOCALHOST) return { message: 'Reset link generated (Mock)' };
    const res = await axios.post('/api/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    if (IS_LOCALHOST) return { message: 'Password reset successful (Mock)' };
    const res = await axios.post('/api/auth/reset-password', { token, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      checkUser, 
      login, 
      signup, 
      logout,
      loginWithGoogle,
      updateProfile,
      updatePassword,
      requestPasswordReset,
      resetPassword,
      refreshUser: fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Compatibility hook to mimic useUser from Clerk if needed
export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, isLoaded: !loading, isSignedIn: !!user };
};

