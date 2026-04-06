import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LineChart, Line, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Sparkline 
} from 'recharts';
import { 
    Activity, TrendingUp, TrendingDown, 
    Zap, BarChart3, Globe, ShieldCheck, 
    RefreshCw, ArrowUpRight, ArrowDownRight,
    Search, LayoutGrid, Info
} from 'lucide-react';
import { 
    fetchDashboardIndices, 
    fetchCryptoData, 
    fetchMarketMovers, 
    fetchSectorPerformance,
    fetchHistory
} from '../lib/DashboardData';
import './Dashboard.css';

const MarketStatCard = ({ data, onClick, active }) => {
    if (!data) return <div className="market-stat-card loading" />;

    return (
        <motion.div 
            className={`market-stat-card ${active ? 'active' : ''}`}
            whileHover={{ y: -5 }}
            onClick={() => onClick(data)}
        >
            <div className="card-header">
                <div className="card-meta">
                    <h4>{data.name}</h4>
                    <p className="price">
                        {data.symbol.includes('BTC') || data.symbol.includes('ETH') ? '$' : '₹'}
                        {data.price}
                    </p>
                </div>
                <div className={`change-badge ${data.isPositive ? 'positive' : 'negative'}`}>
                    {data.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {data.changePercent}%
                </div>
            </div>

            <div className="sparkline-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.sparkline}>
                        <defs>
                            <linearGradient id={`gradient-${data.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={data.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={data.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={data.isPositive ? '#22c55e' : '#ef4444'} 
                            fillOpacity={1} 
                            fill={`url(#gradient-${data.symbol})`} 
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

const LiveMarketDashboard = () => {
    const [indices, setIndices] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [movers, setMovers] = useState({ gainers: [], losers: [] });
    const [sectors, setSectors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [chartTimeframe, setChartTimeframe] = useState('1D');

    const refreshData = async () => {
        try {
            const [idxData, crypData, movData, sectData] = await Promise.all([
                fetchDashboardIndices(),
                fetchCryptoData(),
                fetchMarketMovers(),
                fetchSectorPerformance()
            ]);
            
            setIndices(idxData);
            setCrypto(crypData);
            setMovers(movData);
            setSectors(sectData);
            
            if (!selectedAsset && idxData.length > 0) {
                setSelectedAsset(idxData[0]);
            }
            
            setLastUpdated(new Date());
            setIsLoading(false);
        } catch (e) {
            console.error('Dashboard refresh failed:', e);
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 60000); // 60s refresh
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="loader-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <RefreshCw className="animate-spin text-purple-500" size={32} />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Upper Header */}
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div className="header-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span className="live-badge" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.7rem', 
                            color: '#22c55e', 
                            background: 'rgba(34,197,94,0.1)', 
                            padding: '4px 10px', 
                            borderRadius: '100px', 
                            fontWeight: 'bold',
                            letterSpacing: '0.1em'
                        }}>
                           <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></span>
                           RECON LIVE
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                        Market <span className="text-gradient">Intelligence</span>
                    </h1>
                </div>
                
                <div className="header-right" style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>LAST SYNC</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>{lastUpdated.toLocaleTimeString()}</p>
                </div>
            </header>

            {/* Indices Ticker */}
            <div className="market-ticker-stats">
                {indices.map(idx => (
                    <MarketStatCard 
                        key={idx.symbol} 
                        data={idx} 
                        onClick={setSelectedAsset} 
                        active={selectedAsset?.symbol === idx.symbol}
                    />
                ))}
                {crypto.map(cryp => (
                    <MarketStatCard 
                        key={cryp.symbol} 
                        data={cryp} 
                        onClick={setSelectedAsset}
                        active={selectedAsset?.symbol === cryp.symbol}
                    />
                ))}
            </div>

            {/* AI Insight Highlight */}
            <section className="ai-insight-box">
                <div className="ai-icon-pulse">
                    <Zap size={24} color="#fff" />
                </div>
                <div className="ai-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3>EcoInsight AI – Market Pulse</h3>
                        <div style={{ height: 1, flex: 1, background: 'rgba(139, 92, 246, 0.2)', marginLeft: '1rem' }}></div>
                    </div>
                    <p>
                        Current volatility in {indices[2]?.name || 'Global Indices'} suggests a defensive rotation toward 
                        blue-chip Indian equities. Technical breakout patterns spotted on {indices[0]?.name || 'Nifty 50'} 
                        indicated bullish continuation above critical resistance zones. Monitoring {crypto[0]?.name || 'Bitcoin'} 
                        for liquidity shifts into emerging market assets.
                    </p>
                    <div className="ai-footer" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={14} /> Confidence: 94%
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Zap size={14} /> Latency: 42ms
                        </span>
                    </div>
                </div>
            </section>

            {/* Main Interactive Chart & Sector Map */}
            <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <article className="main-chart-section">
                    <header className="chart-header">
                        <div className="chart-info">
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedAsset?.name || 'Market Trend'}</h2>
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', margin: '0.25rem 0 0' }}>Performance Analytics</p>
                        </div>
                        <div className="chart-tabs">
                            {['1D', '1W', '1M', '1Y'].map(tf => (
                                <button 
                                    key={tf}
                                    className={`chart-tab ${chartTimeframe === tf ? 'active' : ''}`}
                                    onClick={() => setChartTimeframe(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </header>
                    
                    <div className="main-chart-container" style={{ height: '350px' }}>
                        {selectedAsset?.sparkline ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedAsset.sparkline}>
                                    <defs>
                                        <linearGradient id="mainChartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis 
                                        dataKey="time" 
                                        stroke="rgba(255,255,255,0.2)" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="rgba(255,255,255,0.2)" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        domain={['auto', 'auto']}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            background: 'rgba(10, 10, 12, 0.9)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="var(--accent-primary)" 
                                        fillOpacity={1} 
                                        fill="url(#mainChartGradient)" 
                                        strokeWidth={3}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)' }}>
                                Selecting Asset Data...
                            </div>
                        )}
                    </div>
                </article>

                <aside className="sector-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="mover-column" style={{ flex: 1 }}>
                        <h3><Activity size={18} className="text-purple-400" /> Top Movers</h3>
                        <div className="mover-list">
                            {[...movers.gainers, ...movers.losers].map((mover, i) => (
                                <div key={i} className="mover-item">
                                    <div className="mover-info">
                                        <div style={{ fontWeight: '600' }}>{mover.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{mover.symbol}</div>
                                    </div>
                                    <div className={`mover-val ${mover.isPositive ? 'text-green-400' : 'text-red-400'}`} style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '700' }}>₹{mover.price}</div>
                                        <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                                            {mover.isPositive ? '+' : ''}{mover.changePercent}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mover-column" style={{ flex: 1 }}>
                        <h3><LayoutGrid size={18} className="text-purple-400" /> Sector Heatmap</h3>
                        <div className="heatmap-container">
                            {sectors.map((sector, i) => (
                                <div key={i} className={`sector-tile ${sector.isPositive ? 'bullish' : 'bearish'}`}>
                                    <span style={{ fontSize: '0.75rem', color: sector.isPositive ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                        {sector.isPositive ? '+' : ''}{sector.changePercent}%
                                    </span>
                                    <span className="sector-name">{sector.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};

export default LiveMarketDashboard;
