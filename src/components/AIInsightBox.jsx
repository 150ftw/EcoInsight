import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, ArrowRight, Lightbulb } from 'lucide-react';

const AI_INSIGHTS = [
    { text: "Banking sector may show bullish movement due to policy expectations.", sector: "Banking" },
    { text: "Tech earnings are projected to outpace current market estimates.", sector: "IT" },
    { text: "Green energy initiatives are creating long-term structural tailwinds.", sector: "Energy" },
    { text: "Infrastructure spending hike expected to boost core industrial stocks.", sector: "Industrial" },
    { text: "Market volatility may increase ahead of the quarterly RBI review.", sector: "Macro" }
];

const AIInsightBox = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % AI_INSIGHTS.length);
        }, 10000); // Change every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const currentInsight = AI_INSIGHTS[index];

    return (
        <motion.div 
            className="ai-insight-box-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="insight-glow" />
            <div className="insight-header">
                <div className="insight-label">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>EcoInsight AI – Today’s Insight</span>
                </div>
                <div className="insight-sector-tag">{currentInsight.sector}</div>
            </div>
            
            <div className="insight-body">
                <AnimatePresence mode="wait">
                    <motion.p 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.4 }}
                    >
                        {currentInsight.text}
                    </motion.p>
                </AnimatePresence>
            </div>
            
            <div className="insight-footer">
                <div className="sentiment-bar">
                    <div className="sentiment-fill" style={{ width: '75%' }} />
                </div>
                <button className="insight-action-btn">
                    <span>Analyze Deeper</span>
                    <ArrowRight size={12} />
                </button>
            </div>
        </motion.div>
    );
};

export default AIInsightBox;
