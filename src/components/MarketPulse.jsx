import React from 'react';
import { Zap, TrendingUp, TrendingDown, Target } from 'lucide-react';

const MarketPulse = ({ topMovers }) => {
    if (!topMovers || topMovers.length === 0) return null;

    return (
        <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} className="text-orange-400" />
                    Market Pulse
                </h3>
                <span style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Institutional View
                </span>
            </div>

            <div style={{ marginBottom: '1.2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span>Sentiment Index</span>
                    <span style={{ color: '#4ade80' }}>Bullish</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #4ade80)', borderRadius: '2px' }}></div>
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.65rem', opacity: 0.5 }}>
                    Advancing volume currently outpaces declining volume by 2.4x.
                </p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.4, marginBottom: '8px', textTransform: 'uppercase' }}>Volume Leaders</span>
                {topMovers.slice(0, 5).map((stock, i) => (
                    <div 
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            transition: 'background 0.2s ease',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                                width: '28px', 
                                height: '28px', 
                                background: stock.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {stock.isPositive ? <TrendingUp size={14} color="#4ade80" /> : <TrendingDown size={14} color="#f87171" />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{stock.symbol.split(':')[0]}</span>
                                <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{stock.name}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stock.isPositive ? '#4ade80' : '#f87171', display: 'block' }}>
                                {stock.isPositive ? '+' : ''}{stock.changePercent}%
                            </span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>₹{stock.price}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                marginTop: '1.2rem',
                padding: '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <Target size={14} />
                Full Flow Discovery
            </button>
        </div>
    );
};

export default MarketPulse;
