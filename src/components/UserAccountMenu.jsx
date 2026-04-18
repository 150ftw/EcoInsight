import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User as UserIcon, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserAccountMenu = ({ 
  hideName = false, 
  role = "Economic Analyst", 
  side = "left", 
  align = "top",
  children,
  onSettingsClick = () => {},
  onSubscriptionClick = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const menuRef = useRef(null);
  const portalRef = useRef(null);
  const triggerRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click was outside the trigger AND outside the portalled dropdown
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

  const toggleMenu = () => {
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div 
        ref={triggerRef}
        onClick={toggleMenu}
        className={`user-menu-trigger-wrapper ${isOpen ? 'active' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        {children || (
          <button 
            className={`user-menu-trigger ${isOpen ? 'active' : ''} ${hideName ? 'compact' : ''} group`}
            aria-expanded={isOpen}
          >
            <div className="user-menu-avatar">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.first_name || 'User'} />
              ) : (
                <UserIcon size={16} className="text-white" />
              )}
            </div>
            {!hideName && (
              <>
                <span className="user-menu-name">
                  {user.first_name || user.email.split('@')[0]}
                </span>
                <div style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronDown size={14} className={`user-menu-chevron ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isOpen && coords.top !== 0) && createPortal(
          <motion.div
            ref={portalRef}
            initial={{ opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: align === 'top' ? 10 : -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="user-menu-dropdown portal-menu"
            style={{ 
                position: 'fixed',
                top: align === 'top' ? 'auto' : `${coords.top + coords.height + 10}px`,
                bottom: align === 'top' ? `${window.innerHeight - coords.top + 10}px` : 'auto',
                left: side === 'left' ? `${coords.left}px` : 'auto',
                right: side === 'right' ? `${window.innerWidth - (coords.left + coords.width)}px` : 'auto',
                zIndex: 9999,
                width: 'max-content',
                minWidth: '220px'
            }}
          >
            <div className="user-menu-header">
              <p>{role}</p>
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
                <div className="user-menu-icon">
                  <UserIcon size={18} />
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
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAccountMenu;
