import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, BarChart3, Globe, Sparkles, Zap } from 'lucide-react';

const AIEconomicPulse = ({ syncBackground }) => {
    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onMouseLeave={() => syncBackground && syncBackground({ color: '#8b5cf6', amplitude: 1.0, distance: 0.2 })}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10, flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                        <Activity className="text-accent" size={24} /> AI Economic Pulse
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0, maxWidth: '500px' }}>
                        Real-time neural synthesis of India's macroeconomic stability, aggregating Nifty, RBI, CPI, and sectoral data into actionable metrics.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', whiteSpace: 'nowrap' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em' }}>SYS: OPTIMAL (78/100)</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
                {[
                    { label: 'Inflation Trajectory', value: '2.4%', target: 'Target: 2.0%', icon: <TrendingUp size={20} />, color: '#f59e0b', desc: 'Core PCE stabilizing. Services inflation remains sticky but clear disinflationary trend intact.', chart: [40, 60, 45, 70, 50, 80, 65] },
                    { label: 'Repo Rate (RBI)', value: '6.50%', target: 'Pause maintained', icon: <BarChart3 size={20} />, color: '#3b82f6', desc: 'RBI remains watchful. Markets pricing in 1-2 rate cuts by end of fiscal year amid cooling CPI.', chart: [20, 30, 50, 80, 100, 100, 100] },
                    { label: 'India GDP Est.', value: '+6.8%', target: 'YoY Projection', icon: <Globe size={20} />, color: '#10b981', desc: 'India remains fastest growing major economy. Domestic consumption and capex driving momentum.', chart: [30, 40, 35, 55, 50, 75, 80] },
                    { label: 'Market Sentiment', value: 'Bullish', target: 'Fear & Greed: 72', icon: <Sparkles size={20} />, color: '#d946ef', desc: 'FII inflows positive. Nifty sector rotation into financials and infra driving broad index higher.', chart: [50, 40, 60, 55, 70, 85, 90] }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255, 255, 255, 0.03)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', cursor: 'pointer' }}
                        onMouseEnter={() => syncBackground && syncBackground({ color: stat.color, amplitude: 1.5, distance: 0.5 })}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                <div style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                    <span style={{ color: stat.color }}>{stat.icon}</span> {stat.label}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{stat.target}</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', textShadow: `0 0 15px ${stat.color}40` }}>{stat.value}</div>
                        </div>

                        {/* Mini Sparkline Chart */}
                        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '0.5rem' }}>
                            {stat.chart.map((height, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    style={{ flex: 1, background: stat.color, opacity: 0.2 + (idx / stat.chart.length) * 0.8, borderRadius: '2px 2px 0 0' }}
                                />
                            ))}
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0, lineHeight: '1.5', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                            {stat.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                <Zap size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1rem' }}>AI Synthesis Report</h4>
                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        The macroeconomic environment is demonstrating a "soft landing" profile. Disinflation is progressing without triggering significant labor market deterioration. Equities are pricing in a goldilocks scenario, though geopolitical risks and commercial real estate refinancing cliffs remain notable tail risks for Q3/Q4.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default AIEconomicPulse;
