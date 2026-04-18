import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Command, LayoutDashboard, MessageCircle, 
  Settings, LogOut, Moon, Sun, Terminal, 
  Zap, Compass, ShieldCheck, TrendingUp,
  BarChart3, Newspaper, Activity, Globe,
  Briefcase, Star, Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, 
  ResponsiveContainer 
} from 'recharts';
import { searchTickers, fetchHistory } from '../lib/DashboardData';

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  onAction,
  user
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const staticCommands = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={18} />, category: 'Navigation', shortcut: 'G D' },
    { id: 'chat', label: 'Direct AI Chat', icon: <MessageCircle size={18} />, category: 'Intelligence', shortcut: 'G C' },
    { id: 'insights', label: 'Intelligence Hub', icon: <Compass size={18} />, category: 'Navigation', shortcut: 'G I' },
    { id: 'settings', label: 'Account Settings', icon: <Settings size={18} />, category: 'Elite Identity', shortcut: 'S' },
    { id: 'terminal', label: 'Open Analysis Terminal', icon: <Terminal size={18} />, category: 'Advanced Tools', shortcut: 'T' },
    { id: 'signout', label: 'Sign Out', icon: <LogOut size={18} />, category: 'System', shortcut: 'Q' },
  ];

  // Derive final results list
  const filteredCommands = query.startsWith('/') 
    ? staticCommands.filter(c => c.label.toLowerCase().includes(query.slice(1).toLowerCase()))
    : staticCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const finalResults = [
    ...filteredCommands.map(c => ({ ...c, type: 'command' })),
    ...searchResults.map(s => ({ 
        id: `ticker_${s.symbol}`, 
        label: s.name, 
        symbol: s.symbol,
        sparkline: s.sparkline || [],
        isPositive: s.isPositive,
        icon: <TrendingUp size={18} />, 
        category: `Market: ${s.exch || 'Global'}`, 
        type: 'ticker' 
    }))
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced Ticker Search
  useEffect(() => {
    if (query.length < 2 || query.startsWith('/')) {
        setSearchResults([]);
        return;
    }

    const timer = setTimeout(async () => {
        setIsSearching(true);
        const results = await searchTickers(query);
        
        // Hydrate top 3 results with basic history for sparklines
        if (results && results.length > 0) {
            const hydrationTargets = results.slice(0, 3);
            const hydrated = await Promise.all(hydrationTargets.map(async (res) => {
                const history = await fetchHistory(res.symbol, '1d', '15m');
                return { ...res, sparkline: history?.sparkline || [], isPositive: history?.isPositive };
            }));
            
            const merged = results.map(r => {
                const h = hydrated.find(item => item.symbol === r.symbol);
                return h || r;
            });
            setSearchResults(merged);
        } else {
            setSearchResults([]);
        }
        setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % finalResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + finalResults.length) % finalResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (finalResults[selectedIndex]) {
            handleSelect(finalResults[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, finalResults, selectedIndex]);

  const handleSelect = (item) => {
    if (item.type === 'ticker') {
        onAction({ type: 'SELECT_TICKER', symbol: item.symbol });
    } else {
        onAction(item.id);
    }
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
              {isSearching ? <Loader2 className="animate-spin text-purple-400" size={20} /> : <Search className="search-icon" size={20} />}
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search tickers (e.g. RELIANCE) or type / for commands..."
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
              {finalResults.length > 0 ? (
                <div className="palette-list">
                  {finalResults.map((item, idx) => (
                    <div 
                      key={item.id}
                      className={`palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => handleSelect(item)}
                    >
                      <div className={`item-icon ${item.type}`}>
                        {item.icon}
                      </div>
                      <div className="item-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="item-label">{item.label}</span>
                            {item.symbol && <span className="item-symbol-tag">{item.symbol}</span>}
                        </div>
                        <span className="item-category">{item.category}</span>
                      </div>
                      
                      {item.type === 'ticker' && item.sparkline?.length > 0 && (
                        <div className="palette-sparkline">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={item.sparkline}>
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke={item.isPositive ? '#22c55e' : '#ef4444'} 
                                        fill={item.isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}
                                        strokeWidth={1.5}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                      )}

                      {item.shortcut ? (
                        <div className="item-shortcut">{item.shortcut}</div>
                      ) : (
                        <ArrowRight size={14} className="item-arrow-hint" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="palette-no-results">
                  <Zap size={24} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>No results found for "{query}"</p>
                  <span style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '8px' }}>Try searching for Indian tickers or global macro indices</span>
                </div>
              )}
            </div>

            <div className="palette-footer">
              <div className="footer-tip">
                <span><kbd>↑↓</kbd> Navigate</span>
                <span><kbd>↵</kbd> Select</span>
                <span><kbd>/</kbd> Commands</span>
              </div>
              <div className="footer-status">
                <ShieldCheck size={12} /> Institutional Feed v8.0
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
              max-height: 520px;
              background: rgba(10, 10, 15, 0.95);
              border: 1px solid rgba(139, 92, 246, 0.3);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.1);
              border-radius: 20px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .palette-search-container {
              display: flex;
              align-items: center;
              padding: 20px 24px;
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
              background: rgba(139, 92, 246, 0.1);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 0.75rem;
              color: #a78bfa;
              display: flex;
              align-items: center;
              gap: 4px;
              border: 1px solid rgba(139, 92, 246, 0.3);
            }
            .palette-results {
              overflow-y: auto;
              padding: 12px;
            }
            .palette-item {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              border-radius: 12px;
              gap: 16px;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              margin-bottom: 4px;
              position: relative;
            }
            .palette-item.selected {
              background: rgba(139, 92, 246, 0.15);
              transform: translateX(6px);
              box-shadow: inset 0 0 10px rgba(139, 92, 246, 0.05);
            }
            .item-icon {
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(255, 255, 255, 0.03);
              border-radius: 10px;
              color: rgba(255, 255, 255, 0.4);
            }
            .item-icon.ticker {
                color: #22c55e;
                background: rgba(34, 197, 94, 0.05);
                border: 1px solid rgba(34, 197, 94, 0.1);
            }
            .palette-item.selected .item-icon {
              color: #a78bfa;
              background: rgba(139, 92, 246, 0.2);
              border-color: rgba(139, 92, 246, 0.3);
            }
            .item-content {
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .item-label {
              font-weight: 600;
              color: rgba(255, 255, 255, 0.9);
              font-size: 0.95rem;
            }
            .item-symbol-tag {
                font-size: 0.7rem;
                background: rgba(255, 255, 255, 0.05);
                padding: 1px 6px;
                border-radius: 4px;
                color: rgba(255, 255, 255, 0.4);
                font-family: monospace;
            }
            .item-category {
              font-size: 0.75rem;
              color: rgba(139, 92, 246, 0.6);
              font-weight: 500;
              margin-top: 2px;
            }
            .palette-sparkline {
                width: 70px;
                height: 28px;
                opacity: 0.5;
                margin-right: 8px;
            }
            .palette-item.selected .palette-sparkline {
                opacity: 1;
            }
            .item-shortcut {
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.3);
              font-family: monospace;
              background: rgba(255, 255, 255, 0.03);
              padding: 2px 6px;
              border-radius: 4px;
            }
            .item-arrow-hint {
                opacity: 0;
                color: #a78bfa;
                transition: opacity 0.2s ease;
            }
            .palette-item.selected .item-arrow-hint {
                opacity: 1;
            }
            .palette-footer {
              padding: 14px 24px;
              background: rgba(0, 0, 0, 0.3);
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
              background: rgba(255, 255, 255, 0.1);
              padding: 1px 5px;
              border-radius: 4px;
              margin-right: 4px;
              color: rgba(255, 255, 255, 0.7);
            }
            .footer-status {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.7rem;
              color: #a78bfa;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              font-weight: 700;
            }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
