import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Briefcase, Cpu, Pill, Zap } from 'lucide-react';

const SectorHeatmap = () => {
    // Sector Data (Mocked for demonstration, real sectoral indices can be added later)
    const SECTORS = [
        { name: 'Banking', change: '1.24', isPositive: true, icon: <Briefcase size={20} /> },
        { name: 'IT', change: '0.85', isPositive: true, icon: <Cpu size={20} /> },
        { name: 'Pharma', change: '-0.32', isPositive: false, icon: <Pill size={20} /> },
        { name: 'Energy', change: '2.10', isPositive: true, icon: <Zap size={20} /> }
    ];

    return (
        <div className="sector-heatmap-container">
            <div className="section-header">
                <h3>Sector Heatmap</h3>
                <div className="live-status-dot pulse" />
            </div>
            
            <div className="sector-grid">
                {SECTORS.map((sector, i) => (
                    <motion.div 
                        key={sector.name}
                        className={`sector-card ${sector.isPositive ? 'bullish' : 'bearish'}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                        <div className="sector-icon">{sector.icon}</div>
                        <div className="sector-info">
                            <span className="name">{sector.name}</span>
                            <span className={`change ${sector.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {sector.isPositive ? '+' : ''}{sector.change}%
                                {sector.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            </span>
                        </div>
                        <div className="sector-glow" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SectorHeatmap;
