import React from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Premium color palette for charts
const CHART_COLORS = [
    '#8b5cf6', '#06d6a0', '#f97316', '#38bdf8', '#f43f5e',
    '#a78bfa', '#34d399', '#fbbf24', '#22d3ee', '#fb7185'
];

const CHART_THEME = {
    background: 'rgba(0,0,0,0.3)',
    gridColor: 'rgba(255,255,255,0.06)',
    textColor: '#a1a1aa',
    tooltipBg: 'rgba(15,15,20,0.95)',
    tooltipBorder: 'rgba(139, 92, 246, 0.3)',
};

// Neural Numeric Formatter for high-magnitude economic data
export const formatInstitutionalValue = (val) => {
    if (typeof val !== 'number') return val;
    const absVal = Math.abs(val);
    
    if (absVal >= 1e12) return (val / 1e12).toFixed(2) + 'T'; // Trillion
    if (absVal >= 1e9) return (val / 1e9).toFixed(1) + 'B';   // Billion
    if (absVal >= 1e7) return (val / 1e7).toFixed(1) + 'Cr';  // Crore
    if (absVal >= 1e5) return (val / 1e5).toFixed(1) + 'L';   // Lakh
    if (absVal >= 1e3) return (val / 1e3).toFixed(1) + 'K';   // Thousand
    
    return val.toLocaleString('en-IN');
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: CHART_THEME.tooltipBg,
                border: `1px solid ${CHART_THEME.tooltipBorder}`,
                borderRadius: '12px',
                padding: '12px 16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} style={{ color: entry.color, fontSize: '0.8rem', margin: '2px 0', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                        <span style={{ fontWeight: 600 }}>{entry.name}:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formatInstitutionalValue(entry.value)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ChartWrapper = ({ title, children }) => (
    <div style={{
        background: CHART_THEME.background,
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem',
        margin: '1rem 0',
        backdropFilter: 'blur(10px)',
    }}>
        {title && (
            <h4 style={{
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#8b5cf6', display: 'inline-block',
                    boxShadow: '0 0 8px rgba(139,92,246,0.6)',
                }} />
                {title}
            </h4>
        )}
        {children}
    </div>
);

// Renders a line chart
const EcoLineChart = ({ data, title, dataKeys }) => {
    if (!data || !data.length) return null;

    // Automatically find data keys if not provided
    // Skip 'name' and any keys that aren't numbers (or numeric strings)
    const keys = dataKeys || Object.keys(data[0]).filter(k => {
        if (k === 'name' || k === 'label') return false;
        const val = data[0][k];
        return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });

    // Ensure all data points are numbers
    const processedData = data.map(item => {
        const newItem = { ...item };
        keys.forEach(k => {
            if (typeof newItem[k] === 'string') {
                newItem[k] = parseFloat(newItem[k]) || 0;
            }
        });
        return newItem;
    });

    return (
        <ChartWrapper title={title}>
            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                    <XAxis dataKey="name" tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis 
                        tick={{ fill: CHART_THEME.textColor, fontSize: 11 }} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                        tickFormatter={formatInstitutionalValue}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: CHART_THEME.textColor, fontSize: '0.8rem' }} />
                    {keys.map((key, idx) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            strokeWidth={2.5}
                            dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], r: 4 }}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

// Renders a bar chart
const EcoBarChart = ({ data, title, dataKeys }) => {
    if (!data || !data.length) return null;

    // Automatically find data keys if not provided
    const keys = dataKeys || Object.keys(data[0]).filter(k => {
        if (k === 'name' || k === 'label') return false;
        const val = data[0][k];
        return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });

    // Ensure all data points are numbers
    const processedData = data.map(item => {
        const newItem = { ...item };
        keys.forEach(k => {
            if (typeof newItem[k] === 'string') {
                newItem[k] = parseFloat(newItem[k]) || 0;
            }
        });
        return newItem;
    });

    return (
        <ChartWrapper title={title}>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                    <XAxis dataKey="name" tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis 
                        tick={{ fill: CHART_THEME.textColor, fontSize: 11 }} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                        tickFormatter={formatInstitutionalValue}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: CHART_THEME.textColor, fontSize: '0.8rem' }} />
                    {keys.map((key, idx) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                            radius={[6, 6, 0, 0]}
                            opacity={0.85}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

// Renders a pie chart
const EcoPieChart = ({ data, title }) => {
    if (!data || !data.length) return null;

    return (
        <ChartWrapper title={title}>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    >
                        {data.map((entry, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: CHART_THEME.textColor, fontSize: '0.8rem' }} />
                </PieChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

// Renders an area chart
const EcoAreaChart = ({ data, title, dataKeys }) => {
    if (!data || !data.length) return null;

    // Automatically find data keys if not provided
    const keys = dataKeys || Object.keys(data[0]).filter(k => {
        if (k === 'name' || k === 'label') return false;
        const val = data[0][k];
        return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });

    // Ensure all data points are numbers
    const processedData = data.map(item => {
        const newItem = { ...item };
        keys.forEach(k => {
            if (typeof newItem[k] === 'string') {
                newItem[k] = parseFloat(newItem[k]) || 0;
            }
        });
        return newItem;
    });

    return (
        <ChartWrapper title={title}>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        {keys.map((key, idx) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                    <XAxis dataKey="name" tick={{ fill: CHART_THEME.textColor, fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis 
                        tick={{ fill: CHART_THEME.textColor, fontSize: 11 }} 
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                        tickFormatter={formatInstitutionalValue}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: CHART_THEME.textColor, fontSize: '0.8rem' }} />
                    {keys.map((key, idx) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            fill={`url(#gradient-${key})`}
                            strokeWidth={2}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
};

// Premium Institutional Table Component
const EcoTable = ({ rows, headers }) => {
    if (!rows || !rows.length) return null;

    return (
        <div 
            className="institutional-table-wrapper"
            style={{
                margin: '1.5rem 0',
                width: '100%',
                overflowX: 'auto',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                /* Standardize scrollbar for Windows/macOS */
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
            }}
        >
            <table style={{
                width: '100%',
                minWidth: '550px', /* Prevent squashing on mobile */
                borderCollapse: 'separate', /* Necessary for sticky borders */
                borderSpacing: 0,
                fontSize: '0.85rem',
                color: '#d1d5db',
                textAlign: 'left'
            }}>
                <thead>
                    <tr style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                        {headers.map((header, idx) => (
                            <th 
                                key={idx} 
                                style={{
                                    padding: '14px 16px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    position: idx === 0 ? 'sticky' : 'static',
                                    left: 0,
                                    zIndex: idx === 0 ? 2 : 1,
                                    background: idx === 0 ? 'rgba(20, 20, 25, 0.95)' : 'transparent',
                                    backdropFilter: idx === 0 ? 'blur(10px)' : 'none',
                                    boxShadow: idx === 0 ? '4px 0 8px rgba(0,0,0,0.3)' : 'none'
                                }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ 
                            background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'}
                        >
                            {row.map((cell, cIdx) => (
                                <td 
                                    key={cIdx} 
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        fontWeight: cIdx === 0 ? 700 : 400,
                                        color: cIdx === 0 ? '#fff' : 'inherit',
                                        position: cIdx === 0 ? 'sticky' : 'static',
                                        left: 0,
                                        zIndex: cIdx === 0 ? 1 : 0,
                                        background: cIdx === 0 ? (rIdx % 2 === 0 ? 'rgba(15, 15, 20, 0.98)' : 'rgba(20, 20, 25, 0.98)') : 'transparent',
                                        boxShadow: cIdx === 0 ? '4px 0 8px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Sanitizes a raw JSON string from the AI to be more parser-friendly.
 * Removes units like %, M, B, Cr, L and fixes minor syntax errors.
 */
const sanitizeChartJson = (raw) => {
    if (!raw) return '';

    let sanitized = raw.trim();

    // 1. Strip units from values (e.g., "10%", 10%, "100M", "10.5B")
    // This regex looks for digits followed by units inside quotes or as raw values
    // It captures: "10%", 10%, "10.5M", etc.
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*[%MBK]|[₹$](?=\d)/gi, '$1');

    // 2. Handle cases where the AI puts units inside quotes: "10%" -> "10"
    // We do this by targeting common suffix patterns inside values
    sanitized = sanitized.replace(/: \s*"(\d+(?:\.\d+)?)(?:%|[MBK]|Cr|L)"/gi, ': $1');

    // 3. Fix common missing quotes for keys if AI is lazy
    // sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    // 4. Strip trailing commas in objects/arrays which JSON.parse hates
    sanitized = sanitized.replace(/,\s*([\]}])/g, '$1');

    return sanitized;
};

/**
 * Parses AI response text for chart blocks and returns an array of
 * { type: 'text' | 'chart', content: string | chartConfig }
 * 
 * Chart format in AI responses:
 * ```chart
 * {"type":"line","title":"Chart Title","data":[{"name":"Jan","value":100},...]}
 * ```
 */
export const parseChartBlocks = (text) => {
    if (!text) return [{ type: 'text', content: text }];

    const parts = [];
    // Enhanced regex: 1. Matches ```chart blocks 2. Matches raw {type:chart} JSON 3. Matches markdown tables (| cell | cell |)
    const combinedRegex = /```(?:chart|json|sentinel)?\s*([\s\S]*?)```|(\{\s*"type"\s*:\s*"(?:line|bar|pie|area|sentiment_gauge|risk_heatmap|sentinel_extrapolation)"\s*,[\s\S]*?(?:"data"|"score"|"sectors"|"extrapolations")\s*:\s*(?:\[|\d+|\[)[\s\S]*?\}?[\s\S]*?\})|((?:\n|^)\s*\|.*\|.*\n\s*\|[\s\-\| :]*\|\s*(?:\n\s*\|.*\|.*)*)/gi;

    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Text before the chart
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }

        // Parse the block content (match[1] is backticks, match[2] is raw json)
        if (match[3]) {
            // Markdown Table Detected
            const rawTable = match[3].trim();
            const lines = rawTable.split('\n');
            if (lines.length >= 2) {
                const parseRow = (line) => line.trim().split('|').filter(s => s.trim() !== '' || line.indexOf('|') !== line.lastIndexOf('|')).map(s => s.trim());
                const headers = parseRow(lines[0]);
                const rows = lines.slice(2).map(line => parseRow(line)).filter(r => r.length > 0);
                
                if (headers.length > 0 && rows.length > 0) {
                    parts.push({ type: 'table', content: { headers, rows } });
                } else {
                    parts.push({ type: 'text', content: match[0] });
                }
            } else {
                parts.push({ type: 'text', content: match[0] });
            }
        } else {
            // Parse existing chart/JSON logic
            try {
                const blockContent = (match[1] || match[2]).trim();
                const sanitizedContent = sanitizeChartJson(blockContent);
                const json = JSON.parse(sanitizedContent);

                // Validate it looks like our visual intelligence schema
                if (json && json.type) {
                    const type = json.type.toLowerCase();

                    // Standard Charts
                    if (['line', 'bar', 'pie', 'area'].includes(type) && json.data && Array.isArray(json.data)) {
                        const cleanData = json.data.map(item => {
                            const newItem = { ...item };
                            Object.keys(newItem).forEach(k => {
                                if (k !== 'name' && k !== 'label') {
                                    const val = newItem[k];
                                    if (typeof val === 'string') {
                                        const cleanVal = val.replace(/[%,MBK₹$]/gi, '');
                                        newItem[k] = parseFloat(cleanVal);
                                    }
                                }
                            });
                            return newItem;
                        });
                        parts.push({ type: 'chart', content: { ...json, data: cleanData } });
                    } 
                    // Sentinel Extrapolation
                    else if (type === 'sentinel_extrapolation' && json.extrapolations && Array.isArray(json.extrapolations)) {
                        parts.push({ type: 'chart', content: json });
                    }
                    // Sentiment Gauge
                    else if (type === 'sentiment_gauge' && json.score !== undefined) {
                      parts.push({ type: 'chart', content: json });
                    }
                    else {
                        // Not a recognized visual block, fallback to text
                        parts.push({ type: 'text', content: match[0] });
                    }
                } else {
                    parts.push({ type: 'text', content: match[0] });
                }
 Riverside: 
            } catch (e) {
                console.warn('Chart parsing failed after sanitation:', e);
                // Parsing failed (not valid JSON), fallback to text
                parts.push({ type: 'text', content: match[0] });
            }
        }

        lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
};

import SentimentGauge from './SentimentGauge';
import SentinelMatrix from './SentinelMatrix';

/**
 * Renders a chart or visual intelligence component based on the parsed config
 */
export const EcoChartRenderer = ({ config, type }) => {
    if (type === 'table') {
        return <EcoTable rows={config.rows} headers={config.headers} />;
    }

    if (!config || (!config.data && !config.score && !config.sectors && !config.extrapolations)) return null;

    const chartType = (config.type || 'line').toLowerCase();

    switch (chartType) {
        case 'line':
            return <EcoLineChart data={config.data} title={config.title} dataKeys={config.dataKeys} />;
        case 'bar':
            return <EcoBarChart data={config.data} title={config.title} dataKeys={config.dataKeys} />;
        case 'pie':
            return <EcoPieChart data={config.data} title={config.title} />;
        case 'area':
            return <EcoAreaChart data={config.data} title={config.title} dataKeys={config.dataKeys} />;
        case 'sentiment_gauge':
            return (
                <SentimentGauge 
                    score={config.score} 
                    label={config.label} 
                    signals={config.signals} 
                    type={config.gaugeType || 'market'} 
                />
            );
        case 'sentinel_extrapolation':
            return (
                <SentinelMatrix 
                  scenario={config.scenario}
                  confidence={config.confidence}
                  extrapolations={config.extrapolations}
                />
            );
        default:
            return <EcoLineChart data={config.data} title={config.title} dataKeys={config.dataKeys} />;
    }
};
