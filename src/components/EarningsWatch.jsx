import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { getResultsSeason } from '../lib/DashboardData';

const EarningsWatch = ({ companies }) => {
    return (
        <section className="panel-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                    <BarChart3 size={16} /> EARNINGS MONITOR
                </h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', opacity: 0.8 }}>{getResultsSeason()} SEASON</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {companies.map((company, idx) => (
                    <div 
                        key={idx}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{company.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: company.isPositive ? '#22c55e' : '#ef4444' }}>
                                {company.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{company.isPositive ? '+' : ''}{company.changePercent}%</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Live Price</span>
                                <span className="terminal-num" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>₹{company.price}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>P/E (TTM)</span>
                                <span className="terminal-num" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{company.peRatio || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EarningsWatch;
