import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, Camera, Check, ArrowRight, Loader2, Globe, TrendingUp, Briefcase } from 'lucide-react';

const OnboardingView = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.fullName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [avatar, setAvatar] = useState(user?.imageUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const PRESET_AVATARS = [
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite1&backgroundColor=b6e3f4,c0aede,d1d4f9',
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite2&backgroundColor=b6e3f4,c0aede,d1d4f9',
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite3&backgroundColor=b6e3f4,c0aede,d1d4f9',
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite4&backgroundColor=b6e3f4,c0aede,d1d4f9',
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite5&backgroundColor=b6e3f4,c0aede,d1d4f9',
        'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Elite6&backgroundColor=b6e3f4,c0aede,d1d4f9'
    ];

    const handleComplete = async () => {
        if (step === 1 && (!name || !username)) return;
        if (step === 1) {
            setStep(2);
            return;
        }

        setIsSubmitting(true);
        
        // Ensure username has @
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;
        
        // Simulate a brief delay for premium feel
        setTimeout(() => {
            onComplete({
                name,
                username: formattedUsername,
                avatar: avatar,
                goal: selectedGoal,
                onboarded: true
            });
            setIsSubmitting(false);
        }, 1500);
    };

    const [selectedGoal, setSelectedGoal] = useState('Trading');

    const GOALS = [
        { id: 'Learning', label: 'Learning & Research', icon: <Globe size={18} />, desc: 'Mastering macroeconomic theories and Bharat\'s growth story.' },
        { id: 'Trading', label: 'Active Trading', icon: <TrendingUp size={18} />, desc: 'Seeking short-term patterns and real-time market sentiment.' },
        { id: 'Investing', label: 'Long-term Investing', icon: <Briefcase size={18} />, desc: 'Building generational wealth through deep fiscal analysis.' }
    ];

    return (
        <div className="onboarding-container">
            <div className="onboarding-bg-glow" />
            
            <motion.div 
                className="onboarding-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {step === 1 ? (
                    <>
                        <div className="onboarding-header">
                            <div className="onboarding-logo-badge">
                                <User size={32} />
                            </div>
                            <h1>Set Up Your Analyst Identity</h1>
                            <p>Every account on EcoInsight must be unique. Your identity will be attached to all generated market reports.</p>
                        </div>

                        <div className="onboarding-form">
                            <div className="onboarding-field">
                                <label><User size={14} /> Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Warren Buffett" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <span className="field-hint">Your name appears on exported PDF analysis.</span>
                            </div>

                            <div className="onboarding-field">
                                <label><AtSign size={14} /> Username</label>
                                <div className="username-input-wrapper">
                                    <span>@</span>
                                    <input 
                                        type="text" 
                                        placeholder="analyst_pro" 
                                        value={username.replace('@', '')}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <span className="field-hint">A unique identifier for your economic insights.</span>
                            </div>

                            <div className="onboarding-avatar-section">
                                <label><Camera size={14} /> Profile Identity Icon</label>
                                <div className="onboarding-avatar-header">
                                    <div className="avatar-circle-large">
                                        {avatar ? (
                                            <img src={avatar} alt="Profile" />
                                        ) : (
                                            <span className="avatar-placeholder">{name.charAt(0) || <User size={32} />}</span>
                                        )}
                                        <div className="avatar-badge">Pro</div>
                                    </div>
                                    <div className="avatar-selection-controls">
                                        <span className="field-hint">Select a neural identity or paste a URL</span>
                                        <div className="avatar-presets-grid">
                                            {PRESET_AVATARS.map((url, i) => (
                                                <button 
                                                    key={i} 
                                                    type="button" 
                                                    className={`avatar-preset-btn ${avatar === url ? 'active' : ''}`}
                                                    onClick={() => setAvatar(url)}
                                                >
                                                    <img src={url} alt={`Preset ${i}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                className="btn-complete-onboarding"
                                disabled={!name || !username}
                                onClick={handleComplete}
                            >
                                Continue to Goal Selection <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="onboarding-header">
                            <div className="onboarding-logo-badge">
                                <TrendingUp size={32} />
                            </div>
                            <h1>What is your objective?</h1>
                            <p>We'll tailor your dashboard and AI insights based on your primary focus.</p>
                        </div>

                        <div className="onboarding-goals-grid">
                            {GOALS.map((goal) => (
                                <div 
                                    key={goal.id} 
                                    className={`goal-card ${selectedGoal === goal.id ? 'active' : ''}`}
                                    onClick={() => setSelectedGoal(goal.id)}
                                >
                                    <div className="goal-icon">{goal.icon}</div>
                                    <div className="goal-info">
                                        <h3>{goal.label}</h3>
                                        <p>{goal.desc}</p>
                                    </div>
                                    {selectedGoal === goal.id && <div className="goal-check"><Check size={16} /></div>}
                                </div>
                            ))}
                        </div>

                        <button 
                            className="btn-complete-onboarding"
                            disabled={isSubmitting}
                            onClick={handleComplete}
                            style={{ marginTop: '2rem' }}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin" size={20} /> Initializing Profile...</>
                            ) : (
                                <>Complete Initialization <Check size={18} /></>
                            )}
                        </button>
                        
                        <button className="onboarding-back-btn" onClick={() => setStep(1)} disabled={isSubmitting}>
                            Go Back
                        </button>
                    </>
                )}


                <div className="onboarding-footer">
                    <Check size={14} /> Your data is encrypted and saved to your private Supabase node.
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingView;
