import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';

const MobileHeader = ({ onMenuClick, isOpen, activeView }) => {
    return (
        <div className="mobile-header-container">
            <motion.div 
                className="mobile-header"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 'calc(64px + env(safe-area-inset-top))',
                    background: 'rgba(10, 10, 12, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'env(safe-area-inset-top) 1.25rem 0',
                    zIndex: 1000
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="logo-icon-container" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Zap size={18} color="white" fill="white" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ 
                            fontSize: '14px', 
                            fontWeight: 700, 
                            letterSpacing: '0.05em',
                            color: 'white',
                            lineHeight: 1.1
                        }}>ECOINSIGHT</span>
                        <span style={{ 
                            fontSize: '9px', 
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            marginTop: '2px'
                        }}>{activeView?.replace('_', ' ') || 'INTEL'}</span>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMenuClick}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.button>
            </motion.div>
            <div style={{ height: '64px' }} className="mobile-spacer" />
        </div>
    );
};

export default MobileHeader;
