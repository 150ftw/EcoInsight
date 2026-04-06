// Dashboard data fetcher for EcoInsight
// Corrected for V5 Search-Sync Scraper

const TICKER_API = '/api/ticker?symbol=';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Fetch market data for a symbol (Search-Sync v5 Scraper)
 */
export const fetchHistory = async (symbol, range = '1d', interval = '5m') => {
    try {
        const res = await fetch(`${TICKER_API}${encodeURIComponent(symbol)}`);
        if (!res.ok) return null;
        const data = await res.json();
        
        // Ensure data.price is handled as numeric or fallback
        const rawString = String(data.price || '').replace(/[^0-9.]/g, '');
        let numericPrice = parseFloat(rawString);
        
        // Final formatting check for UI
        let formattedPrice = isNaN(numericPrice) || numericPrice === 0 
            ? (data.price && data.price !== '0' ? data.price : '---')
            : numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return {
            ...data,
            price: formattedPrice || '---',
            rawPrice: numericPrice || 0,
            changePercent: parseFloat(data.changePercent || 0).toFixed(2),
            isPositive: parseFloat(data.changePercent || 0) >= 0
        };
    } catch (e) {
        console.warn(`Ticker fetch failed for ${symbol}:`, e);
        return null;
    }
};

/**
 * Fetch Main Indices (Nifty 50, Sensex, S&P 500, Nasdaq)
 */
export const fetchDashboardIndices = async () => {
    const targets = [
        { symbol: '^NSEI', name: 'Nifty 50' },
        { symbol: '^BSESN', name: 'Sensex' },
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^IXIC', name: 'Nasdaq 100' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Commodities (Gold, Silver, Oil, Gas)
 */
export const fetchCommodities = async () => {
    const targets = [
        { symbol: 'GC=F', name: 'Gold' },
        { symbol: 'SI=F', name: 'Silver' },
        { symbol: 'BZ=F', name: 'Brent Oil' },
        { symbol: 'NG=F', name: 'Nat Gas' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Global Giants
 */
export const fetchGlobalEquities = async () => {
    const targets = [
        { symbol: 'AAPL:NASDAQ', name: 'Apple' },
        { symbol: 'NVDA:NASDAQ', name: 'NVIDIA' },
        { symbol: 'TSLA:NASDAQ', name: 'Tesla' },
        { symbol: 'MSFT:NASDAQ', name: 'Microsoft' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Global Macro (Forex & Yields)
 */
export const fetchGlobalMacro = async () => {
    const targets = [
        { symbol: 'USD-INR', name: 'USD/INR' },
        { symbol: 'EUR-USD', name: 'EUR/USD' },
        { symbol: 'TY10:INDEXCBOE', name: '10Y Yield' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null);
};

/**
 * Fetch Crypto Prices (BTC, ETH)
 */
export const fetchCryptoData = async () => {
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
 * Sector Heatmap Data
 */
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
 * Search for tickers using Web-Search fallback (DuckDuckGo Discover)
 */
export const searchTickers = async (query) => {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query + ' stock symbol google finance')}`);
        if (!res.ok) return [];
        const data = await res.json();
        
        return (data.results || []).map(r => {
            const gMatch = r.url.match(/quote\/([^/?]+)/);
            if (gMatch) {
                return {
                    symbol: decodeURIComponent(gMatch[1]),
                    name: r.title.split(' - ')[0],
                    exch: gMatch[1].includes(':') ? gMatch[1].split(':')[1] : 'GLOBAL'
                };
            }
            return null;
        }).filter(r => r !== null).slice(0, 5);
    } catch (e) {
        console.error('Search Discovery failed:', e);
        return [];
    }
};

/**
 * Fetch Market News for a specific ticker using the web-search proxy
 */
export const fetchMarketNews = async (query) => {
    try {
        const res = await fetch(`/api/web-search?q=${encodeURIComponent(query + ' finance stock news')}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results || [];
    } catch (e) {
        console.error('News fetch failed:', e);
        return [];
    }
};

/**
 * Mocked Economic Calendar
 */
export const fetchEconomicCalendar = () => {
    return [
        { date: 'Apr 12', time: '10:30 AM', event: 'India CPI Inflation (Mar)', impact: 'High' },
        { date: 'Apr 15', time: '06:00 PM', event: 'US Core Retail Sales', impact: 'Medium' },
        { date: 'Apr 18', time: '02:30 PM', event: 'ECB Policy Meeting', impact: 'High' },
        { date: 'Apr 24', time: '09:00 AM', event: 'RBI Monetary Policy Update', impact: 'Critical' }
    ];
};
