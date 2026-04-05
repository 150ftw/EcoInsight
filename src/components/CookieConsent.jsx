import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ArrowRight } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('eko_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('eko_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('eko_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="cookie-consent-banner"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className="cookie-banner-content">
                        <div className="cookie-icon-wrapper">
                            <Cookie className="cookie-icon" size={24} />
                        </div>
                        <div className="cookie-text">
                            <h3>Analytical Integrity</h3>
                            <p>
                                We use essential cookies to maintain your analytical sessions and ensure the security of your institutional data.
                                By continuing, you agree to our standard data protocols.
                            </p>
                        </div>
                        <div className="cookie-actions">
                            <button className="btn-cookie-secondary" onClick={handleDecline}>
                                Decline
                            </button>
                            <button className="btn-cookie-primary" onClick={handleAccept}>
                                Accept & Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
