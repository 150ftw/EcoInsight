import React from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

const EconomicCalendar = ({ events }) => {
    return (
        <section className="panel-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                    <Calendar size={16} /> ECONOMIC CALENDAR
                </h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', opacity: 0.8 }}>BHARAT FOCUS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {events.map((event, idx) => (
                    <div 
                        key={idx}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '0.8rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', minWidth: '40px' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 800 }}>{event.date.split(' ')[0]}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>{event.date.split(' ')[1]}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{event.event}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.4, marginTop: '2px' }}>
                                    <Clock size={12} />
                                    <span style={{ fontSize: '0.7rem' }}>{event.time} IST</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                                fontSize: '0.6rem', 
                                padding: '2px 8px', 
                                borderRadius: '40px',
                                border: '1px solid',
                                borderColor: event.impact === 'Critical' ? '#ef4444' : event.impact === 'High' ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                color: event.impact === 'Critical' ? '#ef4444' : event.impact === 'High' ? '#f59e0b' : 'rgba(255,255,255,0.5)',
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                letterSpacing: '0.5px'
                            }}>
                                {event.impact}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                {event.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EconomicCalendar;
