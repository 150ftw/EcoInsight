import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, Camera, Check, ArrowRight, Loader2 } from 'lucide-react';

const OnboardingView = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.fullName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        if (!name || !username) return;
        setIsSubmitting(true);
        
        // Ensure username has @
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;
        
        // Simulate a brief delay for premium feel
        setTimeout(() => {
            onComplete({
                name,
                username: formattedUsername,
                avatar: user?.imageUrl || null,
                onboarded: true
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-bg-glow" />
            
            <motion.div 
                className="onboarding-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
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

                    <div className="onboarding-avatar-preview">
                        <div className="avatar-circle">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="Profile" />
                            ) : (
                                <Camera size={24} />
                            )}
                        </div>
                        <div className="avatar-info">
                            <span className="avatar-status">Linked from Auth Provider</span>
                            <p>You can change your avatar later in your account settings.</p>
                        </div>
                    </div>

                    <button 
                        className="btn-complete-onboarding"
                        disabled={!name || !username || isSubmitting}
                        onClick={handleComplete}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" size={20} /> Initializing Profile...</>
                        ) : (
                            <>Complete Onboarding <ArrowRight size={18} /></>
                        )}
                    </button>
                </div>

                <div className="onboarding-footer">
                    <Check size={14} /> Your data is encrypted and saved to your private Supabase node.
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingView;
