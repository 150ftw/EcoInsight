import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, LayoutDashboard, MessageCircle, 
  Settings, LogOut, Moon, Sun, Terminal, 
  Zap, Compass, ShieldCheck 
} from 'lucide-react';

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  onAction,
  user
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={18} />, category: 'Navigation', shortcut: 'G D' },
    { id: 'chat', label: 'Direct Chat', icon: <MessageCircle size={18} />, category: 'Navigation', shortcut: 'G C' },
    { id: 'insights', label: 'Intelligence Hub', icon: <Compass size={18} />, category: 'Navigation', shortcut: 'G I' },
    { id: 'settings', label: 'Account Settings', icon: <Settings size={18} />, category: 'System', shortcut: 'S' },
    { id: 'terminal', label: 'Open Analysis Terminal', icon: <Terminal size={18} />, category: 'Tools', shortcut: 'T' },
    { id: 'theme', label: 'Toggle Visual Mode', icon: <Sun size={18} />, category: 'System', shortcut: 'M' },
    { id: 'signout', label: 'Sign Out', icon: <LogOut size={18} />, category: 'System', shortcut: 'Q' },
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands[selectedIndex]) {
            handleSelect(commands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands, selectedIndex]);

  const handleSelect = (cmd) => {
    onAction(cmd.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-overlay" onClick={onClose}>
          <motion.div 
            className="command-palette-modal"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="palette-search-container">
              <Search className="search-icon" size={20} />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
              />
              <div className="palette-badge">
                <Command size={12} /> K
              </div>
            </div>

            <div className="palette-results" ref={scrollRef}>
              {commands.length > 0 ? (
                <div className="palette-list">
                  {commands.map((cmd, idx) => (
                    <div 
                      key={cmd.id}
                      className={`palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(cmd)}
                    >
                      <div className="item-icon">{cmd.icon}</div>
                      <div className="item-content">
                        <span className="item-label">{cmd.label}</span>
                        <span className="item-category">{cmd.category}</span>
                      </div>
                      {cmd.shortcut && (
                        <div className="item-shortcut">{cmd.shortcut}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="palette-no-results">
                  <Zap size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>No commands found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="palette-footer">
              <div className="footer-tip">
                <span><kbd>↑↓</kbd> Navigate</span>
                <span><kbd>↵</kbd> Select</span>
                <span><kbd>ESC</kbd> Close</span>
              </div>
              <div className="footer-status">
                <ShieldCheck size={14} /> Institutional Mode
              </div>
            </div>
          </motion.div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            .command-palette-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.4);
              backdrop-filter: blur(8px);
              z-index: 10000;
              display: flex;
              justify-content: center;
              padding-top: 15vh;
            }
            .command-palette-modal {
              width: 100%;
              max-width: 640px;
              height: min-content;
              max-height: 480px;
              background: rgba(15, 15, 20, 0.9);
              border: 1px solid rgba(139, 92, 246, 0.3);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1);
              border-radius: 16px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .palette-search-container {
              display: flex;
              align-items: center;
              padding: 16px 20px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              gap: 16px;
            }
            .palette-search-container input {
              flex: 1;
              background: none;
              border: none;
              color: white;
              font-size: 1.1rem;
              outline: none;
            }
            .palette-badge {
              background: rgba(255, 255, 255, 0.05);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.4);
              display: flex;
              align-items: center;
              gap: 4px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .palette-results {
              overflow-y: auto;
              padding: 8px;
            }
            .palette-item {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              border-radius: 10px;
              gap: 16px;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .palette-item.selected {
              background: rgba(139, 92, 246, 0.15);
              transform: translateX(4px);
            }
            .item-icon {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 8px;
              color: rgba(255, 255, 255, 0.6);
            }
            .palette-item.selected .item-icon {
              color: #a78bfa;
              background: rgba(139, 92, 246, 0.2);
            }
            .item-content {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .item-label {
              font-weight: 500;
              color: rgba(255, 255, 255, 0.9);
            }
            .item-category {
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.4);
            }
            .item-shortcut {
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.3);
              font-family: monospace;
            }
            .palette-footer {
              padding: 12px 20px;
              background: rgba(0, 0, 0, 0.2);
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .footer-tip {
              display: flex;
              gap: 16px;
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.4);
            }
            .footer-tip kbd {
              background: rgba(255, 255, 255, 0.08);
              padding: 1px 4px;
              border-radius: 3px;
              margin-right: 4px;
            }
            .footer-status {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.7rem;
              color: #a78bfa;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 600;
            }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
