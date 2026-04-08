import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User as UserIcon, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserAccountMenu = ({ 
  hideName = false, 
  role = "Economic Analyst", 
  side = "right", 
  align = "bottom",
  onSettingsClick = () => {},
  onSubscriptionClick = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: align === 'top' ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: align === 'top' ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="user-menu-dropdown"
            style={{ 
                top: align === 'bottom' ? 'calc(100% + 10px)' : 'auto',
                bottom: align === 'top' ? 'calc(100% + 10px)' : 'auto',
                left: side === 'left' ? '0' : 'auto',
                right: side === 'right' ? '0' : 'auto'
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
              
              {/* Hiding for launch - will return with subscription tiers */}
              {/* <button 
                onClick={() => { 
                  setIsOpen(false); 
                  onSubscriptionClick();
                }}
                className="user-menu-item"
              >
                <div className="user-menu-icon">
                  <CreditCard size={18} />
                </div>
                <span>Subscription</span>
              </button> */}
              
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
      </AnimatePresence>
    </div>
  );
};

export default UserAccountMenu;
