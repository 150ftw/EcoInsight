import React from 'react';
import { LayoutGrid, Activity } from 'lucide-react';

const SectorHeatmap = ({ sectors, title = "Sector Heatmap", subtitle = "NSE Real-time", compact = false }) => {
    if (!sectors || sectors.length === 0) return null;

    return (
        <div className="panel-card" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            padding: compact ? '16px' : '24px',
            background: compact ? 'rgba(15, 15, 20, 0.4)' : 'rgba(10, 10, 15, 0.8)',
            border: compact ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
            margin: compact ? '16px 0' : '0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '0.8rem' : '1.2rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: compact ? '0.9rem' : '1.1rem' }}>
                    <LayoutGrid size={16} className="text-blue-400" />
                    {title}
                </h3>
                <span style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {subtitle}
                </span>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: '8px',
                flex: 1
            }}>
                {sectors.map((sector, idx) => {
                    const absChange = Math.abs(parseFloat(sector.changePercent));
                    const opacity = Math.min(0.1 + (absChange / 5), 0.8);
                    const color = sector.isPositive ? `rgba(34, 197, 94, ${opacity})` : `rgba(239, 68, 68, ${opacity})`;
                    const borderColor = sector.isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';

                    return (
                        <div 
                            key={idx}
                            style={{
                                background: color,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                padding: '12px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer',
                                backdropFilter: 'blur(4px)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.9, marginBottom: '4px', textAlign: 'center' }}>
                                {sector.name.toUpperCase()}
                            </span>
                            <span style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 800, 
                                color: sector.isPositive ? '#4ade80' : '#f87171',
                                textShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}>
                                {sector.isPositive ? '+' : ''}{sector.changePercent}%
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', opacity: 0.6 }}>
                <Activity size={12} />
                <span>Advancing: {sectors.filter(s => s.isPositive).length} | Declining: {sectors.filter(s => !s.isPositive).length}</span>
            </div>
        </div>
    );
};

export default SectorHeatmap;
