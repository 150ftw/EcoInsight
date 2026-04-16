import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ChevronUp } from 'lucide-react';

const ModelSelector = ({ performanceMode, setPerformanceMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ bottom: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && !containerRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    // Use pointerdown for better mobile touch support
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      // Ensure dropdown doesn't overflow right edge on narrow screens
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      
      setCoords({
        bottom: window.innerHeight - rect.top + 10,
        left: Math.max(10, left),
        width: rect.width
      });
    }
  };

  useEffect(() => {
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

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="model-selector-container" ref={containerRef}>
      <button 
        ref={triggerRef}
        className={`model-selector-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggle}
        type="button"
        title={performanceMode ? "Eco Mode Active" : "High Fidelity Active"}
      >
        <div className={`model-active-badge ${performanceMode ? 'eco' : 'high'}`}>
          {performanceMode ? <Zap size={14} /> : <Sparkles size={14} />}
          <span>{performanceMode ? 'ECO' : 'HIGH'}</span>
        </div>
        <ChevronUp size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </button>

      {isOpen && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            key="model-dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="model-dropdown-menu"
            style={{
              position: 'fixed',
              bottom: `${coords.bottom}px`,
              left: `${coords.left}px`,
              width: '260px',
              zIndex: 9999
            }}
          >
            <div 
              className={`model-dropdown-item ${!performanceMode ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setPerformanceMode(false);
                setIsOpen(false);
              }}
            >
              <div className="model-item-header">
                <Sparkles size={16} style={{ color: '#a78bfa' }} />
                <span className="model-item-title">High Fidelity</span>
              </div>
              <p className="model-item-desc">Full Neural Synthesis for maximum analytical depth.</p>
            </div>

            <div className="model-dropdown-divider" />

            <div 
              className={`model-dropdown-item ${performanceMode ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setPerformanceMode(true);
                setIsOpen(false);
              }}
            >
              <div className="model-item-header">
                <Zap size={16} style={{ color: '#f59e0b' }} />
                <span className="model-item-title">Eco Mode</span>
              </div>
              <p className="model-item-desc">High-speed bypass optimized for rapid sketching.</p>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ModelSelector;
