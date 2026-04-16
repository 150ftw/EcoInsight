/**
 * MarketOracle (Sovereign Context Engine for EcoInsight)
 * Synchronized for Indian Standard Time (IST) - Asia/Kolkata
 */

const NSE_HOLIDAYS_2025 = [
    '2025-01-26', // Republic Day
    '2025-02-26', // Mahashivratri
    '2025-03-14', // Holi
    '2025-03-31', // Eid-ul-Fitr
    '2025-04-10', // Mahavir Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-08-15', // Independence Day
    '2025-08-27', // Ganesh Chaturthi
    '2025-10-02', // Gandhi Jayanti
    '2025-10-21', // Diwali (Market hours might vary for Muhurat)
];

/**
 * Derives current Indian market session status.
 */
export const getIndianMarketStatus = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
    });
    
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;
    
    const day = getPart('weekday');
    const timeStr = `${getPart('hour')}:${getPart('minute')}`;
    const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const isHoliday = NSE_HOLIDAYS_2025.includes(dateStr);
    
    if (isHoliday) return { state: 'HOLIDAY', msg: 'NATIONAL HOLIDAY (MARKETS CLOSED)' };
    if (isWeekend) return { state: 'WEEKEND', msg: 'MARKETS CLOSED (WEEKEND)' };
    
    // Trading Hours (09:15 - 15:30)
    // Pre-open (09:00 - 09:15)
    if (timeStr < '09:00') return { state: 'BEFORE_MARKET', msg: 'MARKET OPENS AT 09:15 IST' };
    if (timeStr < '09:15') return { state: 'PRE_OPEN', msg: 'PRE-OPEN (PRICE DISCOVERY LIVE)' };
    if (timeStr < '15:30') return { state: 'OPEN', msg: 'MARKET LIVE (INSTITUTIONAL HOURS)' };
    if (timeStr < '16:00') return { state: 'POST_CLOSE', msg: 'POST-CLOSE SETTLEMENT' };
    
    return { state: 'CLOSED', msg: 'MARKETS CLOSED (AFTER HOURS)' };
};

/**
 * Returns basic Indian taxation metadata for AI grounding.
 */
export const getTaxContext = () => {
    return {
        stcg: '15% for Equity (Soon to be 20% proposed)',
        ltcg: '10% above ₹1.25L profit (Now 12.5% proposed)',
        fd: 'Slab rate + Cess',
        intraday: 'Speculative business income (Slab rate)',
        fno: 'Non-speculative business income (Slab rate)'
    };
};

/**
 * Returns India-specific technical categories.
 */
export const getMarketGuardrails = () => {
    return {
        fno_ban: 'Stocks with 95% MWPL usage',
        circuit_limits: '5%, 10%, 20% dynamic bands',
        asm_gsm: 'Additional Surveillance Measures for volatility control'
    };
};

/**
 * SENTINEL SCENARIO DATABASE
 * Defines high-conviction second-order effects for Indian macro catalysts.
 */
export const SENTINEL_SCENARIOS = {
    repo_rate_hike: {
        id: 'repo_rate_hike',
        title: 'Interest Rate Normalization (Rate Hike)',
        confidence: 0.92,
        extrapolations: [
            { sector: 'Banking & NBFCs', direct: 'Positive (NIM Expansion)', secondary: 'Higher CASA costs; Potential credit growth slowdown in retail loans.', risk: 'MODERATE', alpha: 'Strong' },
            { sector: 'Real Estate & Infra', direct: 'Negative (Higher EMI)', secondary: 'Inventory overhang in mid-market housing; Higher cost of debt for projects.', risk: 'HIGH', alpha: 'Weak' },
            { sector: 'Automotive', direct: 'Neutral/Negative', secondary: 'Slowdown in 2-wheelers and entry-level passenger vehicles due to financing costs.', risk: 'MODERATE', alpha: 'Neutral' },
            { sector: 'IT Services', direct: 'Mixed (Yield Curve)', secondary: 'Better pricing power if US Fed follows; but potential slowdown in client discretionary spend.', risk: 'LOW', alpha: 'Strong' }
        ]
    },
    monsoon_surplus: {
        id: 'monsoon_surplus',
        title: 'Bountiful Monsoon (Agri-Growth Surge)',
        confidence: 0.88,
        extrapolations: [
            { sector: 'FMCG & Consumer', direct: 'Strong Positive', secondary: 'Rural demand spike; Volume growth in staples and discretionary items.', risk: 'LOW', alpha: 'Elite' },
            { sector: 'Fertilizers & Agri', direct: 'Positive', secondary: 'Higher tractor sales and robust chemical specialized inputs demand.', risk: 'LOW', alpha: 'Strong' },
            { sector: 'Specialty Chemicals', direct: 'Positive', secondary: 'Raw material availability eases; margin expansion in agri-allied units.', risk: 'MODERATE', alpha: 'Strong' }
        ]
    },
    gst_simplification: {
        id: 'gst_simplification',
        title: 'Regulatory Friction Reduction (GST 2.0)',
        confidence: 0.85,
        extrapolations: [
            { sector: 'Logistics & 3PL', direct: 'Highly Positive', secondary: 'Fleet utilization improvement; Shift from unorganized to organized players.', risk: 'LOW', alpha: 'Elite' },
            { sector: 'MSME Manufacturing', direct: 'Positive (Working Capital)', secondary: 'Faster ITC (Input Tax Credit) realization; Competitive pricing vs imports.', risk: 'MODERATE', alpha: 'Strong' },
            { sector: 'Textiles & Leather', direct: 'Positive', secondary: 'Reduced compliance burden leading to better export competitiveness.', risk: 'LOW', alpha: 'Moderate' }
        ]
    },
    crude_oil_surge: {
        id: 'crude_oil_surge',
        title: 'Energy Headwinds (Crude > $90bbl)',
        confidence: 0.95,
        extrapolations: [
            { sector: 'OMCs & Oil', direct: 'Negative (Under-recoveries)', secondary: 'Fiscal deficit pressure; Potential cooling of marketing margins.', risk: 'HIGH', alpha: 'Avoid' },
            { sector: 'Paints & Chem', direct: 'Negative (Input Inflation)', secondary: 'Gross margin contraction; Pricing power tested with consumers.', risk: 'HIGH', alpha: 'Weak' },
            { sector: 'Aviation & Logistics', direct: 'Highly Negative', secondary: 'ATF costs spike; Ticket prices surge leading to potential load factor drop.', risk: 'CRITICAL', alpha: 'Avoid' },
            { sector: 'Banks', direct: 'Neutral', secondary: 'Inflationary pressure might lead to hawkish RBI stance.', risk: 'MODERATE', alpha: 'Strong' }
        ]
    }
};
