import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, ShieldAlert, Zap } from 'lucide-react';

const CreditModal = ({ isOpen, onClose, lastRechargeDate, onUpgrade }) => {
    if (!isOpen) return null;

    const nextRechargeDate = new Date(lastRechargeDate);
    nextRechargeDate.setDate(nextRechargeDate.getDate() + 7);

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
                    
                    <div className="modal-header">
                        <div className="alert-icon">
                            <ShieldAlert size={32} />
                        </div>
                        <h2>Credit Limit Reached</h2>
                        <p>Your weekly analytical capacity has been reached. To maintain the highest compute quality, we restrict free tier frequency.</p>
                    </div>

                    <div className="recharge-info">
                        <div className="info-item">
                            <Clock size={16} />
                            <span>Next Auto-Recharge</span>
                            <span className="date-value">{nextRechargeDate.toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-upgrade-now" onClick={onUpgrade}>
                            <Zap size={18} /> Upgrade to Sentinel <ArrowRight size={16} />
                        </button>
                        <button className="btn-secondary-modal" onClick={onClose}>
                            Maybe Later
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
