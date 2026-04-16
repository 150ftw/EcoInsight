import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Newspaper, TrendingUp, TrendingDown, ChevronRight, Zap, Target, PieChart, ShieldCheck } from 'lucide-react';
import { fetchInsightRegistry } from '../lib/MarketData';
import { fetchNiftySectors } from '../lib/DashboardData';

const IntelligenceInsightsReport = ({ onDeepDive }) => {
    const [data, setData] = useState(null);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadInsightData = async () => {
        try {
            const [registry, sectorData] = await Promise.all([
                fetchInsightRegistry(),
                fetchNiftySectors()
            ]);
            if (registry) setData(registry);
            if (sectorData) setSectors(sectorData);
            setLoading(false);
        } catch (e) {
            console.error("Insight Registry load failed:", e);
        }
    };

    useEffect(() => {
        loadInsightData();
        const interval = setInterval(loadInsightData, 300000); // 5 min refresh for insights
        return () => clearInterval(interval);
    }, []);

    const sectorIcons = {
        'IT': <ShieldCheck size={18} />,
        'Bank': <Target size={18} />,
        'Auto': <TrendingUp size={18} />,
        'FMCG': <PieChart size={18} />,
        'Metal': <Zap size={18} />,
        'Pharma': <Sparkles size={18} />,
        'Realty': <Target size={18} />,
        'Media': <PieChart size={18} />
    };

    if (loading) {
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
                <Sparkles className="animate-pulse" size={32} />
                <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    letterSpacing: '0.1em', 
                    textTransform: 'uppercase',
                    textAlign: 'center'
                }}>
                    Synthesizing Market Intelligence...
                </span>
            </div>
        );
    }

    return (
        <div className="intelligence-report-container" style={{ 
            padding: isMobile ? '70px 1rem 1.5rem' : '2rem 1.5rem', 
            maxWidth: '100%', 
            margin: '0 auto', 
            width: '100%',
            overflowX: 'hidden'
        }}>
            
            {/* Hero Insight Spotlight */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="insight-hero-spotlight"
                style={{ 
                    background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 10, 30, 0.6) 100%)',
                    borderRadius: '32px',
                    padding: isMobile ? '1.5rem' : '3rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    marginBottom: '2.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: isMobile ? '100%' : '400px', 
                    height: '100%', 
                    background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', 
                    pointerEvents: 'none' 
                }} />
                
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <div 
                            style={{ background: 'var(--accent-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: 'white', letterSpacing: '1px' }}
                        >
                            ELITE INSIGHT
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>ISSUE #284 • {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    
                    <h2 
                        style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, maxWidth: '800px' }}
                    >
                        {data.hero.title.split(':').map((part, i) => i === 1 ? <span key={i} style={{ color: 'var(--accent-primary)' }}>{part}</span> : part)}
                    </h2>
                    
                    <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: '700px', marginBottom: '2.5rem' }}>
                        {data.hero.desc}
                    </p>
                    
                    <button 
                        onClick={() => onDeepDive && onDeepDive(data.hero.title)}
                        style={{ 
                            background: 'white', 
                            color: 'black', 
                            padding: '1rem 2rem', 
                            borderRadius: '16px', 
                            fontWeight: 700, 
                            border: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Deep Dive Analysis <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '100%' : '1fr 380px', 
                gap: '2rem',
                width: '100%'
            }}>
                
                {/* News Wire & Sectoral Split */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                    
                    {/* Dalal Street Live Wire */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <Newspaper size={20} className="text-purple-400" />
                            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 700 }}>Dalal Street Live Wire</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.news.map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => window.open(item.link, '_blank')}
                                    style={{ 
                                        padding: '1.5rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {i % 2 === 0 ? <TrendingUp size={18} className="text-purple-400" /> : <Zap size={18} className="text-purple-400" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', fontWeight: 600 }}>MARKET ALERT • JUST NOW</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.title}</div>
                                    </div>
                                    <ChevronRight 
                                        size={16} 
                                        style={{ opacity: 0.2 }} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(item.link, '_blank');
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Intelligence */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                    
                    {/* Sectoral Sentiment Grid */}
                    <div className="panel-card" style={{ background: 'rgba(10, 10, 15, 0.6)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <PieChart size={18} className="text-blue-400" />
                            <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Sectoral Sentiment</h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {sectors.map((sector, i) => (
                                <div 
                                    key={i}
                                    style={{ 
                                        padding: '1rem', 
                                        borderRadius: '16px', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ color: sector.isPositive ? '#10b981' : '#ef4444' }}>
                                        {sectorIcons[sector.name] || <PieChart size={18} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nifty {sector.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Real-time Index Performance</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: sector.isPositive ? '#10b981' : '#ef4444' }}>
                                            {sector.isPositive ? '+' : ''}{sector.changePercent}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                                            {sector.isPositive ? 'Bullish' : 'Bearish'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Institutional Perspective (Dynamic) */}
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <ShieldCheck size={18} className="text-purple-400" />
                            <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>INSTITUTIONAL DESK</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                            "{data.desk?.quote || "Evaluating structural market trends for institutional alpha."}"
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>
                                {data.desk?.name?.[0] || 'A'}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{data.desk?.name || "Arjun Mehta"}, {data.desk?.role || "Head of Strategy"}</span>
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    );
};

export default IntelligenceInsightsReport;
