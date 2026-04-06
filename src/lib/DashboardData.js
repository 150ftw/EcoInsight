// Dashboard data fetcher for EcoInsight
// Fetches Indices, Stocks, and Crypto with sparkline data for charts

const YAHOO_BASE = '/yahoo-finance/v8/finance/chart/';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Fetch historical data points for sparklines
 * @param {string} symbol Yahoo Finance symbol (e.g. ^NSEI)
 * @param {string} range '1d', '5d', '1mo'
 * @param {string} interval '5m', '15m', '1d'
 */
export const fetchHistory = async (symbol, range = '1d', interval = '5m') => {
    try {
        const res = await fetch(`${YAHOO_BASE}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`);
        if (!res.ok) return null;
        const data = await res.json();
        const result = data.chart?.result?.[0];
        if (!result) return null;

        const timestamps = result.timestamp || [];
        const prices = result.indicators?.quote?.[0]?.close || [];
        const meta = result.meta;

        // Map to standard format { time, price }
        const sparkline = timestamps.map((t, i) => ({
            time: new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: prices[i] ? parseFloat(prices[i].toFixed(2)) : null
        })).filter(p => p.price !== null);

        const currentPrice = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = currentPrice - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
            symbol: symbol.replace('^', ''),
            name: meta.shortName || symbol,
            price: currentPrice.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            isPositive: change >= 0,
            sparkline
        };
    } catch (e) {
        console.warn(`History fetch failed for ${symbol}:`, e);
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
                changePercent: data.bitcoin.usd_24h_change.toFixed(2),
                isPositive: data.bitcoin.usd_24h_change >= 0
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: data.ethereum.usd.toLocaleString(),
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
 * Fetch Top Movers (Mocked for Demo if API limits hit, but tries Yahoo)
 */
export const fetchMarketMovers = async () => {
    const symbols = [
        { s: 'RELIANCE.NS', n: 'Reliance' },
        { s: 'TCS.NS', n: 'TCS' },
        { s: 'HDFCBANK.NS', n: 'HDFC Bank' },
        { s: 'INFY.NS', n: 'Infosys' },
        { s: 'ICICIBANK.NS', n: 'ICICI Bank' },
        { s: 'SBIN.NS', n: 'SBI' }
    ];

    const results = await Promise.all(symbols.map(t => fetchHistory(t.s, '1d', '15m')));
    const valid = results.filter(r => r !== null);
    
    return {
        gainers: valid.filter(r => r.isPositive).sort((a, b) => b.changePercent - a.changePercent).slice(0, 3),
        losers: valid.filter(r => !r.isPositive).sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)
    };
};

/**
 * Sector Heatmap Data (Mocked based on index performance)
 */
export const fetchSectorPerformance = async () => {
    // In a real app, this would fetch Sectoral Indices like Nifty Bank, Nifty IT, etc.
    const targets = [
        { symbol: '^CNXBANK', name: 'Banking' },
        { symbol: '^CNXIT', name: 'IT' },
        { symbol: '^CNXPHARMA', name: 'Pharma' },
        { symbol: '^CNXENERGY', name: 'Energy' }
    ];

    const results = await Promise.all(targets.map(t => fetchHistory(t.symbol)));
    return results.filter(r => r !== null).map(r => ({
        name: r.name.replace('Nifty ', ''),
        changePercent: r.changePercent,
        isPositive: r.isPositive
    }));
};
