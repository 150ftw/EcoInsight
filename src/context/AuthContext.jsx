import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
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
    const res = await axios.post('/api/auth/check-user', { email });
    return res.data; // { exists: boolean, provider: string }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (firstName, lastName, email, password) => {
    const res = await axios.post('/api/auth/signup', { firstName, lastName, email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    window.location.href = '/';
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };
  
  const updateProfile = async (profileData) => {
    const res = await axios.post('/api/auth/update-profile', profileData);
    setUser(res.data.user);
    return res.data;
  };

  const updatePassword = async (newPassword) => {
    const res = await axios.post('/api/auth/update-password', { newPassword });
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
