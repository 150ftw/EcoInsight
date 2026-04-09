import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InitializationTerminal = ({ moduleName, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('initializing');

    const getCustomLogs = (moduleName) => {
        const name = moduleName.toLowerCase();
        const baseLogs = [
            `> Establishing secure connection to node_${name.replace(/\s+/g, '_')}...`,
            `> Authenticating HSM credentials... [OK]`,
            `> ACCESSING NEURAL OVERDRIVE STATE...`,
            `> NODES ONLINE: 4,096 / 4,096 [STABLE]`
        ];

        let specificLogs = [];
        if (name.includes('data pattern') || name.includes('market')) {
            specificLogs = [
                `> Isolating neural compute cycles...`,
                `> Loading high-fidelity dataset: global_markets_v4.2...`,
                `> Initializing tensor optimization (FP8)...`,
                `> CALIBRATING SPECTRAL MAPS...`,
                `> SYNTHESIZING NEURAL ALPHA SIGNAL...`
            ];
        } else if (name.includes('predictive') || name.includes('forecast')) {
            specificLogs = [
                `> Booting Quantum-Sim heuristic engine...`,
                `> Loading 10-year macroeconomic historical vectors...`,
                `> Running Monte Carlo simulation (N=100,000)...`,
                `> GENERATING PROBABILITY DISTRIBUTION...`,
                `> ISOLATING TAIL-RISK OUTLIERS...`
            ];
        } else if (name.includes('security') || name.includes('zero trust')) {
            specificLogs = [
                `> Activating biometric network access...`,
                `> Enforcing Zero Trust Protocol (ZTP) standards...`,
                `> Encrypting data streams (AES-256-GCM)...`,
                `> VERIFYING ENEMY SIGNATURE DATABASES...`,
                `> LOCKING PERIMETER DEFENSES...`
            ];
        } else if (name.includes('api') || name.includes('institutional')) {
            specificLogs = [
                `> Establishing WebSockets endpoint: wss://api.ecoinsight.ai/v1...`,
                `> Negotiating FIX 4.4 protocol handshake...`,
                `> Allocating ultra-low latency memory channels...`,
                `> SYNCHRONIZING TICK DATA (sub-millisecond)...`,
                `> API GATEWAY READY FOR INGRESS...`
            ];
        } else if (name.includes('gpu') || name.includes('enterprise')) {
            specificLogs = [
                `> Scanning for available A100/H100 clusters...`,
                `> Provisioning elastic compute resources...`,
                `> Load balancing initiated across 4 regions...`,
                `> DEPLOYING DISTRIBUTED TRAINING NODES...`,
                `> COMPUTE ARCHITECTURE OPTIMIZED...`
            ];
        } else {
            specificLogs = [
                `> Initializing core logic matrix...`,
                `> Loading required dependencies for ${moduleName}...`,
                `> Compiling local execution environment...`,
                `> VALIDATING MODULE INTEGRITY...`,
                `> SYNCHRONIZATION COMPLETE...`
            ];
        }

        return [...baseLogs, ...specificLogs, `> PARITY CHECK COMPLETE.`, `> INTEGRATION STATUS: NOMINAL.`];
    };

    const terminalLines = getCustomLogs(moduleName);

    useEffect(() => {
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < terminalLines.length) {
                setLogs(prev => [...prev, terminalLines[currentLine]]);
                setProgress((currentLine + 1) * (100 / terminalLines.length));
                currentLine++;
            } else {
                setStatus('complete');
                clearInterval(interval);
            }
        }, 600);
        return () => clearInterval(interval);
    }, [terminalLines]);

    return (
        <motion.div
            className="initialization-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="terminal-window"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                <div className="terminal-header">
                    <div className="terminal-controls">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                    </div>
                    <span className="terminal-title">INTELLIGENCE_NODE_INIT :: {moduleName.toUpperCase()}</span>
                </div>
                <div className="terminal-body">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            className="terminal-line"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {log}
                        </motion.div>
                    ))}
                    {status === 'initializing' && (
                        <div className="terminal-loader">
                            <div className="progress-bar-container">
                                <motion.div
                                    className="progress-bar-fill"
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="percentage">{Math.round(progress)}%</span>
                        </div>
                    )}
                    {status === 'complete' && (
                        <motion.div
                            className="terminal-success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="success-banner">MODULE INTEGRATED</div>
                            <button className="btn-shine-primary" onClick={onClose} style={{ marginTop: '1.5rem' }}>ENTER INTERFACE</button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InitializationTerminal;
