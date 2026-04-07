import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const EarningsWatch = ({ companies }) => {
    return (
        <section className="panel-card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                    <BarChart3 size={16} /> EARNINGS MONITOR
                </h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', opacity: 0.8 }}>Q4 FY25</span>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Clock size={12} color="rgba(255,255,255,0.4)" />
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{company.date} | {company.time}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Target Estimate</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{company.target}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Consensus</span>
                                <div style={{ 
                                    fontSize: '0.65rem', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px',
                                    background: company.consensus === 'Positive' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                    color: company.consensus === 'Positive' ? '#22c55e' : '#fff',
                                    fontWeight: 700
                                }}>
                                    {company.consensus.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EarningsWatch;
