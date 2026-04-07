import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

const FiiDiiAnalyzer = ({ flows }) => {
    return (
        <section className="panel-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                    <Users size={16} /> INSTITUTIONAL FLOWS
                </h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', opacity: 0.8 }}>DAILY SETTLEMENT</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {flows.map((flow, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}
                    >
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{flow.name.toUpperCase()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="terminal-num" style={{ fontSize: '1.1rem', fontWeight: 800, color: flow.isPositive ? '#22c55e' : '#ef4444' }}>
                                {flow.value}
                            </span>
                            {flow.isPositive ? <TrendingUp size={14} color="#22c55e" /> : <TrendingDown size={14} color="#ef4444" />}
                        </div>
                        <div style={{ 
                            fontSize: '0.6rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: flow.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: flow.isPositive ? '#22c55e' : '#ef4444',
                            width: 'fit-content',
                            fontWeight: 700
                        }}>
                            {flow.sentiment}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default FiiDiiAnalyzer;
