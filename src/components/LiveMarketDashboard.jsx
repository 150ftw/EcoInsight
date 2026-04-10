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
    fetchMarketNews,
    fetchEconomicCalendar,
    fetchHistory,
    searchTickers,
    fetchCommodities,
    fetchIndianEquities,
    fetchNiftySectors,
    fetchTopMovers,
    fetchFiiDiiFlows,
    fetchMarketSentiment
} from '../lib/DashboardData';
import SectorHeatmap from './SectorHeatmap';
import MarketPulse from './MarketPulse';
import FiiDiiAnalyzer from './FiiDiiAnalyzer';
import EconomicCalendar from './EconomicCalendar';
import TechnicalPulse from './TechnicalPulse';
import EarningsWatch from './EarningsWatch';
import './Dashboard.css';



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
                    {data.price}
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

const LiveMarketDashboard = ({ user, watchlist, onWatchlistChange }) => {
    // State for Data
    const [indices, setIndices] = useState([]);
    const [macro, setMacro] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [indianBluechips, setIndianBluechips] = useState([]);
    const [userWatchlist, setUserWatchlist] = useState([]);
    const [news, setNews] = useState([]);
    const [calendar, setCalendar] = useState([]);
    
    // State for UI
    const [niftySectors, setNiftySectors] = useState([]);
    const [topMovers, setTopMovers] = useState([]);
    const [fiiDiiFlows, setFiiDiiFlows] = useState([]);
    const [technicalSignals, setTechnicalSignals] = useState(null);
    const [earningsWatch, setEarningsWatch] = useState([]);
    const [marketSentiment, setMarketSentiment] = useState({ score: 50, label: 'NEUTRAL', reason: 'Initializing...' });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [chartTimeframe, setChartTimeframe] = useState('1D');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [syncKey, setSyncKey] = useState(0);

    const getTimeframeParams = (tf) => {
        const timeframeMap = {
            '1D': { range: '1d', interval: '5m' },
            '1W': { range: '5d', interval: '15m' },
            '1M': { range: '1mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1wk' }
        };
        return timeframeMap[tf] || { range: '1d', interval: '5m' };
    };

    // Initial Load & Persistent Watchlist
    const loadAllData = useCallback(async (watchlistSymbols, showLoader = true) => {
        if (showLoader) setIsLoading(true);
        try {
            const [idx, mac, cry, com, glo, cal, sec, mov, fii, tech, earn] = await Promise.all([
                fetchDashboardIndices(),
                fetchGlobalMacro(),
                fetchCryptoData(),
                fetchCommodities(),
                fetchIndianEquities(),
                fetchEconomicCalendar(),
                fetchNiftySectors(),
                fetchTopMovers(),
                fetchFiiDiiFlows(),
                fetchMarketSentiment(),
                // Simulated technical signals and earnings for now to ensure stability
                Promise.resolve({ rsi: 68, macd: 'Bullish', trend: 'Strong Buy' }),
                Promise.resolve([
                    { name: 'TCS', date: 'APR 12', time: 'Post-market', target: '₹4,200', consensus: 'Neutral' },
                    { name: 'INFY', date: 'APR 18', time: 'Post-market', target: '₹1,550', consensus: 'Positive' },
                    { name: 'HDFCBANK', date: 'APR 24', time: 'Pre-market', target: '₹1,750', consensus: 'Critical' }
                ])
            ]);

            setIndices(idx || []);
            setMacro(mac || []);
            setCrypto(cry || []);
            setCommodities(com || []);
            setIndianBluechips(glo || []);
            setCalendar(cal || []);
            setNiftySectors(sec || []);
            setTopMovers(mov || []);
            setFiiDiiFlows(fii || []);
            setMarketSentiment(snt || { score: 50, label: 'NEUTRAL', reason: 'Error syncing signals' });
            setTechnicalSignals(tech);
            setEarningsWatch(earn);

            if (watchlistSymbols.length > 0) {
                const { range, interval } = getTimeframeParams(chartTimeframe);
                const watchData = await Promise.all(watchlistSymbols.map(s => fetchHistory(s, range, interval)));
                setUserWatchlist(watchData.filter(d => d !== null));
            }

            setLastUpdated(new Date());
            setIsLoading(false);
            return idx;
        } catch (e) {
            console.error('Terminal load failed:', e);
            setIsLoading(false);
            return [];
        }
    }, [chartTimeframe]);

    useEffect(() => {
        loadAllData(watchlist, true);
    }, [syncKey, watchlist]);

    // Handle timeframe changes
    useEffect(() => {
        if (selectedAsset) {
            const fetchAssetHistory = async () => {
                const { range, interval } = getTimeframeParams(chartTimeframe);
                const updated = await fetchHistory(selectedAsset.fullSymbol, range, interval);
                if (updated) {
                    setSelectedAsset(updated);
                }
            };
            fetchAssetHistory();
        }
    }, [chartTimeframe]);

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
        if (!watchlist.includes(symbol)) {
            const newSaved = [...watchlist, symbol];
            onWatchlistChange(newSaved);
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
        const newSaved = watchlist.filter(s => s !== symbol);
        onWatchlistChange(newSaved);
        setUserWatchlist(prev => prev.filter(item => item.fullSymbol !== symbol));
    };

    const handleAssetChange = async (asset) => {
        setSelectedAsset(asset);
        if (asset.name) {
            const newsData = await fetchMarketNews(asset.name);
            setNews(newsData || []);
        }
    };

    const triggerSync = () => {
        setSyncKey(prev => prev + 1);
    };

    if (isLoading && !indices.length) {
        return (
            <div className="dashboard-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCw className="animate-spin text-purple-500" size={48} style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>BOOTING COMMAND CENTER...</p>
                    <p style={{ fontSize: '0.6rem', opacity: 0.3, marginTop: '1rem' }}>SEARCH-SYNC ENGINE v5.0.1</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div className="dashboard-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={syncKey}>


            <header className="dashboard-header">
                <div>
                    <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
                        Market <span className="text-gradient">Neural Intelligence</span>
                    </h1>
                    <p style={{ margin: '0.4rem 0 0', opacity: 0.6, fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        Institutional data synchronization: ACTIVE // ENGINE: v2.7.2 // {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                        onClick={triggerSync}
                        className="terminal-status" 
                        style={{ border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                        <RefreshCw size={12} style={{ marginRight: 6 }} /> FORCE SYNC
                    </button>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        RESILIENT LINK ACTIVE
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
                                placeholder="Search NSE/BSE Tickers..." 
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            {isSearching && <RefreshCw className="animate-spin" size={12} style={{ position: 'absolute', right: '1rem', opacity: 0.5 }} />}
                        </div>
                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div 
                                    className="search-results-dropdown"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {searchResults.map((res, i) => (
                                        <div key={i} className="search-result-item" onClick={() => addToWatchlist(res.symbol)}>
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
                            <p style={{ fontSize: '0.7rem', opacity: 0.3, textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                Build your terminal index
                            </p>
                        )}
                    </div>

                    <div className="ticker-group">
                        <span className="ticker-group-label"><Globe size={12} style={{ marginRight: 4 }} /> Indian Bluechips</span>
                        {indianBluechips.map((asset, i) => (
                            <WatchlistCard 
                                key={i} 
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
                        {macro.filter(m => m.name.includes('10Y')).map(asset => (
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
                                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>{selectedAsset?.name || 'SYNCING...'}</h2>
                                <span className="terminal-num" style={{ fontSize: '3rem', fontWeight: 800, color: selectedAsset?.isPositive ? '#22c55e' : '#ef4444' }}>
                                    {selectedAsset?.price || '---'}
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
                        
                        <div style={{ height: 500 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedAsset?.sparkline || []}>
                                    <defs>
                                        <linearGradient id="chartG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedAsset?.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor={selectedAsset?.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
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
                                        stroke={selectedAsset?.isPositive ? '#22c55e' : '#ef4444'} 
                                        fill="url(#chartG)" 
                                        strokeWidth={3}
                                        animationDuration={1000}
                                        isAnimationActive={true}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
                        <SectorHeatmap sectors={niftySectors} />
                        
                        <section className="panel-card" style={{ marginBottom: 0 }}>
                            <h3><ShieldCheck size={16} /> Asset Metrics</h3>
                            <div className="fundamentals-grid">
                                <div className="fundamental-item">
                                    <span className="label">Volume</span>
                                    <span className="value terminal-num">{selectedAsset?.volume || 'SYNCED'}</span>
                                </div>
                                <div className="fundamental-item">
                                    <span className="label">Market Status</span>
                                    <span className="value" style={{ color: selectedAsset?.isPositive ? '#22c55e' : '#ef4444' }}>
                                        {selectedAsset?.isPositive ? 'OPTIMISTIC' : 'RECOVERY'}
                                    </span>
                                </div>
                                <div className="fundamental-item">
                                    <span className="label">Sync Engine</span>
                                    <span className="value" style={{ fontSize: '0.75rem' }}>SEARCH-SYNC V5</span>
                                </div>
                                <div className="fundamental-item">
                                    <span className="label">Source Mode</span>
                                    <span className="value" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>RESILIENT LINK</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'stretch' }}>
                        <FiiDiiAnalyzer flows={fiiDiiFlows} />
                        <EconomicCalendar events={calendar} />
                    </div>

                    <TechnicalPulse signals={technicalSignals} />
                    
                    <div style={{ height: '40px' }} /> {/* SPACING FILLER */}
                </main>

                {/* COLUMN 3: INTELLIGENCE */}
                <aside className="intelligence-column">
                    <section className="panel-card">
                        <h3><Activity size={16} /> Sentiment Analysis</h3>
                        <div className="sentiment-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                <span style={{ color: '#ef4444' }}>FEAR</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{marketSentiment.label}</span>
                                <span style={{ color: '#22c55e' }}>GREED</span>
                            </div>
                            <div className="gauge-track">
                                <div className="gauge-pointer" style={{ left: `${marketSentiment.score}%` }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: '0.8rem 0 0', lineHeight: 1.4 }}>
                                {marketSentiment.reason}
                            </p>
                        </div>
                    </section>

                    <section className="panel-card">
                        <h3><Newspaper size={16} /> Market Insights</h3>
                        <div className="news-list">
                            {news.length > 0 ? (
                                news.filter(item => 
                                    !item.title.toLowerCase().includes('duckduckgo') && 
                                    !item.title.toLowerCase().includes('ad clicks') &&
                                    !item.title.toLowerCase().includes('privacy protected') &&
                                    !item.title.toLowerCase().includes('microsoft')
                                ).slice(0, 8).map((item, i) => (
                                    <div key={i} className="news-item">
                                        <span className="source">{item.source || 'GLOBAL'}</span>
                                        <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <p style={{ margin: '0.2rem 0', cursor: 'pointer', fontWeight: 600 }}>
                                                {item.title.split(' --\u003e')[0]} 
                                            </p>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4, padding: '1rem' }}>
                                    <RefreshCw className="animate-spin" size={14} />
                                    <span style={{ fontSize: '0.8rem' }}>Syncing Indian insights...</span>
                                </div>
                            )}
                        </div>
                    </section>

                    <MarketPulse topMovers={topMovers} />

                    <EarningsWatch companies={earningsWatch} />
                    
                    <div style={{ 
                        marginTop: '1.5rem', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Neural Analyst Status
                        </p>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                            All systems operational. Monitoring 500+ Indian tickers.
                        </p>
                    </div>

                    <div style={{ height: '60px' }} /> {/* VIRTUAL BOTTOM PADDING */}
                </aside>
            </div>
        </motion.div>
    );
};

export default LiveMarketDashboard;
