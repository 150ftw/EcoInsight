import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity } from 'lucide-react';

const TechnicalPulse = ({ signals }) => {
    if (!signals) return null;

    return (
        <section className="panel-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                    <Cpu size={16} /> NEURAL TECHNICAL ANALYSIS
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="pulse-dot" />
                    <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 800 }}>LIVE SIGNALS</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="fundamental-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Relative Strength (RSI)</span>
                    <span className="value terminal-num" style={{ fontSize: '1.4rem', color: signals.rsi > 70 ? '#ef4444' : signals.rsi < 30 ? '#22c55e' : 'var(--accent-primary)' }}>
                        {signals.rsi}
                    </span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4, display: 'block' }}>{signals.rsi > 70 ? 'OVERBOUGHT' : signals.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}</span>
                </div>

                <div className="fundamental-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>MACD Histogram</span>
                    <span className="value" style={{ fontSize: '1.4rem', color: '#22c55e' }}>{signals.macd}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4, display: 'block' }}>BULLISH DIVERGENCE</span>
                </div>

                <div className="fundamental-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <span className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Aggregated Outlook</span>
                    <span className="value" style={{ fontSize: '1.4rem', color: 'var(--accent-primary)' }}>{signals.trend}</span>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4, display: 'block' }}>HIGH CONFIDENCE</span>
                </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    <Zap size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                    <strong>Neural Insight:</strong> Current momentum indicates a sustained breakout above the 50-day EMA. Recommend monitoring volume for confirmation.
                </p>
            </div>
        </section>
    );
};

export default TechnicalPulse;
