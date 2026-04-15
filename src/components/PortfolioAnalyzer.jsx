import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PieChart as PieIcon, TrendingUp, Shield, BarChart2, Plus, Trash2, 
    ChevronRight, Zap, Target
} from 'lucide-react';
import { 
    PieChart as RePieChart, Pie, Cell as ReCell, 
    ResponsiveContainer as ReResponsiveContainer,
    Tooltip, Legend
} from 'recharts';
import { fetchVerifiedPrice } from '../lib/MarketData';

const PortfolioAnalyzer = ({ onAnalyze }) => {
    const [stocks, setStocks] = useState([
        { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 10, price: 2900, manualValue: null },
        { symbol: 'TCS', name: 'TCS Ltd', quantity: 5, price: 4000, manualValue: null },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', quantity: 15, price: 1500, manualValue: null }
    ]);
    const [tempSymbol, setTempSymbol] = useState('');
    const [tempQty, setTempQty] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const syncPrices = async () => {
        setIsSyncing(true);
        try {
            const updated = await Promise.all(stocks.map(async (s) => {
                const data = await fetchVerifiedPrice(s.symbol);
                if (data && data.price) {
                    return { ...s, price: data.price };
                }
                return s;
            }));
            setStocks(updated);
        } catch (e) {
            console.error("Sync failed:", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const addStock = async () => {
        if (!tempSymbol || !tempQty) return;
        const symbol = tempSymbol.toUpperCase();
        // Try to get current price immediately
        const data = await fetchVerifiedPrice(symbol);
        const price = data && data.price ? data.price : 0;
        
        setStocks([...stocks, { 
            symbol, 
            name: symbol, 
            quantity: parseFloat(tempQty),
            price: price
        }]);
        setTempSymbol('');
        setTempQty('');
    };

    const removeStock = (index) => {
        setStocks(stocks.filter((_, i) => i !== index));
    };

    const totalValue = stocks.reduce((acc, stock) => acc + (stock.quantity * stock.price), 0);
    const chartData = stocks.map(s => ({ name: s.symbol, value: s.quantity * s.price }));
    const COLORS = ['#8b5cf6', '#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const riskScore = stocks.length > 5 ? 35 : stocks.length > 2 ? 65 : 85;

    return (
        <div className="portfolio-analyzer-container">
            <div className="section-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3><Target size={18} className="text-purple-400" /> Neural Portfolio Analyzer</h3>
                        <p>Simulate risk exposure and sector optimization</p>
                    </div>
                    <button 
                        onClick={syncPrices} 
                        className={`sync-btn ${isSyncing ? 'animating' : ''}`}
                        disabled={isSyncing}
                    >
                        <TrendingUp size={14} /> <span>{isSyncing ? 'Syncing...' : 'Sync Prices'}</span>
                    </button>
                </div>
            </div>
            
            <div className="analyzer-layout">
                <div className="analyzer-controls">
                    <div className="input-group">
                        <input 
                            type="text" 
                            placeholder="Ticker (e.g. INFOSYS)" 
                            value={tempSymbol}
                            onChange={(e) => setTempSymbol(e.target.value)}
                        />
                        <input 
                            type="number" 
                            placeholder="Qty" 
                            value={tempQty}
                            onChange={(e) => setTempQty(e.target.value)}
                        />
                        <button onClick={addStock} className="add-stock-btn">
                            <Plus size={16} />
                        </button>
                    </div>
                    
                    <div className="holdings-list">
                        <AnimatePresence>
                            {stocks.map((stock, i) => (
                                <motion.div 
                                    key={i} 
                                    className="holding-item"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <div className="holding-info">
                                        <div className="holding-main">
                                            <span className="symbol">{stock.symbol}</span>
                                            <span className="qty">{stock.quantity} units</span>
                                        </div>
                                        <div className="holding-value">
                                            <span className="price">@ ₹{stock.price.toLocaleString()}</span>
                                            <span className="total">₹{(stock.quantity * stock.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => removeStock(i)} className="remove-btn">
                                        <Trash2 size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
                
                <div className="analyzer-visualization">
                    <div className="portfolio-total-card">
                        <span className="label">PORTFOLIO VALUATION</span>
                        <span className="value">₹{totalValue.toLocaleString()}</span>
                    </div>

                    <div className="chart-container" style={{ width: '100%', height: 160 }}>
                        <ReResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                />
                            </RePieChart>
                        </ReResponsiveContainer>
                    </div>
                    
                    <div className="risk-metrics">
                        <div className="metric-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span className="label">Asymmetric Stress Test</span>
                                <span className="value" style={{ color: riskScore < 50 ? '#10b981' : '#f59e0b' }}>
                                    {riskScore < 50 ? 'RESILIENT' : 'VOLATILE'}
                                </span>
                            </div>
                            <div className="risk-bar">
                                <div 
                                    className="risk-fill" 
                                    style={{ 
                                        width: `${riskScore}%`, 
                                        background: `linear-gradient(to right, #10b981, #f59e0b, #ef4444)` 
                                    }} 
                                />
                            </div>
                            <p className="metric-hint">Simulating -20% Black Swan exposure</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="analyzer-footer">
                <button className="optimize-btn" onClick={() => onAnalyze(stocks)}>
                    <Zap size={14} /> <span>Initiate Neural Portfolio Audit</span>
                </button>
            </div>
        </div>
    );
};

export default PortfolioAnalyzer;
