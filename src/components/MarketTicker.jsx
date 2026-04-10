import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import { fetchHistory, fetchCryptoData } from '../lib/DashboardData';
import { fetchInstitutionalPulse } from '../lib/MarketData';

const MarketTicker = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [indices, crypto, pulse] = await Promise.all([
                Promise.all([
                    fetchHistory('^NSEI'), // Nifty 50
                    fetchHistory('^BSESN') // Sensex
                ]),
                fetchCryptoData(),
                fetchInstitutionalPulse()
            ]);

            const allStats = [
                {
                    name: "INSTITUTIONAL PULSE",
                    price: `${pulse}/100`,
                    change: pulse > 70 ? 'Extreme Bulish' : (pulse < 30 ? 'High Risk' : 'Neutral'),
                    isPositive: pulse >= 50,
                    isPulse: true
                },
                ...(indices.filter(i => i !== null).map(i => ({
                    name: i.name || 'Nifty 50',
                    price: i.price,
                    change: i.changePercent,
                    isPositive: i.isPositive
                }))),
                ...(crypto ? crypto.map(c => ({
                    name: c.name,
                    price: `${c.price}`,
                    change: c.changePercent,
                    isPositive: c.isPositive
                })) : [])
            ];

            setStats(allStats);
            setLoading(false);
        } catch (e) {
            console.error("Ticker data load failed:", e);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, []);

    if (loading && stats.length === 0) {
        return (
            <div className="market-ticker-loader">
                <RefreshCw size={14} className="animate-spin" /> <span>Syncing Market Pulse...</span>
            </div>
        );
    }

    // Double the stats for seamless loop
    const displayStats = [...stats, ...stats, ...stats];

    return (
        <div className="market-ticker-container">
            <div className="ticker-label">LIVE DATA</div>
            <div className="ticker-viewport">
                <motion.div 
                    className="ticker-track"
                    animate={{ x: [0, -1000] }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                >
                    {displayStats.map((stat, i) => (
                        <div key={i} className={`ticker-item ${stat.isPulse ? 'pulse-item' : ''}`}>
                            <span className="ticker-name">
                                {stat.isPulse && <Zap size={10} style={{ marginRight: '4px', color: '#c084fc' }} />}
                                {stat.name}
                            </span>
                            <span className="ticker-price">{stat.price}</span>
                            <span className={`ticker-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                                {!stat.isPulse && (stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                                {stat.change}{!stat.isPulse ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default MarketTicker;
