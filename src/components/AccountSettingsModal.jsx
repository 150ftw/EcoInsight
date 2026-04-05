import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Check, Loader2, Key, Camera, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Stub for Icon from lucide-react if needed, but since App.jsx uses lucide-react, I'll use that.
import { Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

const AccountSettingsModal = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    email: profile?.email || '',
    avatar: profile?.avatar || '',
  });

  // Sync formData with profile prop when it changes (especially on first login)
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const PRESET_AVATARS = [
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite1&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite2&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite3&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite4&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite5&backgroundColor=b6e3f4,c0aede,d1d4f9',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite6&backgroundColor=b6e3f4,c0aede,d1d4f9'
  ];
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'success', 'error'
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (showPasswordChange) {
        if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
           throw new Error('Passwords do not match or are empty');
        }
        await onSave({ ...formData, newPassword: passwords.newPassword });
      } else {
        await onSave(formData);
      }
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
        onClose();
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="auth-modal-card account-settings-modal"
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-glow" style={{ opacity: 0.4 }} />
        
        {/* Header */}
        <div className="auth-modal-header">
          <button onClick={onClose} className="auth-close-btn">
            <X size={20} />
          </button>
          <div className="auth-icon-container">
            <User size={24} />
          </div>
          <h2 className="auth-title">Account Settings</h2>
          <p className="auth-subtitle">Manage your elite economic identity</p>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          <form onSubmit={handleSave} className="auth-form">
            <div className="avatar-settings-container">
              <div className="avatar-settings-row">
                <div className="avatar-preview-large">
                  {formData.avatar ? <img src={formData.avatar} alt="Profile" /> : (formData.name?.charAt(0) || 'S')}
                  <div className="avatar-edit-overlay"><Camera size={14} /></div>
                </div>
                <div className="avatar-info">
                  <h4>Profile Picture</h4>
                  <p>Select a neural identity or paste a URL</p>
                </div>
              </div>
              
              <div className="avatar-selection-controls">
                <div className="avatar-presets-grid">
                  {PRESET_AVATARS.map((url, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      className={`avatar-preset-btn ${formData.avatar === url ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, avatar: url})}
                    >
                      <img src={url} alt={`Preset ${i}`} />
                    </button>
                  ))}
                </div>
                <div className="avatar-url-input">
                  <AtSign size={14} />
                  <input 
                    type="text" 
                    placeholder="Paste custom image URL..." 
                    value={formData.avatar.startsWith('https://api.dicebear.com') ? '' : formData.avatar}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="auth-input with-icon"
                  placeholder="Professional Analyst"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email Address (Primary)</label>
              <div className="auth-input-wrapper" style={{ opacity: 0.7 }}>
                <Mail size={18} className="auth-input-icon" />
                <input 
                  type="email"
                  value={formData.email}
                  readOnly
                  className="auth-input with-icon"
                  style={{ cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="settings-divider" />
            
            {!showPasswordChange ? (
              <button 
                type="button" 
                className="settings-action-link"
                onClick={() => setShowPasswordChange(true)}
              >
                <Key size={16} /> <span>Change Security Password</span>
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="password-change-fields"
              >
                <div className="auth-input-group">
                  <label className="auth-label">New Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="auth-input with-icon" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                  </div>
                </div>
                <div className="auth-input-group" style={{ marginTop: '1rem' }}>
                  <label className="auth-label">Confirm New Password</label>
                  <div className="auth-input-wrapper">
                    <ShieldCheck size={18} className="auth-input-icon" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="auth-input with-icon" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>Passwords do not match</p>
                )}
                <button type="button" className="auth-back-link" onClick={() => { setShowPasswordChange(false); setPasswords({newPassword: '', confirmPassword: ''}); }}>Cancel change</button>
              </motion.div>
            )}

            <div className="auth-modal-footer-actions" style={{ marginTop: '2rem' }}>
              <button 
                type="submit" 
                disabled={isSaving}
                className={`auth-primary-btn ${saveStatus === 'success' ? 'success' : ''}`}
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 
                 saveStatus === 'success' ? <><Check size={18} /> Identity Updated</> : 
                 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSettingsModal;
