import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, Activity } from 'lucide-react';

const IntelligenceHubNotification = ({ 
    onOpen, 
    onClose, 
    title = "Intelligence Hub Upgrade", 
    message = "Experience the new Today's Insights & Market Pulse with real-time institutional telemetry.",
    badge = "New Features Live",
    icon = <Sparkles size={18} className="text-purple-400" />,
    actionLabel = "Explore Hub"
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500); // Wait for exit animation
        }, 8000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 500);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    className="intel-hub-notification"
                    style={{
                        position: 'fixed',
                        top: '24px',
                        right: '24px',
                        width: '320px',
                        background: 'rgba(15, 15, 20, 0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '20px',
                        padding: '1.25rem',
                        zIndex: 25000,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(139, 92, 246, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}
                >
                    <button 
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.3)',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '10px', 
                            background: 'rgba(139, 92, 246, 0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            {icon}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{title}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{badge}</span>
                        </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                        {message}
                    </p>

                    <button
                        onClick={() => {
                            if (onOpen) onOpen();
                            handleClose();
                        }}
                        style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                    >
                        {actionLabel} <ChevronRight size={14} />
                    </button>

                    <div style={{ 
                        height: '2px', 
                        background: 'rgba(139, 92, 246, 0.2)', 
                        width: '100%', 
                        borderRadius: '1px',
                        overflow: 'hidden'
                    }}>
                        <motion.div 
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 8, ease: 'linear' }}
                            style={{ height: '100%', background: 'var(--accent-primary)' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntelligenceHubNotification;
