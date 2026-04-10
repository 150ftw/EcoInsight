import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const IntelligenceProbes = ({ questions, onSelect }) => {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="intelligence-probes-container">
            <div className="probes-header">
                <Lightbulb size={16} className="text-accent" />
                <span>Related Intelligence Probes</span>
            </div>
            
            <div className="probes-list">
                {questions.map((q, idx) => (
                    <motion.button
                        key={idx}
                        className="probe-item"
                        onClick={() => onSelect(q)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ x: 5, background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                        <span className="probe-text">{q}</span>
                        <Plus size={16} className="probe-icon" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default IntelligenceProbes;
