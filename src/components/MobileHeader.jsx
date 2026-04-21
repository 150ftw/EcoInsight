import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Zap, ShieldCheck } from 'lucide-react';
import UserAccountMenu from './UserAccountMenu';

const MobileHeader = ({ 
    onMenuClick, 
    isOpen, 
    activeView, 
    user, 
    profile, 
    setIsAccountModalOpen, 
    performanceMode, 
    setPerformanceMode 
}) => {
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    const toggleModel = () => {
        setPerformanceMode(!performanceMode);
        setIsModelDropdownOpen(false);
    };

    return (
        <div className="mobile-header-container">
            <motion.div 
                className="mobile-header mobile-header-tri"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 'calc(60px + env(safe-area-inset-top))',
                    background: 'rgba(10, 10, 12, 0.95)',
                    backdropFilter: 'blur(25px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: 'env(safe-area-inset-top) 0.75rem 0',
                    zIndex: 1000
                }}
            >
                {/* LEFT: MENU TRIGGER */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onMenuClick}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)'
                    }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>

                {/* CENTER: MODEL SELECTOR */}
                <div style={{ position: 'relative', justifySelf: 'center' }}>
                    <div 
                        className="model-selector-pill"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    >
                        <span className="model-selector-text">
                            {performanceMode ? 'Eko Tactical' : 'Eko Institutional'}
                        </span>
                        <ChevronDown size={14} className={isModelDropdownOpen ? 'rotate-180' : ''} />
                    </div>

                    <AnimatePresence>
                        {isModelDropdownOpen && (
                            <>
                                <div 
                                    style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                                    onClick={() => setIsModelDropdownOpen(false)} 
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        left: '50%',
                                        translateX: '-50%',
                                        width: '220px',
                                        background: 'rgba(20, 20, 24, 0.98)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '8px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                        zIndex: 11
                                    }}
                                >
                                    <div 
                                        className={`dropdown-item ${performanceMode ? 'active' : ''}`}
                                        onClick={() => toggleModel()}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            background: performanceMode ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <Zap size={16} color={performanceMode ? '#8b5cf6' : 'rgba(255,255,255,0.4)'} />
                                        <div>
                                            <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Eko Tactical</div>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Optimized for speed & mobile data.</div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`dropdown-item ${!performanceMode ? 'active' : ''}`}
                                        onClick={() => toggleModel()}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            background: !performanceMode ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginTop: '4px'
                                        }}
                                    >
                                        <ShieldCheck size={16} color={!performanceMode ? '#8b5cf6' : 'rgba(255,255,255,0.4)'} />
                                        <div>
                                            <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Eko Institutional</div>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Deep analytical synthesis & charts.</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: USER PROFILE */}
                <UserAccountMenu
                    side="bottom"
                    align="end"
                    role={`${profile?.tier || 'Free'} Access`}
                    onSettingsClick={() => setIsAccountModalOpen(true)}
                >
                    {() => (
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {user?.profile_image ? (
                                    <img src={user.profile_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                                ) : (
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>
                                        {user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'S'}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </UserAccountMenu>
            </motion.div>
            <div style={{ height: 'calc(60px + env(safe-area-inset-top))' }} className="mobile-spacer" />
        </div>
    );
};

export default MobileHeader;
