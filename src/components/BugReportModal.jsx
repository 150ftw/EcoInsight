import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Send, CheckCircle, AlertCircle } from 'lucide-react';

const BugReportModal = ({ isOpen, onClose }) => {
    const [report, setReport] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!report.trim()) return;

        setIsSubmitting(true);
        try {
            // Web3Forms Integration
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
                    subject: 'New Bug Report - EcoInsight',
                    message: report,
                    from_name: 'EcoInsight User',
                    tags: 'bug-report'
                })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setReport('');
                    setStatus('idle');
                    onClose();
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="modal-overlay" 
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)', 
                        zIndex: 10001 
                    }}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            maxWidth: '500px',
                            background: 'rgba(9, 9, 11, 0.95)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        <button 
                            className="close-btn" 
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.25rem',
                                right: '1.25rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <X size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                <Bug style={{ color: '#ef4444' }} size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: '600' }}>Report a Bug</h3>
                        </div>

                        {status === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} className="text-accent" style={{ marginBottom: '1rem' }} />
                                <h4>Report Received</h4>
                                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Our engineers have been notified. Thank you for helping us improve!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    Found a glitch in the matrix? Let us know what happened and we'll fix it ASAP.
                                </p>
                                <textarea
                                    value={report}
                                    onChange={(e) => setReport(e.target.value)}
                                    placeholder="Describe the bug..."
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        marginBottom: '1.5rem',
                                        resize: 'none'
                                    }}
                                />

                                {status === 'error' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                        <AlertCircle size={16} /> Error submitting report. Please try again.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !report.trim()}
                                    className="btn-shine-primary"
                                    style={{ width: '100%', borderRadius: '12px', padding: '1rem', fontWeight: '600' }}
                                >
                                    {isSubmitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Submitting...</span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            <Send size={18} /> Submit Bug Report
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BugReportModal;
