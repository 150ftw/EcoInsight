import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, BarChart3, Info, RefreshCw, Cpu, Zap } from 'lucide-react';
import { fetchPulseRegistry } from '../lib/MarketData';
import SentimentGauge from './SentimentGauge';

const MarketPulseDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPulseData = async () => {
        try {
            const registry = await fetchPulseRegistry();
            if (registry) {
                setData(registry);
            }
            setLoading(false);
        } catch (e) {
            console.error("Pulse Dashboard load failed:", e);
        }
    };

    useEffect(() => {
        loadPulseData();
        const interval = setInterval(loadPulseData, 60000); // 1 min refresh is more stable for scraping
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading || !data) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '80vh', 
                width: '100%', 
                gap: '1rem',
                color: '#c084fc'
            }}>
                <RefreshCw className="animate-spin" size={32} />
                <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    textAlign: 'center'
                }}>
                    Initializing Neural Market Flux...
                </span>
            </div>
        );
    }

    const { pulse, vix, vixChange, vixIsPositive, breadth, liquidity, timestamp } = data;

    return (
        <motion.div 
            className="market-pulse-full-dashboard"
            style={{ 
                padding: isMobile ? '70px 1rem 1.5rem' : '2rem 1.5rem', 
                maxWidth: '100%', 
                width: '100%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowX: 'hidden'
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Status Bar */}
            <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                marginBottom: '2.5rem',
                gap: isMobile ? '1.5rem' : '0'
            }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>Market Pulse <span style={{ color: 'var(--accent-primary)' }}>Command</span></h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>Advanced institutional telemetry for the Indian Stock Market.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '0.5rem' }}>
                        <div className="pulse-dot" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22c55e' }}>DATA STREAM ACTIVE</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>REFRESHED AT {timestamp.toLocaleTimeString()}</span>
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '100%' : 'repeat(12, 1fr)', 
                gap: '1.5rem',
                width: '100%',
                maxWidth: '100%'
            }}>
                
                {/* Sentiment Gauge Section */}
                <motion.div 
                    variants={itemVariants} 
                    style={{ gridColumn: isMobile ? '1 / -1' : 'span 4' }}
                >
                    <SentimentGauge 
                        score={pulse} 
                        label={pulse > 70 ? "Extreme Greed" : pulse < 30 ? "Extreme Fear" : "Neutral Stability"}
                        signals={["FII Net Pattern", "Nifty OI Change", "DII Position"]}
                    />
                </motion.div>

                {/* Volatility & Breadth Matrix */}
                <motion.div variants={itemVariants} style={{ 
                    gridColumn: isMobile ? '1 / -1' : 'span 8', 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '100%' : 'repeat(2, 1fr)', 
                    gap: '1.5rem',
                    width: '100%'
                }}>
                    
                    {/* Volatility Widget */}
                    <div className="panel-card" style={{ background: 'rgba(15, 15, 20, 0.4)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BarChart3 size={16} className="text-blue-400" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Volatility Pulse (India VIX)</span>
                            </div>
                            <Info size={14} style={{ opacity: 0.3 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800 }}>{vix.toFixed(2)}</span>
                            <span style={{ color: vix > 18 ? '#ef4444' : '#22c55e', fontSize: '1rem', fontWeight: 700 }}>
                                {vixIsPositive ? <TrendingUp size={16} style={{ display: 'inline', marginRight: '4px' }} /> : <TrendingDown size={16} style={{ display: 'inline', marginRight: '4px' }} />}
                                {vix > 18 ? 'HIGH RISK' : 'STABLE'}
                            </span>
                        </div>
                        <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                            {[...Array(20)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${20 + Math.random() * 60}%` }}
                                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                                    style={{ flex: 1, background: 'linear-gradient(to top, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.8))', borderRadius: '2px' }}
                                />
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                            {data.vixSummary || "India VIX is tracking below historical averages, indicating low near-term hedging demand."}
                        </p>
                    </div>

                    {/* Market Breadth Widget */}
                    <div className="panel-card" style={{ background: 'rgba(15, 15, 20, 0.4)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} className="text-emerald-400" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase' }}>Market Breadth (A/D)</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>{breadth.advances} Advancing</span>
                            <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{breadth.declines} Declining</span>
                        </div>
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', display: 'flex', marginBottom: '1.5rem' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(breadth.advances / (breadth.advances + breadth.declines)) * 100}%` }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
                            />
                            <div style={{ height: '100%', flex: 1, background: '#ef4444' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>A/D Ratio</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{(breadth.advances / breadth.declines).toFixed(2)}</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Strength</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>OVERWEIGHT</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Liquidity Flux Terminal */}
                <motion.div variants={itemVariants} style={{ gridColumn: isMobile ? '1 / -1' : 'span 12', width: '100%' }}>
                    <div className="panel-card" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '24px', padding: isMobile ? '1.25rem' : '1.5rem', border: '1px solid rgba(139, 92, 246, 0.15)', overflow: 'hidden', width: '100%' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <Cpu size={18} className="text-purple-400" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', color: 'white', textTransform: 'uppercase' }}>Liquidity & Volume Influx Matrix</span>
                        </div>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '100%' : 'repeat(5, 1fr)', 
                            gap: '1.5rem',
                            width: '100%'
                        }}>
                            {liquidity.map((item, i) => (
                                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'block' }}>{item.name}</span>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{item.price}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.isPositive ? '#10b981' : '#ef4444' }}>
                                            {item.isPositive ? '+' : ''}{item.change}%
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>VOL: {item.volume}</div>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.abs(parseFloat(item.change)) * 10 + 20)}%` }}
                                            style={{ height: '100%', background: item.isPositive ? '#10b981' : '#ef4444' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Critical Alerts Strip */}
                <motion.div variants={itemVariants} style={{ gridColumn: isMobile ? '1 / -1' : 'span 12', width: '100%' }}>
                    <div style={{ background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent)', borderLeft: '4px solid var(--accent-primary)', padding: '1rem 1.5rem', borderRadius: '0 12px 12px 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Zap size={18} className="text-purple-400" />
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                            <strong style={{ color: 'white' }}>Institutional Alert:</strong> {data.alert || "Significant block deal activity detected in Large-cap Banking sector. PCR at 1.05 suggests cautious optimism."}
                        </span>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default MarketPulseDashboard;
