// Dashboard data fetcher for EcoInsight
// Synchronized for Search-Sync v7 Architecture (Server-Side Caching)

const TICKER_API = '/api/ticker?symbol=';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3/simple/price';

// In-memory Session Cache for High-Speed Timeframe Switching. Entries expire
// after the same 3 minutes as api/ticker.js's server-side quote cache — without
// an expiry, the first price fetched was served for the entire browser session,
// so the dashboard drifted away from the chatbot (which always hits the API).
const sessionCache = new Map();
const SESSION_TTL_MS = 3 * 60 * 1000;
// In-flight request de-duplication: the dashboard fires off many fetchers in
// parallel (indices, bluechips, top movers, sectors...) that frequently
// request the same symbol at the same instant, before any of them has had a
// chance to populate sessionCache above. Without this, each one independently
// triggers its own live scrape for the identical symbol/range/interval.
const inFlightRequests = new Map();

/**
 * Fetch market data for a symbol (Search-Sync v7 Engine)
 */
export const fetchHistory = async (symbol, range = '1d', interval = '5m', force = false) => {
    // 1. Session Cache Check (Instant Hit)
    const cacheKey = `${symbol}_${range}_${interval}`;
    const cached = sessionCache.get(cacheKey);
    if (!force && cached && Date.now() - cached.cachedAt < SESSION_TTL_MS) {
        console.log(`[Cache] Instant Session Hit: ${cacheKey}`);
        return cached.result;
    }

    // 2. Join an already-in-flight request for the same key instead of firing
    // a redundant duplicate one.
    if (!force && inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
    try {
        const queryParams = new URLSearchParams({
            symbol,
            range,
            interval
        });
        if (force) queryParams.append('force', 'true');

        const res = await fetch(`/api/ticker?${queryParams.toString()}`);
        if (!res.ok) return null;
        const data = await res.json();
        
        // Ensure data.price is handled as numeric or fallback
        const rawString = String(data.price || '').replace(/[^0-9.]/g, '');
        let numericPrice = parseFloat(rawString);
        
        // Final formatting check for UI
        let formattedPrice = isNaN(numericPrice) || numericPrice === 0 
            ? (data.price && data.price !== '0' ? data.price : '---')
            : numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const result = {
            ...data,
            price: formattedPrice || '---',
            rawPrice: numericPrice || 0,
            changePercent: parseFloat(data.changePercent || 0).toFixed(2),
            isPositive: parseFloat(data.changePercent || 0) >= 0
        };

        // 2. Save to Session Cache — forced fetches too, otherwise the next
        // non-forced read after a FORCE SYNC would get the pre-sync price back.
        sessionCache.set(cacheKey, { result, cachedAt: Date.now() });

        return result;
    } catch (e) {
        console.warn(`Ticker fetch failed for ${symbol}:`, e);
        return null;
    } finally {
        inFlightRequests.delete(cacheKey);
    }
    })();

    if (!force) {
        inFlightRequests.set(cacheKey, requestPromise);
    }
    return requestPromise;
};

/**
 * Background Prefetching for Anticipatory Hydration
 * Loads secondary timeframes while the user is analyzing the primary chart
 */
export const prefetchAssetTimeframes = (symbol) => {
    const timeframes = [
        { range: '5d', interval: '15m' },
        { range: '1mo', interval: '1d' }
    ];
    
    console.log(`[Hydration] Initiating Background Prefetch for ${symbol}`);
    timeframes.forEach(tf => {
        // We don't await this, let it run in the background
        fetchHistory(symbol, tf.range, tf.interval).catch(() => {});
    });
};

/**
 * Fetch Main Indices (Nifty 50, Sensex, Nifty Bank, Nifty IT)
 */
export const fetchDashboardIndices = async (force = false) => {
    const targets = [
        { symbol: '^NSEI', name: 'Nifty 50' },
        { symbol: '^BSESN', name: 'Sensex' },
        { symbol: '^NSEBANK', name: 'Nifty Bank' },
        { symbol: '^CNXIT', name: 'Nifty IT' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Commodities (Gold, Silver, Crude Oil, Natural Gas)
 */
export const fetchCommodities = async (force = false) => {
    const targets = [
        { symbol: 'GC=F', name: 'Gold (MCX)' },
        { symbol: 'SI=F', name: 'Silver (MCX)' },
        { symbol: 'BZ=F', name: 'Brent Crude' },
        { symbol: 'NG=F', name: 'Nat Gas' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Indian Bluechips
 */
export const fetchIndianEquities = async (force = false) => {
    const targets = [
        { symbol: 'RELIANCE:NSE', name: 'Reliance' },
        { symbol: 'TCS:NSE', name: 'TCS' },
        { symbol: 'HDFCBANK:NSE', name: 'HDFC Bank' },
        { symbol: 'INFY:NSE', name: 'Infosys' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Global Macro (Forex & Yields)
 */
export const fetchGlobalMacro = async (force = false) => {
    const targets = [
        { symbol: 'USDINR', name: 'USD/INR' },
        { symbol: 'EURINR', name: 'EUR/INR' },
        { symbol: 'IN10Y:INDEXINDEX', name: 'India 10Y Bond' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Crypto Prices (BTC, ETH)
 */
export const fetchCryptoData = async (force = false) => {
    try {
        const res = await fetch(`${COINGECKO_BASE}?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`);
        if (!res.ok) return null;
        const data = await res.json();
        
        return [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                price: data.bitcoin.usd.toLocaleString(),
                rawPrice: data.bitcoin.usd,
                changePercent: data.bitcoin.usd_24h_change.toFixed(2),
                isPositive: data.bitcoin.usd_24h_change >= 0
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: data.ethereum.usd.toLocaleString(),
                rawPrice: data.ethereum.usd,
                changePercent: data.ethereum.usd_24h_change.toFixed(2),
                isPositive: data.ethereum.usd_24h_change >= 0
            }
        ];
    } catch (e) {
        console.warn('Crypto fetch failed:', e);
        return null;
    }
};

/**
 * Sector Performance (Heatmap)
 */
export const fetchNiftySectors = async (force = false) => {
    const targets = [
        { symbol: '^CNXIT', name: 'IT' },
        { symbol: '^NSEBANK', name: 'Bank' },
        { symbol: '^CNXAUTO', name: 'Auto' },
        { symbol: '^CNXFMCG', name: 'FMCG' },
        { symbol: '^CNXMETAL', name: 'Metal' },
        { symbol: '^CNXPHARMA', name: 'Pharma' },
        { symbol: '^CNXREALTY', name: 'Realty' },
        { symbol: '^CNXMEDIA', name: 'Media' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null).map(r => ({
        name: r.name,
        changePercent: r.changePercent,
        isPositive: r.isPositive,
        price: r.price
    }));
};

/**
 * Top Movers (Gainers/Losers)
 */
export const fetchTopMovers = async (force = false) => {
    const targets = [
        { symbol: 'RELIANCE:NSE', name: 'Reliance' },
        { symbol: 'TCS:NSE', name: 'TCS' },
        { symbol: 'HDFCBANK:NSE', name: 'HDFC Bank' },
        { symbol: 'INFY:NSE', name: 'Infosys' },
        { symbol: 'ICICIBANK:NSE', name: 'ICICI Bank' },
        { symbol: 'ADANIENT:NSE', name: 'Adani Ent' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results.filter(r => r !== null).map(r => ({
        symbol: r.symbol,
        name: r.name,
        changePercent: r.changePercent,
        isPositive: r.isPositive,
        price: r.price
    })).sort((a, b) => b.changePercent - a.changePercent);
};

export const fetchSectorPerformance = async () => {
    const targets = [
        { symbol: '^NSEI', name: 'Nifty 50' },
        { symbol: '^GSPC', name: 'S&P 500' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null).map(r => ({
        name: r.name,
        changePercent: r.changePercent,
        isPositive: r.isPositive
    }));
};

/**
 * Search for tickers using Yahoo Finance Search API (via proxy)
 */
export const searchTickers = async (query) => {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`/api/web-search?type=ticker&q=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const data = await res.json();
        
        return (data.results || []).map(r => ({
            symbol: r.symbol.replace('.', ':'),
            name: r.title.split(' (')[0],
            exch: (r.symbol.includes('.NS') || r.exch === 'NSE') ? 'NSE' : (r.symbol.includes('.BO') || r.exch === 'BSE' || r.exch === 'BOM') ? 'BSE' : r.exch
        })).slice(0, 10);
    } catch (e) {
        console.error('Search Discovery failed:', e);
        return [];
    }
};

/**
 * Fetch Market News using RSS Aggregator (via proxy)
 */
export const fetchMarketNews = async (query) => {
    try {
        // We now use a stable RSS-to-JSON aggregator for Indian news
        const res = await fetch(`/api/web-search?type=news&q=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (e) {
        console.error('News fetch failed:', e);
        return [];
    }
};

/**
 * Fetch FII/DII Institutional Flows (Net Buying/Selling)
 * Real provisional cash-market figures published by NSE each evening, via
 * api/fii-dii.js. Returns [] if NSE is unreachable — the panel shows an
 * "unavailable" state rather than invented numbers.
 */
export const fetchFiiDiiFlows = async () => {
    try {
        const res = await fetch('/api/fii-dii');
        if (!res.ok) return [];
        const { fii, dii, date } = await res.json();

        const crore = (n) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
        const combined = fii.net + dii.net;

        return [
            { name: 'FII/FPI Net', value: crore(fii.net), sentiment: fii.net >= 0 ? 'Net Buyers' : 'Net Sellers', isPositive: fii.net >= 0, date },
            { name: 'DII Net', value: crore(dii.net), sentiment: dii.net >= 0 ? 'Net Buyers' : 'Net Sellers', isPositive: dii.net >= 0, date },
            { name: 'FII Gross Buy', value: crore(fii.buy).replace('+', ''), sentiment: `Sell ${crore(fii.sell).replace('+', '')}`, isPositive: fii.buy >= fii.sell, date },
            { name: 'Combined Net', value: crore(combined), sentiment: combined >= 0 ? 'Net Inflow' : 'Net Outflow', isPositive: combined >= 0, date }
        ];
    } catch (e) {
        console.warn('FII/DII fetch failed:', e);
        return [];
    }
};

// RBI MPC policy announcement days (last day of each meeting) for FY 2026-27,
// per RBI's published schedule. Extend this list when RBI publishes FY28's.
const RBI_POLICY_DATES = ['2026-04-08', '2026-06-05', '2026-08-05', '2026-10-07', '2026-12-04', '2027-02-05'];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Builds a Date for a wall-clock time in IST (UTC+5:30).
const istDate = (y, m, d, hh, mm) => new Date(Date.UTC(y, m, d, hh - 5, mm - 30));

// MoSPI releases on the next working day when the scheduled date is a weekend.
const nextWeekday = (y, m, d) => {
    const dt = new Date(Date.UTC(y, m, d));
    while (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) dt.setUTCDate(dt.getUTCDate() + 1);
    return [dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()];
};

const lastWeekdayOfMonth = (y, m) => {
    const dt = new Date(Date.UTC(y, m + 1, 0));
    while (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) dt.setUTCDate(dt.getUTCDate() - 1);
    return [dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()];
};

/**
 * Enhanced Economic Calendar (India Focused)
 * Generated from the official release schedules rather than a fixed list, so
 * it never goes stale: CPI on the 12th and WPI on the 14th (MoSPI/DPIIT,
 * shifted past weekends), quarterly GDP on the last working day of
 * Feb/May/Aug/Nov, and RBI MPC decisions from RBI_POLICY_DATES.
 */
export const fetchEconomicCalendar = async () => {
    const now = new Date();
    const events = [];

    for (let offset = 0; offset < 3; offset++) {
        const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
        const y = base.getUTCFullYear();
        const m = base.getUTCMonth();
        const refMonth = MONTH_NAMES[(m + 11) % 12];

        events.push({ at: istDate(...nextWeekday(y, m, 12), 16, 0), event: `India CPI Inflation (${refMonth})`, impact: 'High' });
        events.push({ at: istDate(...nextWeekday(y, m, 14), 12, 0), event: `India WPI Inflation (${refMonth})`, impact: 'Medium' });

        // Feb -> Q3 (Oct-Dec), May -> Q4, Aug -> Q1, Nov -> Q2
        const gdpQuarter = { 1: 'Q3', 4: 'Q4', 7: 'Q1', 10: 'Q2' }[m];
        if (gdpQuarter) {
            events.push({ at: istDate(...lastWeekdayOfMonth(y, m), 16, 0), event: `India GDP Growth (${gdpQuarter})`, impact: 'High' });
        }
    }

    RBI_POLICY_DATES.forEach(d => {
        const [y, m, day] = d.split('-').map(Number);
        events.push({ at: istDate(y, m - 1, day, 10, 0), event: 'RBI MPC Policy Decision', impact: 'Critical' });
    });

    // Keep events from the start of today (IST) onwards so today's releases stay visible after they print
    const todayIst = new Date(now.getTime() + 5.5 * 3600 * 1000);
    const startOfTodayIst = istDate(todayIst.getUTCFullYear(), todayIst.getUTCMonth(), todayIst.getUTCDate(), 0, 0);

    return events
        .filter(e => e.at >= startOfTodayIst)
        .sort((a, b) => a.at - b.at)
        .slice(0, 4)
        .map(e => {
            const ist = new Date(e.at.getTime() + 5.5 * 3600 * 1000);
            const isToday = ist.toISOString().slice(0, 10) === todayIst.toISOString().slice(0, 10);
            return {
                date: `${MONTHS[ist.getUTCMonth()]} ${ist.getUTCDate()}`,
                time: `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')}`,
                event: e.event,
                impact: e.impact,
                status: isToday ? (e.at <= now ? 'Released' : 'Today') : 'Upcoming'
            };
        });
};

/**
 * Nifty 50 technicals computed from real daily closes (Google Finance OHLC
 * history via api/ticker.js): Wilder RSI-14, position vs the 20-day SMA, and
 * the 1-month move. Returns null if there isn't enough history.
 */
export const fetchTechnicalSignals = async (force = false) => {
    const data = await fetchHistory('^NSEI', '1mo', '1d', force);
    if (!data || !Array.isArray(data.sparkline)) return null;

    // History can carry two bars for today (intraday + latest) — keep the last per day
    const byDay = new Map();
    data.sparkline.forEach(p => { if (typeof p.price === 'number') byDay.set(p.time, p.price); });
    const closes = [...byDay.values()];
    if (data.rawPrice) closes[closes.length - 1] = data.rawPrice;
    if (closes.length < 20) return null;

    let gain = 0, loss = 0;
    for (let i = 1; i <= 14; i++) {
        const d = closes[i] - closes[i - 1];
        if (d >= 0) gain += d; else loss -= d;
    }
    let avgGain = gain / 14, avgLoss = loss / 14;
    for (let i = 15; i < closes.length; i++) {
        const d = closes[i] - closes[i - 1];
        avgGain = (avgGain * 13 + Math.max(d, 0)) / 14;
        avgLoss = (avgLoss * 13 + Math.max(-d, 0)) / 14;
    }
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    const last = closes[closes.length - 1];
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const smaDistance = ((last - sma20) / sma20) * 100;
    const monthChange = ((last - closes[0]) / closes[0]) * 100;

    let trend = 'Neutral';
    if (last > sma20 && rsi > 50) trend = 'Bullish';
    else if (last < sma20 && rsi < 50) trend = 'Bearish';

    return {
        symbol: 'NIFTY 50',
        rsi: Math.round(rsi * 10) / 10,
        sma20: Math.round(sma20 * 100) / 100,
        smaDistance: smaDistance.toFixed(2),
        monthChange: monthChange.toFixed(2),
        sessions: closes.length,
        trend
    };
};

/**
 * Current Indian results season, e.g. "Q2 FY27" during Oct-Dec 2026
 * (companies report the quarter that just ended).
 */
export const getResultsSeason = (date = new Date()) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    if (m <= 2) return `Q3 FY${String(y).slice(-2)}`;
    if (m <= 5) return `Q4 FY${String(y).slice(-2)}`;
    if (m <= 8) return `Q1 FY${String(y + 1).slice(-2)}`;
    return `Q2 FY${String(y + 1).slice(-2)}`;
};

/**
 * Earnings Watch: live quotes for the large-caps that lead each results
 * season. Uses the same /api/ticker quotes as the rest of the dashboard and
 * the chatbot, so prices always agree.
 */
export const fetchEarningsWatch = async (force = false) => {
    const targets = [
        { symbol: 'TCS:NSE', name: 'TCS' },
        { symbol: 'INFY:NSE', name: 'INFY' },
        { symbol: 'HDFCBANK:NSE', name: 'HDFCBANK' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol, '1d', '5m', force)));
    return results
        .map((r, i) => r && {
            name: targets[i].name,
            price: r.price,
            changePercent: r.changePercent,
            isPositive: r.isPositive,
            peRatio: r.peRatio
        })
        .filter(Boolean);
};

/**
 * Fetch Market Sentiment Score (Fear & Greed Index)
 * Derived from India VIX, Nifty Momentum, and Institutional flows
 */
export const fetchMarketSentiment = async (force = false) => {
    try {
        const [vixData, niftyData] = await Promise.all([
            fetchHistory('^INDIAVIX', '1d', '5m', force),
            fetchHistory('^NSEI', '1d', '5m', force)
        ]);

        if (!vixData || !niftyData) return { score: 50, label: 'NEUTRAL', reason: 'Analyzing market signals...' };

        let score = 50; // Base: Neutral
        const vix = vixData.rawPrice;
        const niftyChange = parseFloat(niftyData.changePercent);

        // 1. VIX Contribution (Volatility Stress)
        if (vix < 14) score += 20;
        else if (vix < 18) score += 5;
        else if (vix < 22) score -= 10;
        else score -= 30;

        // 2. Momentum Contribution
        if (niftyChange > 1.5) score += 20;
        else if (niftyChange > 0.5) score += 10;
        else if (niftyChange < -1.5) score -= 25;
        else if (niftyChange < -0.5) score -= 15;

        // Ensure bounds
        score = Math.max(5, Math.min(95, score));

        let label = 'NEUTRAL';
        let reason = 'Market metrics indicating standard institutional positioning.';

        if (score > 75) {
            label = 'EXTREME GREED';
            reason = 'Institutional aggression detected. Low volatility suggests strong expansion.';
        } else if (score > 60) {
            label = 'BULLISH';
            reason = 'Positive price action supported by stable volatility floors.';
        } else if (score < 25) {
            label = 'EXTREME FEAR';
            reason = 'Panic selling detected. High VIX suggests significant hedging demand.';
        } else if (score < 40) {
            label = 'BEARISH';
            reason = 'Price floor under pressure. Volatility stress is rising.';
        }

        return { 
            score, 
            label, 
            reason: `${reason} (VIX: ${vix.toFixed(2)})`,
            vix: vix.toFixed(2),
            niftyChange: niftyChange.toFixed(2)
        };
    } catch (e) {
        console.warn('Sentiment calculation failed:', e);
        return { score: 50, label: 'NEUTRAL', reason: 'Engine re-syncing sentiment signals...' };
    }
};
