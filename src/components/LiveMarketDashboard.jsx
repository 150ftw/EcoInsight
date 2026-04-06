import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LineChart, Line, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Activity, TrendingUp, TrendingDown, 
    Zap, BarChart3, Globe, ShieldCheck, 
    RefreshCw, ArrowUpRight, ArrowDownRight,
    Search, LayoutGrid, Info, Calendar,
    PieChart, Newspaper, Layers, Briefcase
} from 'lucide-react';
import { 
    fetchDashboardIndices, 
    fetchGlobalMacro,
    fetchCryptoData, 
    fetchMarketMovers, 
    fetchSectorPerformance,
    fetchMarketNews,
    fetchEconomicCalendar,
    fetchHistory
} from '../lib/DashboardData';
import './Dashboard.css';

const MacroRibbon = ({ data }) => (
    <div className="macro-ribbon">
        {data.map((item, i) => (
            <div key={i} className="macro-item">
                <span className="macro-label">{item.name}</span>
                <span className={`macro-val terminal-num ${item.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {item.price}
                </span>
                <span className={`macro-change terminal-num ${item.isPositive ? 'text-green-400' : 'text-red-400'}`} style={{ fontSize: '0.7rem' }}>
                    {item.isPositive ? '▲' : '▼'} {item.changePercent}%
                </span>
            </div>
        ))}
    </div>
);

const WatchlistCard = ({ data, onClick, active }) => (
    <motion.div 
        className={`market-stat-card ${active ? 'active' : ''}`}
        onClick={() => onClick(data)}
        whileHover={{ x: 4 }}
    >
        <div className="card-header">
            <div className="card-meta">
                <h4>{data.name}</h4>
                <p className="price terminal-num">
                    {data.fullSymbol?.includes('BTC') || data.fullSymbol?.includes('USD') ? '$' : '₹'}{data.price}
                </p>
            </div>
            <div className={`change-mini terminal-num ${data.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {data.changePercent}%
            </div>
        </div>
        <div className="sparkline-mini" style={{ height: 30 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sparkline}>
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={data.isPositive ? '#22c55e' : '#ef4444'} 
                        fill={data.isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </motion.div>
);

const LiveMarketDashboard = () => {
    const [indices, setIndices] = useState([]);
    const [macro, setMacro] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [movers, setMovers] = useState({ gainers: [], losers: [] });
    const [sectors, setSectors] = useState([]);
    const [news, setNews] = useState([]);
    const [calendar, setCalendar] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [chartTimeframe, setChartTimeframe] = useState('1D');

    const refreshData = async () => {
        try {
            const [idxData, macroData, crypData, movData, sectData, calData] = await Promise.all([
                fetchDashboardIndices(),
                fetchGlobalMacro(),
                fetchCryptoData(),
                fetchMarketMovers(),
                fetchSectorPerformance(),
                fetchEconomicCalendar()
            ]);
            
            setIndices(idxData);
            setMacro(macroData);
            setCrypto(crypData);
            setMovers(movData);
            setSectors(sectData);
            setCalendar(calData);
            
            if (!selectedAsset && idxData.length > 0) {
                const initial = idxData[0];
                setSelectedAsset(initial);
                // Fetch news for initial asset
                const newsData = await fetchMarketNews(initial.name);
                setNews(newsData);
            }
            
            setLastUpdated(new Date());
            setIsLoading(false);
        } catch (e) {
            console.error('Terminal refresh failed:', e);
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAssetChange = async (asset) => {
        setSelectedAsset(asset);
        // Instant placeholder news or keep old until new ones load
        const newsData = await fetchMarketNews(asset.name);
        setNews(newsData);
    };

    if (isLoading) {
        return (
            <div className="dashboard-container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <motion.div 
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <MacroRibbon data={macro} />

            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>
                        Investor <span className="text-gradient">Terminal</span>
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', opacity: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>
                        SECURE DATA FEED // SYNC: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="terminal-status" style={{ fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                        LIVE CONNECTION ACTIVE
                    </div>
                </div>
            </header>

            <div className="terminal-grid">
                {/* COLUMN 1: TRACKER */}
                <aside className="ticker-column">
                    <div className="ticker-group">
                        <span className="ticker-group-label">Core Indices</span>
                        {indices.map(idx => (
                            <WatchlistCard 
                                key={idx.symbol} 
                                data={idx} 
                                active={selectedAsset?.symbol === idx.symbol} 
                                onClick={handleAssetChange} 
                            />
                        ))}
                    </div>
                    <div className="ticker-group">
                        <span className="ticker-group-label">Digital Assets</span>
                        {crypto.map(cryp => (
                            <WatchlistCard 
                                key={cryp.symbol} 
                                data={cryp} 
                                active={selectedAsset?.symbol === cryp.symbol} 
                                onClick={handleAssetChange} 
                            />
                        ))}
                    </div>
                </aside>

                {/* COLUMN 2: ANALYSIS */}
                <main className="analysis-column">
                    <section className="main-chart-section">
                        <header className="chart-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedAsset?.name}</h2>
                                <span className="terminal-num" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                                    {selectedAsset?.fullSymbol?.includes('USD') || selectedAsset?.fullSymbol?.includes('BTC') ? '$' : '₹'}
                                    {selectedAsset?.price}
                                </span>
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
                        
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedAsset?.sparkline || []}>
                                    <defs>
                                        <linearGradient id="chartG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis 
                                        hide 
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip 
                                        contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="var(--accent-primary)" 
                                        fill="url(#chartG)" 
                                        strokeWidth={3}
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><ShieldCheck size={16} /> Asset Intelligence</h3>
                        <div className="fundamentals-grid">
                            <div className="fundamental-item">
                                <span className="label">Volume (24H)</span>
                                <span className="value terminal-num">{selectedAsset?.volume || '2.4M'}</span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Day High</span>
                                <span className="value terminal-num">{selectedAsset?.dayHigh || 'N/A'}</span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Day Low</span>
                                <span className="value terminal-num">{selectedAsset?.dayLow || 'N/A'}</span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Volatility (VIX)</span>
                                <span className="value terminal-num">14.2%</span>
                            </div>
                        </div>
                    </section>
                </main>

                {/* COLUMN 3: INTELLIGENCE */}
                <aside className="intelligence-column">
                    <section className="panel-card">
                        <h3><Activity size={16} /> Technical Sentiment</h3>
                        <div className="sentiment-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                                <span>BEARISH</span>
                                <span>BULLISH</span>
                            </div>
                            <div className="gauge-track">
                                <div className="gauge-pointer" style={{ left: `${selectedAsset?.isPositive ? 75 : 35}%` }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: 0 }}>
                                {selectedAsset?.isPositive ? 'Strong Technical Uptrend Detected' : 'Support Levels under Pressure'}
                            </p>
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><Newspaper size={16} /> Pulse News</h3>
                        <div className="news-list">
                            {news.length > 0 ? news.slice(0, 3).map((item, i) => (
                                <div key={i} className="news-item">
                                    <span className="source">{item.source || 'ECONOMY'}</span>
                                    <p style={{ margin: '0.2rem 0' }}>{item.title}</p>
                                    <span className="time">REF: {item.url?.slice(0, 30)}...</span>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>Scanning global feeds...</p>
                            )}
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><Calendar size={16} /> Economic Calendar</h3>
                        <div className="calendar-list">
                            {calendar.slice(0, 4).map((cal, i) => (
                                <div key={i} className="calendar-item">
                                    <div className="cal-date">
                                        <span>{cal.date.split(' ')[0]}</span>
                                        <span>{cal.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="cal-info">
                                        <div className="event">{cal.event}</div>
                                        <span className={`impact-badge impact-${cal.impact}`}>{cal.impact} Impact</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </motion.div>
    );
};

export default LiveMarketDashboard;
