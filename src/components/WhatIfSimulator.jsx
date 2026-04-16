import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, RefreshCw, Loader2, Settings, TrendingUp, Activity, Globe, Sparkles, Zap } from 'lucide-react';

const WhatIfSimulator = () => {
    const [sliders, setSliders] = useState({
        interestRate: 5.0,
        govSpending: 2.0,
        inflation: 3.0,
        taxes: 21.0
    });

    const [effects, setEffects] = useState({
        housing: { trend: 'up', label: 'Stable', details: 'Demand matches supply; mortgage originations hold steady.' },
        stock: { trend: 'up', label: 'Bullish', details: 'Earnings multiples expanding on favorable liquidity.' },
        consumer: { trend: 'up', label: 'Strong', details: 'Retail sales buoyant; wage growth outpaces core PCE.' },
        savings: { trend: 'up', label: 'Growing', details: 'Attractive yields on cash equivalents encourage capital preservation.' }
    });

    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const { interestRate, govSpending, inflation, taxes } = sliders;

            let housing = { trend: 'up', label: 'Stable 📈', details: 'Market is balanced with standard transaction volumes.' };
            if (interestRate > 6.0) housing = { trend: 'down', label: 'Cooling 📉', details: 'High mortgage rates pricing out first-time buyers, leading to inventory build-up.' };
            else if (interestRate < 4.0) housing = { trend: 'up', label: 'Booming 📈', details: 'Cheap borrowing costs triggering bidding wars and rapid price appreciation.' };

            let stock = { trend: 'up', label: 'Neutral 📈', details: 'Range-bound market awaiting fresh catalysts.' };
            if (interestRate > 6.0 || taxes > 25) stock = { trend: 'down', label: 'Bearish 📉', details: 'Higher discount rates and tax drag compressing equity valuations.' };
            else if (govSpending > 3.0 && taxes < 25) stock = { trend: 'up', label: 'Bullish 📈', details: 'Fiscal stimulus acting as a powerful tailwind for corporate earnings.' };

            let consumer = { trend: 'up', label: 'Moderate 📈', details: 'Steady discretionary spending patterns.' };
            if (inflation > 5.0 || taxes > 25) consumer = { trend: 'down', label: 'Declining 📉', details: 'Real wages negative. Consumers shifting to staples and trading down.' };
            else if (inflation < 3.0 && taxes < 20) consumer = { trend: 'up', label: 'Surging 📈', details: 'High real disposable income leading to robust services and goods spending.' };

            let savings = { trend: 'up', label: 'Stable 📈', details: 'Normal household aggregate savings rates.' };
            if (interestRate > 5.5) savings = { trend: 'up', label: 'Growing 📈', details: 'High risk-free rates incentivizing capital parking in money market funds.' };
            else if (inflation > 4.0) savings = { trend: 'down', label: 'Depleting 📉', details: 'Cost of living increases forcing households to draw down excess savings.' };

            setEffects({ housing, stock, consumer, savings });
            setIsSimulating(false);
        }, 1200);
    };

    const handleSliderChange = (e, key) => {
        setSliders(prev => ({ ...prev, [key]: parseFloat(e.target.value) }));
    };

    return (
        <motion.div
            className="pulse-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>
                        <Layers className="text-accent" size={24} /> What-If Economic Simulator
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                        Adjust macro levers to generate real-time predictive scenarios for key market sectors.
                    </p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="btn-shine-primary"
                    style={{
                        borderRadius: '8px',
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: isSimulating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Run Simulation
                </button>
            </div>

            <div className="simulator-main-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '2rem' 
            }}>
                {/* Sliders Area */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2rem', 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.03)' 
                }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={16} /> Institutional Levers
                    </h4>
                    {[
                        { key: 'interestRate', label: 'RBI Repo Rate (%)', min: 0, max: 10, step: 0.25 },
                        { key: 'govSpending', label: 'Fiscal Expenditure (Cr)', min: 0, max: 10, step: 0.1 },
                        { key: 'inflation', label: 'Core CPI Inflation (%)', min: -2, max: 15, step: 0.1 },
                        { key: 'taxes', label: 'Corporate Surcharge (%)', min: 0, max: 40, step: 1 }
                    ].map(slider => (
                        <div key={slider.key} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                <span style={{ fontWeight: 600 }}>{slider.label}</span>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1.1rem' }}>{sliders[slider.key].toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                className="interactive-slider institutional-touch-slider"
                                min={slider.min}
                                max={slider.max}
                                step={slider.step}
                                value={sliders[slider.key]}
                                onChange={(e) => handleSliderChange(e, slider.key)}
                                style={{ 
                                    width: '100%', 
                                    accentColor: 'var(--accent-primary)',
                                    height: '44px', /* Larger touch target */
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Effects Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> Ripple Effects</h4>

                    <div className="effects-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1rem',
                        position: 'relative'
                    }}>
                        {isSimulating && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.8)', zIndex: 10, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <Loader2 size={32} className="animate-spin text-accent" />
                                <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Calculating Multipliers...</span>
                            </div>
                        )}

                        {[
                            { key: 'housing', label: 'Housing Market', icon: <Globe size={16} /> },
                            { key: 'stock', label: 'Equities Market', icon: <TrendingUp size={16} /> },
                            { key: 'consumer', label: 'Consumer Discretionary', icon: <Sparkles size={16} /> },
                            { key: 'savings', label: 'Household Savings', icon: <Zap size={16} /> }
                        ].map(effect => (
                            <div key={effect.key} style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                padding: '1.2rem',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        {effect.icon} {effect.label}
                                    </span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: effects[effect.key].trend === 'up' ? '#10b981' : (effects[effect.key].label.includes('Stable') ? '#f59e0b' : '#ef4444')
                                    }}>
                                        {effects[effect.key].label}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#71717a', lineHeight: '1.5' }}>
                                    {effects[effect.key].details}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WhatIfSimulator;
