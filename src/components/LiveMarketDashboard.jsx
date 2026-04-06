import React, { useState, useEffect, useCallback } from 'react';
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
    PieChart, Newspaper, Layers, Briefcase,
    Plus, Trash2, X, Star, AlertTriangle
} from 'lucide-react';
import { 
    fetchDashboardIndices, 
    fetchGlobalMacro,
    fetchCryptoData, 
    fetchSectorPerformance,
    fetchMarketNews,
    fetchEconomicCalendar,
    fetchHistory,
    searchTickers,
    fetchCommodities,
    fetchGlobalEquities
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

const WatchlistCard = ({ data, onClick, onRemove, active, isUserAdded }) => (
    <motion.div 
        className={`market-stat-card ${active ? 'active' : ''}`}
        onClick={() => onClick(data)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="card-header">
            <div className="card-meta">
                <h4>{data.name}</h4>
                <p className="price terminal-num">
                    {data.fullSymbol?.includes('USD') || data.fullSymbol?.includes('=F') || data.fullSymbol?.includes('BTC') ? '$' : '₹'}{data.price}
                </p>
            </div>
            <div className={`change-mini terminal-num ${data.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {data.changePercent}%
            </div>
        </div>
        {isUserAdded && (
            <button 
                className="remove-btn" 
                onClick={(e) => { e.stopPropagation(); onRemove(data.fullSymbol); }}
            >
                <Trash2 size={12} />
            </button>
        )}
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
    // State for Data
    const [indices, setIndices] = useState([]);
    const [macro, setMacro] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [globalGiants, setGlobalGiants] = useState([]);
    const [userWatchlist, setUserWatchlist] = useState([]);
    const [news, setNews] = useState([]);
    const [calendar, setCalendar] = useState([]);
    
    // State for UI
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [chartTimeframe, setChartTimeframe] = useState('1D');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Initial Load & Persistent Watchlist
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('eco_watchlist') || '[]');
        loadInitialData(saved);
        
        const interval = setInterval(() => {
            const currentSaved = JSON.parse(localStorage.getItem('eco_watchlist') || '[]');
            loadInitialData(currentSaved, false);
        }, 60000);
        
        return () => clearInterval(interval);
    }, []);

    const loadInitialData = async (watchlistSymbols, showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const [idx, mac, cry, com, glo, cal] = await Promise.all([
                fetchDashboardIndices(),
                fetchGlobalMacro(),
                fetchCryptoData(),
                fetchCommodities(),
                fetchGlobalEquities(),
                fetchEconomicCalendar()
            ]);

            setIndices(idx || []);
            setMacro(mac || []);
            setCrypto(cry || []);
            setCommodities(com || []);
            setGlobalGiants(glo || []);
            setCalendar(cal || []);

            // Handle potential rate-limits
            if (!idx && !mac) setHasError(true);
            else setHasError(false);

            // Fetch high-fidelity data for user watchlist
            if (watchlistSymbols.length > 0) {
                const watchData = await Promise.all(watchlistSymbols.map(s => fetchHistory(s)));
                setUserWatchlist(watchData.filter(d => d !== null));
            }

            if (!selectedAsset && idx && idx.length > 0) {
                handleAssetChange(idx[0]);
            }

            setLastUpdated(new Date());
            setIsLoading(false);
        } catch (e) {
            console.error('Terminal load failed:', e);
            setHasError(true);
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length >= 2) {
            setIsSearching(true);
            const results = await searchTickers(val);
            setSearchResults(results || []);
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const addToWatchlist = async (symbol) => {
        const saved = JSON.parse(localStorage.getItem('eco_watchlist') || '[]');
        if (!saved.includes(symbol)) {
            const newSaved = [...saved, symbol];
            localStorage.setItem('eco_watchlist', JSON.stringify(newSaved));
            // Fetch data for the new item immediately
            const newItem = await fetchHistory(symbol);
            if (newItem) {
                setUserWatchlist(prev => [...prev, newItem]);
                handleAssetChange(newItem);
            }
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeFromWatchlist = (symbol) => {
        const saved = JSON.parse(localStorage.getItem('eco_watchlist') || '[]');
        const newSaved = saved.filter(s => s !== symbol);
        localStorage.setItem('eco_watchlist', JSON.stringify(newSaved));
        setUserWatchlist(prev => prev.filter(item => item.fullSymbol !== symbol));
    };

    const handleAssetChange = async (asset) => {
        setSelectedAsset(asset);
        if (asset.name) {
            const newsData = await fetchMarketNews(asset.name);
            setNews(newsData);
        }
    };

    if (isLoading) {
        return (
            <div className="dashboard-container" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <motion.div className="dashboard-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MacroRibbon data={macro} />

            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>
                        Terminal <span className="text-gradient">Engine</span>
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', opacity: 0.5, fontSize: '0.8rem', fontWeight: 600 }}>
                        LATENCY: 42MS // SYNC: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {hasError && (
                        <div className="terminal-status error" style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={12} /> API RATE-LIMIT RECOVERY ACTIVE
                        </div>
                    )}
                    <div className="terminal-status" style={{ fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                        STABLE CONNECTION
                    </div>
                </div>
            </header>

            <div className="terminal-grid">
                {/* COLUMN 1: DISCOVERY & WATCHLIST */}
                <aside className="ticker-column">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search Global Tickers..." 
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div 
                                    className="search-results-dropdown"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {searchResults.map(res => (
                                        <div key={res.symbol} className="search-result-item" onClick={() => addToWatchlist(res.symbol)}>
                                            <div className="result-info">
                                                <span className="symbol">{res.symbol}</span>
                                                <span className="name">{res.name}</span>
                                            </div>
                                            <div className="add-btn">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="ticker-group">
                        <span className="ticker-group-label"><Star size={12} style={{ marginRight: 4 }} /> My Watchlist</span>
                        {userWatchlist.length > 0 ? userWatchlist.map(asset => (
                            <WatchlistCard 
                                key={asset.fullSymbol} 
                                data={asset} 
                                active={selectedAsset?.fullSymbol === asset.fullSymbol} 
                                onClick={handleAssetChange}
                                onRemove={removeFromWatchlist}
                                isUserAdded={true}
                            />
                        )) : (
                            <p style={{ fontSize: '0.7rem', opacity: 0.3, textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', margin: '0.5rem' }}>
                                Search assets to build your terminal
                            </p>
                        )}
                    </div>

                    <div className="ticker-group">
                        <span className="ticker-group-label"><Globe size={12} style={{ marginRight: 4 }} /> Global Equities</span>
                        {globalGiants.map(asset => (
                            <WatchlistCard 
                                key={asset.fullSymbol} 
                                data={asset} 
                                active={selectedAsset?.fullSymbol === asset.fullSymbol} 
                                onClick={handleAssetChange} 
                            />
                        ))}
                    </div>

                    <div className="ticker-group">
                        <span className="ticker-group-label"><BarChart3 size={12} style={{ marginRight: 4 }} /> Major Indices</span>
                        {indices.map(asset => (
                            <WatchlistCard 
                                key={asset.fullSymbol} 
                                data={asset} 
                                active={selectedAsset?.fullSymbol === asset.fullSymbol} 
                                onClick={handleAssetChange} 
                            />
                        ))}
                    </div>

                    <div className="ticker-group">
                        <span className="ticker-group-label"><Layers size={12} style={{ marginRight: 4 }} /> Commodities</span>
                        {commodities.map(asset => (
                            <WatchlistCard 
                                key={asset.fullSymbol} 
                                data={asset} 
                                active={selectedAsset?.fullSymbol === asset.fullSymbol} 
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
                                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>{selectedAsset?.name || 'Loading Asset...'}</h2>
                                <span className="terminal-num" style={{ fontSize: '2rem', fontWeight: 800, color: selectedAsset?.isPositive ? '#22c55e' : '#ef4444' }}>
                                    {selectedAsset?.fullSymbol?.includes('USD') || selectedAsset?.fullSymbol?.includes('=F') || selectedAsset?.fullSymbol?.includes('BTC') ? '$' : '₹'}
                                    {selectedAsset?.price || '0.00'}
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
                        
                        <div style={{ height: 400 }}>
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
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="var(--accent-primary)" 
                                        fill="url(#chartG)" 
                                        strokeWidth={3}
                                        animationDuration={1000}
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><ShieldCheck size={16} /> Asset Fundamentals</h3>
                        <div className="fundamentals-grid">
                            <div className="fundamental-item">
                                <span className="label">Volume (24H)</span>
                                <span className="value terminal-num">{selectedAsset?.volume || 'N/A'}</span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Day High / Low</span>
                                <span className="value terminal-num" style={{ fontSize: '0.8rem' }}>
                                    {selectedAsset?.dayHigh} / {selectedAsset?.dayLow}
                                </span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Asset Class</span>
                                <span className="value" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                                    {selectedAsset?.fullSymbol?.includes('=F') ? 'COMMODITY' : selectedAsset?.fullSymbol?.includes('USD') ? 'FOREX' : 'EQUITY'}
                                </span>
                            </div>
                            <div className="fundamental-item">
                                <span className="label">Exchange SOURCE</span>
                                <span className="value" style={{ fontSize: '0.75rem' }}>{selectedAsset?.fullSymbol?.split('.').pop() || 'GLOBAL'}</span>
                            </div>
                        </div>
                    </section>
                </main>

                {/* COLUMN 3: INTELLIGENCE */}
                <aside className="intelligence-column">
                    <section className="panel-card">
                        <h3><Activity size={16} /> Market Sentiment</h3>
                        <div className="sentiment-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                                <span style={{ color: '#ef4444' }}>BEARISH</span>
                                <span style={{ color: '#22c55e' }}>BULLISH</span>
                            </div>
                            <div className="gauge-track">
                                <div className="gauge-pointer" style={{ left: `${selectedAsset?.isPositive ? 75 : 25}%` }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: '0.5rem 0 0' }}>
                                {selectedAsset?.isPositive ? 'Technical setup indicates Bullish momentum' : 'Asset is currently retesting major support'}
                            </p>
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><Newspaper size={16} /> Global Intelligence</h3>
                        <div className="news-list">
                            {news.length > 0 ? news.slice(0, 5).map((item, i) => (
                                <div key={i} className="news-item">
                                    <span className="source">{item.source || 'ECONOMY'}</span>
                                    <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <p style={{ margin: '0.2rem 0', cursor: 'pointer', fontWeight: 600 }}>{item.title}</p>
                                    </a>
                                </div>
                            )) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4, padding: '1rem' }}>
                                    <RefreshCw className="animate-spin" size={14} />
                                    <span style={{ fontSize: '0.8rem' }}>Tracking feeds for {selectedAsset?.name}...</span>
                                </div>
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </motion.div>
    );
};

export default LiveMarketDashboard;
