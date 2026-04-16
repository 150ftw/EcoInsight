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
