import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User as UserIcon, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserAccountMenu = ({ 
  hideName = false, 
  role = "Economic Analyst", 
  side = "left", 
  align = "bottom",
  children,
  onSettingsClick = () => {},
  onSubscriptionClick = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const menuRef = useRef(null);
  const portalRef = useRef(null);
  const triggerRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        portalRef.current && !portalRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      // Capture coordinates synchronously before opening to prevent flickering/misalignment
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    }
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button 
        type="button"
        ref={triggerRef}
        onClick={toggleMenu}
        className={`user-menu-trigger-wrapper ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
      >
        {typeof children === 'function' ? children(isOpen) : (children || (
          <div 
            className={`user-menu-trigger ${isOpen ? 'active' : ''} ${hideName ? 'compact' : ''} group`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '4px 12px 4px 5px', borderRadius: '9999px' }}
          >
            <div className="user-menu-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.first_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={16} className="text-white" />
              )}
            </div>
            {!hideName && (
              <>
                <span className="user-menu-name" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.first_name || user?.email?.split('@')[0] || 'Analyst'}
                </span>
                <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronDown size={14} className={`user-menu-chevron ${isOpen ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>
              </>
            )}
          </div>
        ))}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={portalRef}
              initial={{ opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`user-menu-dropdown portal-menu ${window.innerWidth < 768 ? 'mobile-action-sheet' : ''}`}
              style={window.innerWidth < 768 ? {
                  position: 'fixed',
                  bottom: 'calc(1.5rem + var(--safe-bottom))',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'calc(100% - 2rem)',
                  maxWidth: '400px',
                  zIndex: 45000,
                  padding: '4px',
                  pointerEvents: 'auto'
              } : { 
                  position: 'fixed',
                  top: align === 'top' ? 'auto' : `${(coords.top || 0) + (coords.height || 0) + 10}px`,
                  bottom: align === 'top' ? `${window.innerHeight - (coords.top || (window.innerHeight - 100)) + 10}px` : 'auto',
                  left: side === 'left' ? `${coords.left || 10}px` : 'auto',
                  right: side === 'right' ? `${window.innerWidth - ((coords.left || 0) + (coords.width || 220))}px` : 'auto',
                  zIndex: 40000,
                  width: 'max-content',
                  minWidth: '220px',
                  pointerEvents: 'auto'
              }}
            >
              <div className="user-menu-profile-preview">
                <div className="preview-avatar">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt={user.first_name || 'User'} />
                  ) : (
                    <div className="avatar-placeholder">
                      <UserIcon size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="preview-info">
                  <h3>{user?.first_name || user?.email?.split('@')[0] || 'Analyst'}</h3>
                  <span>{role}</span>
                </div>
              </div>

              <div className="user-menu-header">
                <p title={user.email}>{user.email}</p>
              </div>
              
              <div className="user-menu-body">
                <button 
                  onClick={() => { 
                    setIsOpen(false); 
                    onSettingsClick();
                  }}
                  className="user-menu-item"
                >
                  <div className="user-menu-icon" style={{ color: 'var(--accent-primary)' }}>
                    <Settings size={18} />
                  </div>
                  <span>Account Settings</span>
                </button>
                
                <div className="user-menu-divider" />
                
                <button 
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="user-menu-item user-menu-logout"
                >
                  <div className="user-menu-icon">
                    <LogOut size={18} />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default UserAccountMenu;
