import React from 'react';
import { motion } from 'framer-motion';
import { Info, Zap, AlertTriangle } from 'lucide-react';

const SentimentGauge = ({ score = 50, label = "Neutral", signals = [], type = "market" }) => {
    // Score is 0-100: 0-30 Fear/Bearish, 31-70 Neutral, 71-100 Greed/Bullish
    
    const getSentimentColor = (s) => {
        if (s >= 70) return '#4ade80'; // Bullish Green
        if (s <= 30) return '#f87171'; // Bearish Red
        return '#fbbf24'; // Neutral Amber
    };

    const color = getSentimentColor(score);
    const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

    return (
        <div className="sentiment-gauge-card" style={{
            background: 'rgba(15, 15, 20, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '24px',
            margin: '16px 0',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="gauge-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={14} className="text-accent" style={{ color: '#c084fc' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {type === 'ticker' ? 'Asymmetric Asset Sentiment' : 'Institutional Market Pulse'}
                    </span>
                </div>
                <Info size={14} style={{ opacity: 0.3 }} />
            </div>

            <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0 auto 10px' }}>
                {/* Background Arc */}
                <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%' }}>
                    <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                    />
                    {/* Colored Indicator Arc */}
                    <motion.path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: score / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ opacity: 0.6, filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                </svg>

                {/* Needle */}
                <motion.div 
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        width: '2px',
                        height: '40px',
                        background: '#fff',
                        originX: '50%',
                        originY: '100%',
                        boxShadow: '0 0 15px rgba(255,255,255,0.5)',
                        zIndex: 2
                    }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '2px solid #000',
                    zIndex: 3
                }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}
                >
                    {score}<span style={{ fontSize: '0.8rem', opacity: 0.4, marginLeft: '2px' }}>/100</span>
                </motion.div>
                <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: `${color}20`,
                    color: color,
                    border: `1px solid ${color}40`,
                    marginBottom: '16px'
                }}>
                    {label}
                </div>
            </div>

            {signals && signals.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Underlying Signals:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {signals.map((signal, i) => (
                            <div key={i} style={{ 
                                fontSize: '0.7rem', 
                                color: 'rgba(255,255,255,0.7)', 
                                background: 'rgba(255,255,255,0.03)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }} />
                                {signal}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {score <= 30 && (
                <div style={{ 
                    marginTop: '16px', 
                    padding: '10px', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <AlertTriangle size={14} className="text-red-400" />
                    <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 500 }}>
                        High fear detected. Asymmetric entry opportunities typically emerge here.
                    </span>
                </div>
            )}
        </div>
    );
};

export default SentimentGauge;
