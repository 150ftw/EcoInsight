import React, { useState, useMemo, useId, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, X, Sparkles, Bell } from 'lucide-react'
import './ComingSoon.css'

/* ---------- Inline Logo (matches existing EcoInsight branding) ---------- */
const CSLogo = ({ size = 44 }) => {
    const id = useId()
    const gId = `csGrad-${id.replace(/:/g, '')}`

    return (
        <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
            <defs>
                <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
            </defs>

            <rect x="40" y="40" width="432" height="432" rx="80"
                fill="rgba(10,10,12,0.8)"
                stroke={`url(#${gId})`} strokeWidth="8" opacity="0.8" />

            {[
                { x: 120, y: 300, h: 120, op: 0.4 },
                { x: 170, y: 260, h: 160, op: 0.6 },
                { x: 220, y: 220, h: 200, op: 0.8 },
                { x: 270, y: 180, h: 240, op: 1.0 },
            ].map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width="30" height={b.h} rx="4"
                    fill={`url(#${gId})`} opacity={b.op} />
            ))}

            <path d="M120 380 L220 280 L280 320 L400 150 M370 150 L400 150 L400 180"
                stroke="#fff" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />

            {[
                { cx: 200, cy: 180, r: 15 },
                { cx: 260, cy: 140, r: 22 },
                { cx: 320, cy: 200, r: 15 },
                { cx: 240, cy: 220, r: 12 },
            ].map((n, i) => (
                <circle key={i} cx={n.cx} cy={n.cy} r={n.r} fill="#fff" />
            ))}

            <g stroke="#fff" strokeWidth="4" opacity="0.3">
                <line x1="200" y1="180" x2="260" y2="140" />
                <line x1="260" y1="140" x2="320" y2="200" />
                <line x1="200" y1="180" x2="240" y2="220" />
                <line x1="260" y1="140" x2="240" y2="220" />
                <line x1="320" y1="200" x2="240" y2="220" />
            </g>
        </svg>
    )
}

/* ---------- Particle Field ---------- */
const Particles = () => {
    const particles = useMemo(() =>
        Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 15,
            color: Math.random() > 0.5
                ? `rgba(139, 92, 246, ${Math.random() * 0.4 + 0.1})`
                : `rgba(217, 70, 239, ${Math.random() * 0.4 + 0.1})`,
        })), [])

    return (
        <div className="cs-particles">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="cs-particle"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    )
}

/* ---------- Feature Chips ---------- */
const FEATURES = [
    { icon: '⚡', label: 'Neural Inference Engine' },
    { icon: '🌐', label: 'Real-Time Market Data' },
    { icon: '🧠', label: 'AI-Powered Analysis' },
    { icon: '📊', label: 'Policy Simulations' },
]

/* ---------- ComingSoon Component ---------- */
export default function ComingSoon() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [showWaitlistPopup, setShowWaitlistPopup] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            // Only show if not already submitted or if it's the first time
            const hasSeenPopup = sessionStorage.getItem('ecoinsight_waitlist_popup_seen');
            if (!hasSeenPopup) {
                setShowWaitlistPopup(true);
            }
        }, 5000)
        return () => clearTimeout(timer)
    }, [])

    const handleClosePopup = () => {
        setShowWaitlistPopup(false);
        sessionStorage.setItem('ecoinsight_waitlist_popup_seen', 'true');
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (email.trim()) {
            setSubmitted(true)
        }
    }

    return (
        <div className="coming-soon-root">
            {/* Background layers */}
            <div className="cs-grid-overlay" />

            {/* Main content */}
            <motion.div
                className="cs-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Headline */}
                <motion.h1
                    className="cs-headline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                >
                    <span className="cs-headline-text">Launching Soon</span>
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    className="cs-tagline"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <strong>AI-Powered Economic Intelligence</strong> for Indian Investors.
                    Real-time market analysis, policy simulations, and neural insights with Eko — all in one premium platform.
                </motion.p>

                {/* Waitlist Live Section (Restored as fallback) */}
                <motion.div
                    className="cs-waitlist-live"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="cs-waitlist-card">
                        <div className="cs-waitlist-content">
                            <div className="cs-waitlist-header">
                                <span className="cs-waitlist-badge">LIVE NOW</span>
                                <p className="cs-waitlist-text">The official waitlist is now live!</p>
                            </div>
                            <a 
                                href="https://www.joinecoinsight.dev" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="cs-waitlist-link"
                            >
                                <span>Join Waitlist</span>
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Status */}
                <motion.div
                    className="cs-status-bar"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="cs-status-dot" />
                    <span className="cs-status-text">Building something extraordinary</span>
                </motion.div>

                {/* Email CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.form
                                key="form"
                                className="cs-notify-form"
                                onSubmit={handleSubmit}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <input
                                    type="email"
                                    className="cs-email-input"
                                    placeholder="Enter your email for early access"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="cs-notify-btn">
                                    <span>Notify Me</span>
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                className="cs-submitted-msg"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                ✓ You&apos;re on the list! We&apos;ll notify you at launch.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Feature chips */}
                <motion.div
                    className="cs-features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                >
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            className="cs-chip"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + i * 0.1 }}
                        >
                            <span className="cs-chip-icon">{f.icon}</span>
                            {f.label}
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Footer */}
            <div className="cs-footer">
                <p className="cs-footer-text">
                    © 2026 Eko by EcoInsight &nbsp;·&nbsp;{' '}
                    <a href="mailto:support@ecoinsight.online" className="cs-footer-link">
                        support@ecoinsight.online
                    </a>
                </p>
            </div>

            {/* Waitlist Popup Overlay */}
            <AnimatePresence>
                {showWaitlistPopup && (
                    <motion.div 
                        className="cs-popup-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="cs-popup-card"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <button 
                                className="cs-popup-close"
                                onClick={handleClosePopup}
                            >
                                <X size={20} />
                            </button>

                            <div className="cs-popup-glow" />
                            
                            <div className="cs-popup-header">
                                <div className="cs-popup-icon-container">
                                    <Sparkles className="cs-popup-icon" size={24} />
                                </div>
                                <span className="cs-popup-badge">Early Access</span>
                            </div>

                            <h2 className="cs-popup-title">Official Waitlist is Live</h2>
                            
                            <p className="cs-popup-text">
                                Be the first to experience Bharat's most advanced economic intelligence engine. 
                                Join <strong>1,000+</strong> institutional researchers and elite traders.
                            </p>

                            <div className="cs-popup-cta-container">
                                <a 
                                    href="https://www.joinecoinsight.dev" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="cs-popup-btn"
                                    onClick={handleClosePopup}
                                >
                                    <span>Secure Your Spot</span>
                                    <ExternalLink size={16} />
                                </a>
                                <p className="cs-popup-note">Join 1,240+ people on the list</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
