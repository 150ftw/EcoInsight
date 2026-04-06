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

const PortfolioAnalyzer = () => {
    const [stocks, setStocks] = useState([
        { symbol: 'RELIANCE', name: 'Reliance Industries', amount: 50000 },
        { symbol: 'TCS', name: 'TCS Ltd', amount: 30000 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', amount: 20000 }
    ]);
    const [tempSymbol, setTempSymbol] = useState('');
    const [tempAmount, setTempAmount] = useState('');

    const addStock = () => {
        if (!tempSymbol || !tempAmount) return;
        setStocks([...stocks, { 
            symbol: tempSymbol.toUpperCase(), 
            name: tempSymbol.toUpperCase(), 
            amount: parseFloat(tempAmount) 
        }]);
        setTempSymbol('');
        setTempAmount('');
    };

    const removeStock = (index) => {
        setStocks(stocks.filter((_, i) => i !== index));
    };

    const totalValue = stocks.reduce((acc, stock) => acc + stock.amount, 0);
    const chartData = stocks.map(s => ({ name: s.symbol, value: s.amount }));
    const COLORS = ['#8b5cf6', '#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const riskScore = stocks.length > 5 ? 35 : stocks.length > 2 ? 65 : 85;

    return (
        <div className="portfolio-analyzer-container">
            <div className="section-header">
                <h3><Target size={18} className="text-purple-400" /> Neural Portfolio Analyzer</h3>
                <p>Simulate risk exposure and sector optimization</p>
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
                            placeholder="Value (₹)" 
                            value={tempAmount}
                            onChange={(e) => setTempAmount(e.target.value)}
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
                                        <span className="symbol">{stock.symbol}</span>
                                        <span className="amount">₹{stock.amount.toLocaleString()}</span>
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
                    <div className="chart-container" style={{ width: '100%', height: 200 }}>
                        <ReResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <ReCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                            </RePieChart>
                        </ReResponsiveContainer>
                    </div>
                    
                    <div className="risk-metrics">
                        <div className="metric-card">
                            <span className="label">Risk Score</span>
                            <span className="value" style={{ color: riskScore < 50 ? '#10b981' : '#f59e0b' }}>
                                {riskScore}/100
                            </span>
                            <div className="risk-bar"><div className="risk-fill" style={{ width: `${riskScore}%`, background: riskScore < 50 ? '#10b981' : '#f59e0b' }} /></div>
                        </div>
                        <div className="metric-card">
                            <span className="label">Diversification</span>
                            <span className="value">{stocks.length > 3 ? 'Optimal' : 'Low'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="analyzer-footer">
                <button className="optimize-btn">
                    <Zap size={14} /> <span>Get Neural Suggestions</span>
                </button>
            </div>
        </div>
    );
};

export default PortfolioAnalyzer;
