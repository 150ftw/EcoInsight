/**
 * MarketOracle (Sovereign Context Engine for EcoInsight)
 * Synchronized for Indian Standard Time (IST) - Asia/Kolkata
 */

export const NSE_HOLIDAYS = [
    // 2025 Trading Holidays
    '2025-01-26', // Republic Day
    '2025-02-26', // Mahashivratri
    '2025-03-14', // Holi
    '2025-03-31', // Id-ul-Fitr
    '2025-04-10', // Mahavir Jayanti
    '2025-04-14', // Dr. Ambedkar Jayanti
    '2025-04-18', // Good Friday
    '2025-05-01', // Maharashtra Day
    '2025-08-15', // Independence Day
    '2025-08-27', // Ganesh Chaturthi
    '2025-10-02', // Gandhi Jayanti
    '2025-10-21', // Diwali Laxmi Pujan (Muhurat Trading in evening)
    '2025-10-22', // Diwali Balipratipada
    '2025-11-05', // Guru Nanak Jayanti
    '2025-12-25', // Christmas

    // 2026 Trading Holidays
    '2026-01-26', // Republic Day
    '2026-02-16', // Mahashivratri
    '2026-03-03', // Holi
    '2026-03-20', // Id-ul-Fitr
    '2026-03-31', // Mahavir Jayanti
    '2026-04-03', // Good Friday
    '2026-04-14', // Dr. Ambedkar Jayanti
    '2026-05-01', // Maharashtra Day
    '2026-05-27', // Bakri Id / Eid ul-Adha
    '2026-08-15', // Independence Day
    '2026-09-15', // Ganesh Chaturthi
    '2026-10-02', // Gandhi Jayanti
    '2026-10-20', // Dussehra
    '2026-11-09', // Diwali Balipratipada
    '2026-11-24', // Guru Nanak Jayanti
    '2026-12-25', // Christmas

    // 2027 Trading Holidays
    '2027-01-26', // Republic Day
    '2027-03-07', // Mahashivratri
    '2027-03-23', // Holi
    '2027-03-26', // Good Friday
    '2027-04-09', // Id-ul-Fitr
    '2027-04-14', // Dr. Ambedkar Jayanti
    '2027-04-20', // Mahavir Jayanti
    '2027-05-01', // Maharashtra Day
    '2027-08-15', // Independence Day
    '2027-10-02', // Gandhi Jayanti
    '2027-11-08', // Diwali Balipratipada
    '2027-12-25', // Christmas
];

export const NSE_HOLIDAYS_2025 = NSE_HOLIDAYS;

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
    const isHoliday = NSE_HOLIDAYS.includes(dateStr);
    
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
 * Returns Indian taxation metadata for AI grounding (Finance Act 2024 / Current Law).
 */
export const getTaxContext = () => {
    return {
        stcg: '20% on listed equity & equity-oriented mutual funds (Section 111A, effective Budget 2024)',
        ltcg: '12.5% on gains exceeding ₹1.25 Lakh per financial year (Section 112A, effective Budget 2024)',
        unlisted_ltcg: '12.5% for unlisted equity and real estate (indexation benefit removed for transfers post July 23, 2024)',
        fd: 'Taxed at applicable slab rate + 4% Health & Education Cess',
        intraday: 'Speculative business income (Taxed at applicable slab rate)',
        fno: 'Non-speculative business income (Taxed at applicable slab rate; STT 0.02% on futures, 0.1% on option premium)',
        buybacks: 'Taxed as dividend income in shareholder hands under Section 2(22)(f) (effective Oct 1, 2024)'
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
