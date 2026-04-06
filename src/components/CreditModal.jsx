import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, ShieldAlert, Zap } from 'lucide-react';

const CreditModal = ({ isOpen, onClose, lastRechargeDate, onUpgrade, type = "credits" }) => {
    if (!isOpen) return null;

    const nextRechargeDate = new Date(lastRechargeDate || new Date());
    if (lastRechargeDate) {
        nextRechargeDate.setDate(nextRechargeDate.getDate() + 7);
    }

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
                    
                    {type === "credits" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon">
                                    <Clock size={32} />
                                </div>
                                <h2>Capacity reached. Let's take a breather.</h2>
                                <p>
                                    Your analytical credits for this week are fully utilized. 
                                    To ensure high-quality, real-time compute for all users, we recharge free credits every 7 days.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Quality AI models require significant compute resources to run. We appreciate your patience as we scale our infrastructure.
                                </p>
                            </div>

                            <div className="recharge-info">
                                <div className="info-item">
                                    <Clock size={16} />
                                    <span>Next Auto-Recharge</span>
                                    <span className="date-value">{nextRechargeDate.toLocaleDateString()}</span>
                                </div>
                            </div>
                        </>
                    ) : type === "intelligence_hub" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                    <Zap size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Neural Intelligence Node Locked</h2>
                                <p>
                                    This proprietary intelligence hub is currently undergoing synchronization with institutional data pipelines. Advanced sector sentiment and neural portfolio analysis are restricted to Sentinel tier analysts.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Your credential level is currently being validated across our decentralized node network. Retail access windows open quarterly.
                                </p>
                            </div>
                        </>
                    ) : type === "market_dashboard" ? (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>
                                    <ShieldAlert size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Institutional Access Restricted</h2>
                                <p>
                                    The Live Market Dashboard is currently restricted to our Institutional & Enterprise partners while we calibrate our high-frequency data streams.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Retail access for Sentinel members is scheduled for Q3 2026. Join the priority waitlist to get notified of our next roll-out.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="modal-header">
                                <div className="alert-icon">
                                    <ShieldAlert size={32} />
                                </div>
                                <h2 style={{ letterSpacing: '-0.5px' }}>Pro Features: In Development</h2>
                                <p>
                                    These institutional-grade features—including our What-If Simulator and Event Predictor—are premium modules currently undergoing final refinement.
                                </p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', fontStyle: 'italic' }}>
                                    Access will be rolled out exclusively to Pro & Sentinel subscribers in the coming months as we deploy our next-generation neural architecture.
                                </p>
                            </div>
                        </>
                    )}

                    <div className="modal-actions">
                        <button className="btn-secondary-modal" onClick={onClose}>
                            I understand
                        </button>
                    </div>

                    <div className="modal-footer">
                        <Sparkles size={14} /> Sentinel members get unlimited neural compute
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreditModal;
