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
  const [isMobileView, setIsMobileView] = useState(false);
  const menuRef = useRef(null);
  const portalRef = useRef(null);
  const triggerRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (isOpen && !isMobileView) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen, isMobileView]);

  const toggleMenu = (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    if (!isOpen && !isMobileView) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  const mobileVariants = {
    hidden: { y: "100%", opacity: 1 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 1 }
  };

  const desktopVariants = {
    hidden: { opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 }
  };

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button 
        type="button"
        ref={triggerRef}
        onClick={toggleMenu}
        className={`user-menu-trigger-wrapper ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        style={{ border: 'none', background: 'transparent', padding: 0 }}
      >
        {typeof children === 'function' ? children(isOpen) : (children || (
          <div 
            className={`user-menu-trigger ${isOpen ? 'active' : ''} ${hideName ? 'compact' : ''} group`}
          >
            <div className="user-menu-avatar">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.first_name || 'User'} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  <UserIcon size={16} className="text-white" />
                </div>
              )}
            </div>
            {!hideName && (
              <>
                <span className="user-menu-name">
                  {user?.first_name || user?.email?.split('@')[0] || 'Analyst'}
                </span>
                <div className="user-menu-chevron-box">
                  <ChevronDown size={14} className={`user-menu-chevron ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </>
            )}
          </div>
        ))}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* BACKDROP FOR MOBILE */}
              {isMobileView && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="user-menu-backdrop"
                  onClick={() => setIsOpen(false)}
                />
              )}

              <motion.div
                ref={portalRef}
                variants={isMobileView ? mobileVariants : desktopVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ 
                  duration: 0.3, 
                  ease: isMobileView ? [0.32, 0.72, 0, 1] : [0.23, 1, 0.32, 1] 
                }}
                className={`user-menu-dropdown ${isMobileView ? 'mobile-action-sheet' : ''}`}
                style={isMobileView ? {} : { 
                    position: 'fixed',
                    top: align === 'top' ? 'auto' : `${(coords.top || 0) + (coords.height || 0) + 10}px`,
                    bottom: align === 'top' ? `${window.innerHeight - (coords.top || (window.innerHeight - 100)) + 10}px` : 'auto',
                    left: side === 'left' ? `${coords.left || 10}px` : 'auto',
                    right: side === 'right' ? `${window.innerWidth - ((coords.left || 0) + (coords.width || 220))}px` : 'auto',
                }}
              >
                {isMobileView && <div className="mobile-sheet-handle" />}

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
                  <p title={user.email} style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, color: 'var(--text-secondary)' }}>
                    {user.email}
                  </p>
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
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default UserAccountMenu;
