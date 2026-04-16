import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RiskBadge = ({ level }) => {
  const styles = {
    LOW: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', color: '#4ade80', icon: <CheckCircle2 size={12} /> },
    MODERATE: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa', icon: <TrendingUp size={12} /> },
    HIGH: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24', icon: <AlertTriangle size={12} /> },
    CRITICAL: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171', icon: <ShieldAlert size={12} /> }
  };

  const style = styles[level] || styles.LOW;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: 800,
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {style.icon}
      {level}
    </span>
  );
};

const AlphaSignal = ({ signal }) => {
  const color = signal === 'Strong' || signal === 'Elite' ? '#8b5cf6' : 
                signal === 'Avoid' || signal === 'Weak' ? '#f43f5e' : '#a1a1aa';
  
  return (
    <span style={{
      fontWeight: 700,
      fontSize: '0.75rem',
      color: color,
      padding: '2px 6px',
      borderLeft: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Zap size={10} style={{ fill: color, opacity: 0.6 }} />
      {signal}
    </span>
  );
};

const SentinelMatrix = ({ scenario, confidence, extrapolations }) => {
  if (!extrapolations || !extrapolations.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sentinel-matrix-wrapper"
      style={{
        margin: '1.5rem 0',
        padding: '1.5rem',
        borderRadius: '24px',
        background: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Neural Elements */}
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h5 style={{ 
              color: '#8b5cf6', 
              fontSize: '0.65rem', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              margin: '0 0 6px 0'
            }}>
              SENTINEL PREDICTIVE MODEL
            </h5>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              {scenario}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '2px' }}>NEURAL CONFIDENCE</div>
            <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 900, fontFamily: 'monospace' }}>
              {(confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Sector Asset</th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Direct Impact</th>
                <th style={{ textAlign: 'left', padding: '12px 10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Second-Order Effects</th>
                <th style={{ textAlign: 'right', padding: '12px 10px', color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Risk / Signal</th>
              </tr>
            </thead>
            <tbody>
              {extrapolations.map((ext, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <td style={{ padding: '14px 10px', fontWeight: 700, color: '#fff' }}>{ext.sector}</td>
                  <td style={{ padding: '14px 10px', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{ext.direct}</div>
                  </td>
                  <td style={{ padding: '14px 10px', color: 'rgba(255,255,255,0.6)', maxWidth: '280px' }}>
                    <div style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>{ext.secondary}</div>
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <RiskBadge level={ext.risk} />
                      <AlphaSignal signal={ext.alpha} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '10px', 
          borderRadius: '12px', 
          background: 'rgba(139, 92, 246, 0.05)', 
          border: '1px solid rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Zap size={14} color="#8b5cf6" className="animate-pulse" />
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            <span style={{ color: '#8b5cf6', fontWeight: 700 }}>SOVEREIGN INTELLIGENCE:</span> Extrapolated analysis based on 2025 catalyst dynamics and second-order institutional flow modeling.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SentinelMatrix;
