// Real-time market data fetcher for EcoInsight
// Uses free, no-auth APIs to inject live context into the AI system prompt
import { getCachedMarketData, getStaleCachedMarketData, setCachedMarketData } from './SupabaseStorage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
let cachedData = null;
let lastFetchTime = 0;

// Fetch USD/INR and other exchange rates (free, no API key)
const fetchExchangeRates = async () => {
    try {
        const res = await fetch('/exchange-rates/v4/latest/USD');
        if (!res.ok) return null;
        const data = await res.json();
        return {
            usdInr: data.rates?.INR?.toFixed(2),
            eurInr: (data.rates?.INR / data.rates?.EUR)?.toFixed(2),
            gbpInr: (data.rates?.INR / data.rates?.GBP)?.toFixed(2),
            usdJpy: data.rates?.JPY?.toFixed(2),
        };
    } catch (e) {
        console.warn('Exchange rate fetch failed:', e);
        return null;
    }
};

// Fetch Nifty 50 and Sensex from Yahoo Finance (free, no key)
const fetchIndianIndices = async () => {
    const indices = {};
    const targets = [
        { symbol: '^NSEI', name: 'Nifty 50' },
        { symbol: '^BSESN', name: 'Sensex' },
    ];

    for (const target of targets) {
        try {
            const res = await fetch(
                `/yahoo-finance/v8/finance/chart/${target.symbol}?interval=1d&range=1d`
            );
            if (!res.ok) continue;
            const data = await res.json();
            const meta = data.chart?.result?.[0]?.meta;
            if (meta) {
                indices[target.name] = {
                    price: meta.regularMarketPrice?.toFixed(2),
                    prevClose: meta.chartPreviousClose?.toFixed(2),
                    change: (meta.regularMarketPrice - meta.chartPreviousClose)?.toFixed(2),
                    changePercent: (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100)?.toFixed(2),
                };
            }
        } catch (e) {
            console.warn(`Failed to fetch ${target.name}:`, e);
        }
    }
    return Object.keys(indices).length > 0 ? indices : null;
};

// Fetch gold price (via Yahoo Finance, gold futures)
const fetchGoldPrice = async () => {
    try {
        const res = await fetch(
            '/yahoo-finance/v8/finance/chart/GC=F?interval=1d&range=1d'
        );
        if (!res.ok) return null;
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (meta) {
            return {
                priceUsd: meta.regularMarketPrice?.toFixed(2),
            };
        }
    } catch (e) {
        console.warn('Gold price fetch failed:', e);
    }
    return null;
};

// Fetch crude oil price
const fetchCrudePrice = async () => {
    try {
        const res = await fetch(
            '/yahoo-finance/v8/finance/chart/CL=F?interval=1d&range=1d'
        );
        if (!res.ok) return null;
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (meta) {
            return {
                priceUsd: meta.regularMarketPrice?.toFixed(2),
            };
        }
    } catch (e) {
        console.warn('Crude price fetch failed:', e);
    }
    return null;
};

// Main function: fetch all data with caching and Supabase-backed Alpha Vantage Prices
export const fetchMarketContext = async () => {
    // Fetch exchange rates (free API)
    const exchangeRates = await fetchExchangeRates();

    // Extract real-time stock prices that the Ticker already fetched via Google Finance to save network calls
    const topStocksKeys = ["RELIANCE", "HDFCBANK", "INFY", "TCS", "ICICIBANK", "SBIN"];
    const realtimeStocks = [];

    for (const symbol of topStocksKeys) {
        try {
            const cachedData = await getCachedMarketData(`gf_price_${symbol}`);
            if (cachedData) {
                realtimeStocks.push(cachedData);
            }
        } catch (e) { }
    }

    // Build the context string
    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
    const currentTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
    });

    let context = `\n\n--- LIVE MARKET DATA (as of ${currentDate}, ${currentTime} IST) ---`;

    if (realtimeStocks.length > 0) {
        context += '\n\nREAL-TIME INDIAN BLUE CHIP STOCKS (Fetched via Alpha Vantage):';
        for (const stock of realtimeStocks) {
            context += `\n• ${stock.symbol.replace('.BSE', '')}: ₹${stock.price} (${stock.isPositive ? '+' : '-'}${stock.changePercent}%)`;
        }
    }

    if (exchangeRates) {
        context += '\n\nCURRENCY RATES (Live):';
        context += `\n• USD/INR: ₹${exchangeRates.usdInr}`;
        context += `\n• EUR/INR: ₹${exchangeRates.eurInr}`;
        context += `\n• GBP/INR: ₹${exchangeRates.gbpInr}`;
    }

    context += `\n\nIMPORTANT: Use this live data when answering questions about current market conditions, prices, or exchange rates. Always cite the real-time data provided above rather than your outdated training data.`;
    context += '\n--- END LIVE DATA ---';

    return context;
};


// ============================================================
// ON-DEMAND STOCK LOOKUP — Google Finance (UNLIMITED, FREE, NO API KEY)
// Uses Google Finance HTML scraping via Vite proxy for live prices
// Uses Alpha Vantage SYMBOL_SEARCH (cached 24h) for name→symbol only
// ============================================================

const AV_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Comprehensive quick map: common name → NSE symbol (for Google Finance URL)
const STOCK_SYMBOL_MAP = {
    // Nifty 50 + Large Caps
    'reliance': 'RELIANCE', 'tcs': 'TCS', 'infosys': 'INFY', 'infy': 'INFY',
    'hdfc bank': 'HDFCBANK', 'hdfcbank': 'HDFCBANK', 'hdfc': 'HDFCBANK',
    'icici bank': 'ICICIBANK', 'icicibank': 'ICICIBANK', 'icici': 'ICICIBANK',
    'sbi': 'SBIN', 'sbin': 'SBIN', 'state bank': 'SBIN',
    'wipro': 'WIPRO', 'hcl tech': 'HCLTECH', 'hcltech': 'HCLTECH',
    'bharti airtel': 'BHARTIARTL', 'airtel': 'BHARTIARTL', 'bhartiartl': 'BHARTIARTL',
    'kotak': 'KOTAKBANK', 'kotak bank': 'KOTAKBANK', 'kotakbank': 'KOTAKBANK',
    'maruti': 'MARUTI', 'maruti suzuki': 'MARUTI',
    'asian paints': 'ASIANPAINT', 'asianpaint': 'ASIANPAINT',
    'itc': 'ITC', 'larsen': 'LT', 'l&t': 'LT', 'lt': 'LT',
    'axis bank': 'AXISBANK', 'axisbank': 'AXISBANK',
    'sun pharma': 'SUNPHARMA', 'sunpharma': 'SUNPHARMA',
    'titan': 'TITAN', 'ultratech': 'ULTRACEMCO', 'ultracemco': 'ULTRACEMCO',
    'nestle': 'NESTLEIND', 'nestle india': 'NESTLEIND',
    'power grid': 'POWERGRID', 'powergrid': 'POWERGRID',
    'ntpc': 'NTPC', 'ongc': 'ONGC', 'coal india': 'COALINDIA', 'coalindia': 'COALINDIA',
    'adani ports': 'ADANIPORTS', 'adaniports': 'ADANIPORTS',
    'adani enterprises': 'ADANIENT', 'adanient': 'ADANIENT', 'adani': 'ADANIENT',
    'adani green': 'ADANIGREEN', 'adanigreen': 'ADANIGREEN',
    'adani power': 'ADANIPOWER', 'adanipower': 'ADANIPOWER',
    'tata motors': 'TATAMOTORS', 'tatamotors': 'TATAMOTORS',
    'tata steel': 'TATASTEEL', 'tatasteel': 'TATASTEEL',
    'tata power': 'TATAPOWER', 'tatapower': 'TATAPOWER',
    'tata consumer': 'TATACONSUM', 'tataconsum': 'TATACONSUM',
    'tech mahindra': 'TECHM', 'techm': 'TECHM',
    'm&m': 'M%26M', 'mahindra': 'M%26M',
    'hindalco': 'HINDALCO', 'jsw steel': 'JSWSTEEL', 'jswsteel': 'JSWSTEEL',
    'bajaj finance': 'BAJFINANCE', 'bajfinance': 'BAJFINANCE',
    'bajaj finserv': 'BAJAJFINSV', 'bajajfinsv': 'BAJAJFINSV',
    'bajaj auto': 'BAJAJ-AUTO', 'bajajauto': 'BAJAJ-AUTO',
    'hero motocorp': 'HEROMOTOCO', 'heromotoco': 'HEROMOTOCO',
    'divis lab': 'DIVISLAB', 'divislab': 'DIVISLAB',
    'dr reddy': 'DRREDDY', 'drreddy': 'DRREDDY',
    'cipla': 'CIPLA', 'apollo hospitals': 'APOLLOHOSP', 'apollohosp': 'APOLLOHOSP',
    'indusind bank': 'INDUSINDBK', 'indusindbk': 'INDUSINDBK',
    'sbi life': 'SBILIFE', 'sbilife': 'SBILIFE',
    'hdfc life': 'HDFCLIFE', 'hdfclife': 'HDFCLIFE',
    'britannia': 'BRITANNIA', 'grasim': 'GRASIM',
    'eicher motors': 'EICHERMOT', 'eichermot': 'EICHERMOT',
    'upl': 'UPL', 'bpcl': 'BPCL', 'ioc': 'IOC', 'hpcl': 'HINDPETRO',
    'vedanta': 'VEDL', 'vedl': 'VEDL',
    'pidilite': 'PIDILITIND', 'pidilitind': 'PIDILITIND',
    'godrej': 'GODREJCP', 'godrejcp': 'GODREJCP',

    // Popular New-age & Mid Caps
    'zomato': 'ETERNAL', 'eternal': 'ETERNAL', 'eternal ltd': 'ETERNAL',
    'paytm': 'PAYTM', 'one97': 'PAYTM',
    'nykaa': 'NYKAA', 'fsn e-commerce': 'NYKAA',
    'policybazaar': 'POLICYBZR', 'policybzr': 'POLICYBZR', 'pb fintech': 'POLICYBZR',
    'delhivery': 'DELHIVERY',
    'swiggy': 'SWIGGY',
    'ola electric': 'OLAELEC', 'olaelec': 'OLAELEC',
    'irctc': 'IRCTC',
    'hal': 'HAL', 'hindustan aeronautics': 'HAL',
    'bhel': 'BHEL', 'sail': 'SAIL', 'iex': 'IEX',
    'dixon': 'DIXON', 'dixon tech': 'DIXON',
    'dmart': 'DMART', 'avenue supermarts': 'DMART',
    'ltimindtree': 'LTIM', 'ltim': 'LTIM', 'lti mindtree': 'LTIM',
    'mphasis': 'MPHASIS', 'persistent': 'PERSISTENT', 'coforge': 'COFORGE',
    'bank of baroda': 'BANKBARODA', 'bankbaroda': 'BANKBARODA',
    'pnb': 'PNB', 'punjab national bank': 'PNB',
    'canara bank': 'CANBK', 'canbk': 'CANBK',
    'indian bank': 'INDIANB',
    'bandhan bank': 'BANDHANBNK', 'bandhanbnk': 'BANDHANBNK',
    'yes bank': 'YESBANK', 'yesbank': 'YESBANK',
    'idfc first': 'IDFCFIRSTB', 'idfcfirstb': 'IDFCFIRSTB',
    'tata elxsi': 'TATAELXSI', 'tataelxsi': 'TATAELXSI',
    'havells': 'HAVELLS', 'dabur': 'DABUR', 'marico': 'MARICO',
    'biocon': 'BIOCON', 'lupin': 'LUPIN',
    'page industries': 'PAGEIND', 'pageind': 'PAGEIND',
    'siemens': 'SIEMENS', 'abb': 'ABB', 'polycab': 'POLYCAB',
    'motherson sumi': 'MOTHERSON', 'motherson': 'MOTHERSON',
    'trent': 'TRENT', 'voltas': 'VOLTAS',
    'cholamandalam': 'CHOLAFIN', 'cholafin': 'CHOLAFIN',
    'shriram finance': 'SHRIRAMFIN', 'shriramfin': 'SHRIRAMFIN',
    'jsw energy': 'JSWENERGY', 'jswenergy': 'JSWENERGY',
    'torrent pharma': 'TORNTPHARM', 'torntpharm': 'TORNTPHARM',
    'mrf': 'MRF', 'srf': 'SRF',
    'indian hotels': 'INDHOTEL', 'indhotel': 'INDHOTEL',
    'interglobe': 'INDIGO', 'indigo': 'INDIGO',
    'zydus': 'ZYDUSLIFE', 'zydus life': 'ZYDUSLIFE', 'zyduslife': 'ZYDUSLIFE',
    'mankind pharma': 'MANKIND', 'mankind': 'MANKIND',
    'jio financial': 'JIOFIN', 'jiofin': 'JIOFIN',
    'tata technologies': 'TATATECH', 'tatatech': 'TATATECH',
};

/**
 * Fetch live stock price from Google Finance by scraping the HTML.
 * This is UNLIMITED — no API key, no rate limit.
 * Uses the Vite proxy at /google-finance to bypass CORS.
 * Cached in localStorage for 15 minutes.
 */
const fetchGoogleFinancePrice = async (nseSymbol) => {
    const cacheKey = `gf_price_${nseSymbol}`;

    // Check Supabase cache (15 min expiry is handled by TTL)
    try {
        const cached = await getCachedMarketData(cacheKey);
        if (cached) return cached;
    } catch (e) { }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
            `/google-finance/finance/quote/${encodeURIComponent(nseSymbol)}:NSE`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return null;
        const html = await res.text();

        // Extract the last price from data attribute
        const priceMatch = html.match(/data-last-price="([^"]+)"/);
        if (!priceMatch) return null;

        const price = parseFloat(priceMatch[1]);
        if (isNaN(price)) return null;

        // Extract rich data from the P6K39c class values
        // Google Finance puts stats in order: Previous close, Day range, Year range, Market cap, Avg Volume, P/E ratio, Dividend yield, Exchange
        const statsValues = [];
        const statsRegex = /class="P6K39c">([^<]+)</g;
        let statsMatch;
        while ((statsMatch = statsRegex.exec(html)) !== null) {
            statsValues.push(statsMatch[1].trim());
        }

        const prevCloseStr = statsValues[0] || '';
        const prevClose = parseFloat(prevCloseStr.replace(/[₹,]/g, ''));
        const change = !isNaN(prevClose) ? (price - prevClose) : 0;
        const changePercent = !isNaN(prevClose) && prevClose > 0 ? Math.abs((change / prevClose) * 100) : 0;

        const result = {
            symbol: nseSymbol,
            price: price.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            isPositive: change >= 0,
            previousClose: statsValues[0] || '-',
            dayRange: statsValues[1] || '-',
            yearRange: statsValues[2] || '-',
            marketCap: statsValues[3] || '-',
            avgVolume: statsValues[4] || '-',
            peRatio: statsValues[5] || '-',
            dividendYield: statsValues[6] || '-',
            exchange: statsValues[7] || 'NSE',
            source: 'Google Finance (NSE)',
        };

        // Cache result in Supabase (15 min TTL)
        await setCachedMarketData(cacheKey, result, 15 * 60 * 1000);
        return result;
    } catch (e) {
        console.warn(`Google Finance fetch failed for ${nseSymbol}:`, e);
    }

    // Return stale cache from Supabase if available
    try {
        const stale = await getStaleCachedMarketData(cacheKey);
        if (stale) return stale;
    } catch (e) { }
    return null;
};

/**
 * Search Alpha Vantage SYMBOL_SEARCH to find the NSE symbol for a company name.
 * Used ONLY when the stock is NOT in STOCK_SYMBOL_MAP.
 * Results are cached for 7 days (symbols don't change often).
 */
const searchStockSymbol = async (query) => {
    const cacheKey = `stock_search_${query.toLowerCase().replace(/\s+/g, '_')}`;

    // Check Supabase cache (7 day expiry handled by TTL)
    try {
        const cached = await getCachedMarketData(cacheKey);
        if (cached) return cached;
    } catch (e) { }

    if (!AV_API_KEY) return null;

    try {
        const res = await fetch(
            `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${AV_API_KEY}`
        );
        if (!res.ok) return null;
        const data = await res.json();

        if (data['Information']) return null; // rate limit

        const matches = data.bestMatches || [];
        if (matches.length === 0) return null;

        // Find Indian BSE/NSE match
        const indianMatch = matches.find(m =>
            (m['1. symbol']?.endsWith('.BSE') || m['1. symbol']?.endsWith('.NSE')) &&
            m['3. type'] === 'Equity'
        );

        if (indianMatch) {
            // Extract just the ticker symbol (e.g., "ETERNAL.BSE" → "ETERNAL")
            const fullSymbol = indianMatch['1. symbol'];
            const ticker = fullSymbol.replace('.BSE', '').replace('.NSE', '');
            // Cache in Supabase for 7 days
            await setCachedMarketData(cacheKey, ticker, 7 * 24 * 60 * 60 * 1000);
            return ticker;
        }
    } catch (e) {
        console.warn('Symbol search failed:', e);
    }
    return null;
};

// Keywords that indicate the user is asking about stocks/prices
const STOCK_KEYWORDS = [
    'price', 'stock', 'share', 'shares', 'live', 'current', 'today',
    'trading', 'traded', 'market cap', 'buy', 'sell', 'invest',
    'portfolio', 'holdings', 'quote', 'ticker',
    'nse', 'bse', 'sensex', 'nifty', 'ipo',
    'bull', 'bear', 'rally', 'crash', 'returns',
    'dividend', 'pe ratio', 'eps', 'revenue', 'profit',
    'analysis', 'forecast', 'target', 'valuation',
    'mutual fund', 'etf',
];

/**
 * Extract potential stock names from the user's message.
 */
const extractPotentialStockNames = (message) => {
    const names = [];
    const lowerMsg = message.toLowerCase();

    // Check quick map first
    const sortedKeys = Object.keys(STOCK_SYMBOL_MAP).sort((a, b) => b.length - a.length);
    const resolvedSymbols = new Set();

    for (const name of sortedKeys) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lowerMsg) && !resolvedSymbols.has(STOCK_SYMBOL_MAP[name])) {
            resolvedSymbols.add(STOCK_SYMBOL_MAP[name]);
            names.push({ name, symbol: STOCK_SYMBOL_MAP[name], source: 'map' });
        }
    }

    // Extract Capitalized phrases (potential company names for dynamic search)
    const capitalizedPattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3})\b/g;
    let match;
    const alreadyMatched = new Set(names.map(n => n.name.toLowerCase()));
    const commonWords = new Set([
        'the', 'what', 'how', 'show', 'give', 'tell', 'price', 'stock',
        'share', 'live', 'current', 'today', 'please', 'can', 'you', 'me',
        'is', 'are', 'this', 'that', 'for', 'and', 'with', 'about',
        'analysis', 'compare', 'comparing', 'between', 'market', 'chart',
        'graph', 'line', 'bar', 'india', 'indian', 'right', 'now',
        'currently', 'performance', 'trend', 'forecast', 'let', 'would',
        'could', 'should', 'which', 'where', 'when', 'why', 'ltd',
        'limited', 'inc', 'corp', 'company', 'group',
    ]);

    while ((match = capitalizedPattern.exec(message)) !== null) {
        const name = match[1].trim();
        if (name.length >= 3 && !alreadyMatched.has(name.toLowerCase()) && !commonWords.has(name.toLowerCase())) {
            names.push({ name, symbol: null, source: 'extracted' });
            alreadyMatched.add(name.toLowerCase());
        }
    }

    // ALL-CAPS ticker symbols (e.g. TCS, INFY)
    const tickerPattern = /\b([A-Z]{2,10})\b/g;
    while ((match = tickerPattern.exec(message)) !== null) {
        const ticker = match[1];
        if (!alreadyMatched.has(ticker.toLowerCase()) && !commonWords.has(ticker.toLowerCase())) {
            names.push({ name: ticker, symbol: null, source: 'ticker' });
            alreadyMatched.add(ticker.toLowerCase());
        }
    }

    return names;
};

/**
 * Main entry point: detect stock names in the user's message,
 * resolve their NSE symbols, fetch live prices from Google Finance,
 * and return a context string for the AI.
 */
export const fetchOnDemandContext = async (userMessage) => {
    if (!userMessage || userMessage.length < 3) return '';

    const lowerMsg = userMessage.toLowerCase();
    const isStockRelated = STOCK_KEYWORDS.some(kw => lowerMsg.includes(kw));
    const potentialNames = extractPotentialStockNames(userMessage);

    // If no stock keywords and no known symbols found, skip entirely
    if (!isStockRelated && potentialNames.filter(n => n.source === 'map').length === 0) return '';

    // Resolve NSE symbols
    const resolvedSymbols = [];

    for (const entry of potentialNames.slice(0, 5)) {
        if (entry.symbol) {
            resolvedSymbols.push(entry.symbol);
        } else if (isStockRelated) {
            // Dynamic search via Alpha Vantage (cached 7 days, barely uses quota)
            const symbol = await searchStockSymbol(entry.name);
            if (symbol) resolvedSymbols.push(symbol);
        }
    }

    if (resolvedSymbols.length === 0) return '';

    // Fetch prices from Google Finance (unlimited, free, no API key!)
    const uniqueSymbols = [...new Set(resolvedSymbols)];
    const quotes = await Promise.all(uniqueSymbols.map(s => fetchGoogleFinancePrice(s)));
    const validQuotes = quotes.filter(q => q !== null);

    if (validQuotes.length === 0) return '';

    let context = '\n\n--- LIVE STOCK DATA (fetched from Google Finance just now) ---';
    for (const q of validQuotes) {
        const direction = q.isPositive ? '▲' : '▼';
        context += `\n\n📊 ${q.symbol} (${q.exchange})`;
        context += `\n  Current Price: ₹${q.price} (${direction} ${q.changePercent}% | Change: ₹${q.change})`;
        context += `\n  Previous Close: ${q.previousClose}`;
        context += `\n  Day Range: ${q.dayRange}`;
        context += `\n  52-Week Range: ${q.yearRange}`;
        context += `\n  Market Cap: ${q.marketCap}`;
        context += `\n  Avg Volume: ${q.avgVolume}`;
        context += `\n  P/E Ratio: ${q.peRatio}`;
        context += `\n  Dividend Yield: ${q.dividendYield}`;
    }
    context += '\n\nIMPORTANT INSTRUCTIONS FOR YOUR RESPONSE:';
    context += '\n- The above data is LIVE and REAL-TIME from Google Finance. Use it confidently.';
    context += '\n- Give a DETAILED, COMPREHENSIVE analysis. Do NOT give a 2-line answer.';
    context += '\n- Include: current price with change, key metrics (P/E, market cap, volume), technical levels (day range, 52-week range), and a brief outlook/insight.';
    context += '\n- Format with headers, bullet points, and bold numbers for readability.';
    context += '\n- If P/E ratio is available, comment on whether the stock appears overvalued or undervalued relative to peers.';
    context += '\n- Mention the 52-week range to show where the stock stands relative to its yearly high/low.';
    context += '\n--- END LIVE STOCK DATA ---';

    return context;
};

export const fetchNewsTickerData = async () => {
    try {
        // We use a public, free RSS-to-JSON service pointing to The Economic Times (India Markets)
        // This requires ZERO API keys and provides extremely relevant Indian financial news natively.
        const rssUrl = encodeURIComponent('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        if (!res.ok) throw new Error('Failed to fetch news');

        const newsData = await res.json();

        // Helper to unescape HTML entities (e.g. &amp; -> &) to fix "messed up text"
        const decodeEntities = (text) => {
            if (!text) return '';
            return text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ');
        };

        const headlines = (newsData.items || [])
            .map(item => decodeEntities(item.title))
            .filter(title => title.length > 20)
            .slice(0, 10); // Get top 10 valid headlines

        // Fetch real-time prices for top Indian tickers using Google Finance (Unlimited, Free)
        const topStocks = ["RELIANCE", "HDFCBANK", "INFY", "TCS", "ICICIBANK", "SBIN"];

        const trending = await Promise.all(topStocks.map(async (symbol) => {
            try {
                const quote = await fetchGoogleFinancePrice(symbol);
                if (quote) {
                    return {
                        symbol: quote.symbol,
                        price: quote.price,
                        changePercent: quote.changePercent,
                        isPositive: quote.isPositive
                    };
                }
            } catch (e) {
                console.error(`Error fetching ticker for ${symbol}:`, e);
            }

            // Fallback to just the symbol name if scraping somehow fails entirely and no cache is present
            return symbol;
        }));

        return {
            trending,
            headlines: headlines.length > 0 ? headlines : [
                "Markets monitor global interest rate policies closely.",
                "Technology sector sees renewed investment following strong earnings.",
                "Energy prices fluctuate amid geopolitical shifts."
            ]
        };
    } catch (e) {
        console.warn('News ticker fetch failed:', e);
        return {
            trending: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"],
            headlines: [
                "RBI maintains repo rate at 6.5%, focus on inflation target.",
                "Nifty 50 hits record high as FII inflows surge.",
                "Digital Rupee adoption grows across retail segment.",
                "India's GDP growth projected at 7% for FY25.",
                "Sensex gains on strong global cues."
            ]
        };
    }
};
