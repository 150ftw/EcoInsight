import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState(initialView); // 'login-email', 'login-password', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { checkUser, login, signup, loginWithGoogle } = useAuth();
  
  // Synchronize internal view with parent-controlled initialView when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailNext = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { exists, provider } = await checkUser(email);
      if (exists) {
        if (provider === 'google') {
          setError('This account uses Google Login. Please Sign in with Google.');
        } else {
          setView('login-password');
        }
      } else {
        setView('signup');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signup(firstName, lastName, email, password);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="auth-modal-card"
      >
        {/* Header */}
        <div className="auth-modal-header">
          <button 
            onClick={handleClose}
            className="auth-close-btn"
          >
            <X size={20} />
          </button>
          
          <div className="auth-icon-container">
            <User size={24} />
          </div>
          
          <h2 className="auth-title">
            {view === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {view === 'signup' ? 'Join EcoInsight for elite intelligence' : 'Continue your economic research'}
          </p>
        </div>

        {/* Content */}
        <div className="auth-modal-body">
          {error && (
            <div className="auth-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {view === 'login-email' && (
              <motion.form 
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailNext}
                className="auth-form"
              >
                <div className="auth-input-group">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="auth-input with-icon"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="auth-primary-btn"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      Continue 
                      <ArrowRight size={18} className="auth-arrow-icon" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {view === 'login-password' && (
              <motion.form 
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="auth-form"
              >
                <div className="auth-input-group">
                  <div className="auth-label-row">
                    <label className="auth-label">Password</label>
                    <button type="button" className="auth-forgot-link">Forgot password?</button>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input 
                      type="password"
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input with-icon"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="auth-primary-btn"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setView('login-email')}
                  className="auth-back-link"
                >
                  Back to email
                </button>
              </motion.form>
            )}

            {view === 'signup' && (
              <motion.form 
                key="signup"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleSignup}
                className="auth-form"
              >
                <div className="auth-input-group">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-input-icon" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="auth-input with-icon"
                    />
                  </div>
                </div>
                <div className="auth-name-row">
                  <div className="auth-input-group">
                    <label className="auth-label">First Name</label>
                    <input 
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-input-group">
                    <label className="auth-label">Last Name</label>
                    <input 
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="auth-input"
                    />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label className="auth-label">Password</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="auth-input with-icon"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="auth-primary-btn"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setView('login-email')}
                  className="auth-back-link"
                >
                  Already have an account? Log In
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <div className="auth-divider-text">
              <span>Or continue with</span>
            </div>
          </div>

          <div className="auth-social-row">
            <button 
              onClick={loginWithGoogle}
              className="auth-social-btn"
            >
              <svg className="google-icon" viewBox="0 0 48 48" width="18" height="18">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.483,35.463,44,30.36,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-modal-footer">
          Elite Economic Intelligence System
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
