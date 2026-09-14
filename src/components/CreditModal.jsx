import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldAlert, Zap } from 'lucide-react';

const CreditModal = ({ isOpen, onClose, type = "development" }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="credit-modal-overlay">
                <motion.div
                    className="credit-modal-card"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="modal-glow" />

                    {type === "intelligence_hub" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                    <Zap size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Neural Intelligence Node Locked</h2>
                                <p>
                                    This intelligence hub is currently undergoing synchronization with institutional data pipelines. Advanced sector sentiment and neural portfolio analysis are still being calibrated.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    We're rolling this out gradually as we validate accuracy at scale.
                                </p>
                            </div>
                        </>
                    ) : type === "market_dashboard" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                    <ShieldAlert size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Live Market Dashboard Locked</h2>
                                <p>
                                    This dashboard is still being calibrated against our high-frequency data streams before we open it up.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Check back soon — we're rolling this out in phases.
                                </p>
                            </div>
                        </>
                    ) : type === "development" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#fbbf24' }}>
                                    <Zap size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Feature in Development</h2>
                                <p>
                                    Our team is currently building out this module. We're ensuring institutional-grade accuracy before it ships.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Thanks for your patience while we get it right.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon">
                                    <Zap size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Access Restricted</h2>
                                <p>
                                    This module is currently restricted.
                                </p>
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button className="btn-secondary-modal" onClick={onClose}>
                            I understand
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreditModal;
