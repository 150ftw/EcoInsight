import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialView = 'login', subtitleOverride = null }) => {
  const [view, setView] = useState(initialView); // 'login-email', 'login-password', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const { checkUser, login, signup, loginWithGoogle, loginWithApple, requestPasswordReset, resetPassword } = useAuth();
  
  // Synchronize internal view with parent-controlled initialView when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setSuccessMessage('');
      
      // If we are resetting, extract token from URL if not already provided
      if (initialView === 'reset-password') {
        const params = new URLSearchParams(window.location.search);
        setResetToken(params.get('token') || '');
      }
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await requestPasswordReset(email);
      setSuccessMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(resetToken, password);
      setSuccessMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => {
        setView('login-email');
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
            {view === 'signup' ? 'Create Account' : 
             view === 'forgot-password' ? 'Reset Password' :
             view === 'reset-password' ? 'Set New Password' : 
             'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {successMessage ? (
              <span style={{ color: '#10b981' }}>{successMessage}</span>
            ) : subtitleOverride || (
              view === 'signup' ? 'Join EcoInsight for elite intelligence' : 
              view === 'forgot-password' ? 'Enter your email to receive a reset link' :
              view === 'reset-password' ? 'Secure your account with a new password' :
              'Continue your economic research'
            )}
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
                    <button type="button" onClick={() => setView('forgot-password')} className="auth-forgot-link">Forgot password?</button>
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

            {view === 'forgot-password' && (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleForgotSubmit}
                className="auth-form"
              >
                <div className="auth-input-group">
                  <label className="auth-label">Recovery Email</label>
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
                <button type="submit" disabled={isLoading} className="auth-primary-btn">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setView('login-email')} className="auth-back-link">
                  Back to login
                </button>
              </motion.form>
            )}

            {view === 'reset-password' && (
              <motion.form 
                key="reset"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleResetSubmit}
                className="auth-form"
              >
                <div className="auth-input-group">
                  <label className="auth-label">New Secure Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input 
                      type="password"
                      required
                      minLength={8}
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input with-icon"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading || !resetToken} className="auth-primary-btn">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                </button>
                {!resetToken && <p className="auth-error-text" style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>Invalid or missing reset token.</p>}
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

            <button 
              disabled
              className="auth-social-btn apple-btn disabled"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <span>Apple</span>
              </div>
              <div className="in-dev-tag">
                <Lock size={10} style={{ marginRight: 4 }} /> 
                <span>IN-DEV</span>
              </div>
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
