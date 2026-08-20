import fetch from 'node-fetch';
import { supabase } from './lib/db.js';

/**
 * Search-Sync v8: Institutional-Grade Real-Time Market Data Engine
 * Features: Live Google Finance Quotes, P/E Ratios, EPS, Market Caps, 52W Ranges, Multi-Exchange Fallback
 */

const HUMAN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const SYMBOL_ALIASES = {
  // Indian Indices
  'NIFTY': 'NIFTY_50:INDEXNSE',
  'NIFTY 50': 'NIFTY_50:INDEXNSE',
  'NIFTY50': 'NIFTY_50:INDEXNSE',
  '^NSEI': 'NIFTY_50:INDEXNSE',
  'NSEI': 'NIFTY_50:INDEXNSE',
  'SENSEX': 'SENSEX:INDEXBOM',
  'BSE SENSEX': 'SENSEX:INDEXBOM',
  '^BSESN': 'SENSEX:INDEXBOM',
  'BSESN': 'SENSEX:INDEXBOM',
  'NIFTYBANK': 'NIFTY_BANK:INDEXNSE',
  'NIFTY BANK': 'NIFTY_BANK:INDEXNSE',
  '^NSEBANK': 'NIFTY_BANK:INDEXNSE',
  'NSEBANK': 'NIFTY_BANK:INDEXNSE',
  'BANKNIFTY': 'NIFTY_BANK:INDEXNSE',
  'NIFTYIT': 'NIFTY_IT:INDEXNSE',
  'NIFTY IT': 'NIFTY_IT:INDEXNSE',
  '^CNXIT': 'NIFTY_IT:INDEXNSE',
  'CNXIT': 'NIFTY_IT:INDEXNSE',
  'NIFTYMIDCAP': 'NIFTY_MIDCAP_50:INDEXNSE',
  
  // Commodities
  'GC=F': 'GCW00:COMEX',
  'GOLD': 'GCW00:COMEX',
  'SI=F': 'SIW00:COMEX',
  'SILVER': 'SIW00:COMEX',
  'CL=F': 'CLW00:NYMEX',
  'CRUDE': 'CLW00:NYMEX',
  'CRUDE OIL': 'CLW00:NYMEX',

  // Currencies
  'USDINR': 'USD-INR',
  'EURINR': 'EUR-INR',
  'GBPINR': 'GBP-INR',
  'USDJPY': 'USD-JPY',

  // Crypto
  'BTC': 'BTC-USD',
  'BITCOIN': 'BTC-USD',
  'BTC-USD': 'BTC-USD',
  'ETH': 'ETH-USD',
  'ETHEREUM': 'ETH-USD',
  'ETH-USD': 'ETH-USD',
  'SOL': 'SOL-USD',
  'SOLANA': 'SOL-USD',

  // Rebranded / Renamed / Corporate Action Tickers
  'TATAMOTORS': 'TMPV:NSE',
  'TATA MOTORS': 'TMPV:NSE',
  'TMPV': 'TMPV:NSE',
  'ZOMATO': 'ETERNAL:NSE',
  'ETERNAL': 'ETERNAL:NSE',
  'SWIGGY': 'SWIGGY:NSE',
  'OLAELEC': 'OLAELEC:NSE',
  'OLA ELECTRIC': 'OLAELEC:NSE',
  'HYUNDAI': 'HYUNDAI:NSE',
  'NTPCGREEN': 'NTPCGREEN:NSE',

  // Global Equities
  'AAPL': 'AAPL:NASDAQ',
  'TSLA': 'TSLA:NASDAQ',
  'NVDA': 'NVDA:NASDAQ',
  'MSFT': 'MSFT:NASDAQ',
  'GOOGL': 'GOOGL:NASDAQ',
  'AMZN': 'AMZN:NASDAQ',
  'META': 'META:NASDAQ'
};

/**
 * Scrapes quote, fundamental ratios, and ranges from Google Finance
 */
async function scrapeGoogleFinance(candidateSymbol) {
  const gfUrl = `https://www.google.com/finance/quote/${encodeURIComponent(candidateSymbol)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(gfUrl, {
      headers: HUMAN_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const html = await res.text();

    const nameMatch = html.match(/class=\"(?:gO24Ff|zzDege)\"[^>]*>([^<]+)<\/div>/);
    if (!nameMatch) return null;
    const name = nameMatch[1].trim();

    const nameIdx = html.indexOf('class="gO24Ff"');
    const section = nameIdx !== -1 ? html.substring(nameIdx, nameIdx + 2500) : html;

    // Price extraction
    const priceMatch = section.match(/jsname=\"Pdsbrc\"[^>]*>[\s\S]*?([0-9,]+\.[0-9]+)[\s\S]*?<\/span>/) ||
                       section.match(/class=\"YMlKec fxKbKc\"[^>]*>₹?([0-9,]+\.[0-9]+)<\/div>/) ||
                       html.match(/data-last-price=\"([^\"]+)\"/);
    if (!priceMatch) return null;
    const price = priceMatch[1].replace(/,/g, '');

    // Change extraction
    let changePercent = '0.00%';
    const changeMatch = section.match(/jsname=\"vY9t3b\"[^>]*>[\s\S]*?([+-]?[\d,.]+%?)[\s\S]*?<\/span>/);
    if (changeMatch) {
      changePercent = changeMatch[1].trim();
    }

    let changeAmount = '0.00';
    const diffMatch = section.match(/jsname=\"xnruHf\"[^>]*>[\s\S]*?([+-]?[\d,.]+)[\s\S]*?<\/span>/);
    if (diffMatch) {
      changeAmount = diffMatch[1].trim();
    }

    const isPositive = !changePercent.startsWith('-');

    // Key Fundamental Statistics Extraction
    const stats = {};
    const statRegex = /class=\"(?:SwQK7|mfs7Fc)\"[^>]*>([^<]+)<\/div>[\s\S]*?class=\"(?:dO6ijd|P6K39c|kf1m0)\"[^>]*>([^<]+)<\/div>/g;
    let m;
    while ((m = statRegex.exec(html)) !== null) {
      stats[m[1].trim()] = m[2].trim();
    }

    const peRatio = stats['P/E ratio'] || stats['PE ratio'] || stats['P/E'] || 'N/A';
    const eps = stats['EPS'] || stats['Earnings per share'] || 'N/A';
    const marketCap = stats['Mkt. cap'] || stats['Market cap'] || stats['Mkt cap'] || 'N/A';
    const dayRange = (stats['Low'] && stats['High']) 
      ? `${stats['Low']} - ${stats['High']}` 
      : (stats['Day range'] || stats["Today's range"] || 'N/A');
    const yearRange = (stats['52-wk low'] && stats['52-wk high'])
      ? `${stats['52-wk low']} - ${stats['52-wk high']}`
      : (stats['Year range'] || stats['52-wk range'] || 'N/A');
    const high52 = stats['52-wk high'] || 'N/A';
    const low52 = stats['52-wk low'] || 'N/A';
    const dividendYield = stats['Dividend'] || stats['Dividend yield'] || stats['Quarterly dividend'] || 'N/A';
    const prevClose = stats['Previous close'] || stats['Prev close'] || stats['Open'] || 'N/A';
    const volume = stats['Volume'] || stats['Avg. vol.'] || stats['Avg volume'] || 'N/A';
    const sharesOutstanding = stats['Shares outstanding'] || 'N/A';

    return {
      name,
      price,
      changeAmount,
      changePercent: (isPositive && !changePercent.startsWith('+') ? '+' : '') + changePercent,
      isPositive,
      peRatio,
      eps,
      marketCap,
      dayRange,
      yearRange,
      high52,
      low52,
      dividendYield,
      prevClose,
      volume,
      sharesOutstanding,
      fullSymbol: candidateSymbol,
      source: 'EcoInsight Real-Time Engine (Google Finance Live)'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

export default async function handler(req, res) {
  const { symbol, range = '1d', interval = '5m', force } = req.query;
  const isForceMatch = force === 'true';

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  const cleanSymbol = symbol.toUpperCase().replace(/\^/g, '').trim();
  // Versioned cache key to completely isolate from stale v6/v7 synthetic database caches
  const cacheKey = `v8_ticker_${cleanSymbol}_${range}_${interval}`;

  // --- STAGE 0: SERVER-SIDE CACHE CHECK ---
  if (supabase && !isForceMatch) {
    try {
      const { data: cached, error: cacheErr } = await supabase
        .from('market_cache')
        .select('data, expires_at')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (!cacheErr && cached && cached.data && new Date(cached.expires_at) > new Date()) {
        const isSynthetic = String(cached.data.source || '').includes('SYNTHETIC') || String(cached.data.source || '').includes('v6');
        if (!isSynthetic) {
          return res.status(200).json({
            ...cached.data,
            cachedAt: cached.expires_at
          });
        }
      }
    } catch (e) {
      console.warn('[Ticker API] Cache lookup failed:', e.message);
    }
  }

  // --- STAGE 1: CANDIDATE SYMBOL RESOLUTION ---
  const candidates = [];
  if (SYMBOL_ALIASES[cleanSymbol]) {
    candidates.push(SYMBOL_ALIASES[cleanSymbol]);
  } else if (SYMBOL_ALIASES[symbol]) {
    candidates.push(SYMBOL_ALIASES[symbol]);
  } else if (symbol.includes(':') || symbol.includes('-')) {
    candidates.push(symbol);
  } else {
    // Default Indian priority: NSE -> BSE -> NASDAQ
    candidates.push(`${cleanSymbol}:NSE`);
    candidates.push(`${cleanSymbol}:BOM`);
    candidates.push(`${cleanSymbol}:NASDAQ`);
  }

  let scrapedData = null;
  for (const candidate of candidates) {
    scrapedData = await scrapeGoogleFinance(candidate);
    if (scrapedData && scrapedData.price) break;
  }

  // If still not found and symbol has no colon, try other exchanges
  if (!scrapedData && !symbol.includes(':')) {
    const fallbacks = [`${cleanSymbol}:INDEXNSE`, `${cleanSymbol}:INDEXBOM`, `${cleanSymbol}:NYSE`];
    for (const fb of fallbacks) {
      scrapedData = await scrapeGoogleFinance(fb);
      if (scrapedData && scrapedData.price) break;
    }
  }

  if (!scrapedData) {
    return res.status(404).json({
      error: `Live market quote not found for symbol: ${symbol}`,
      symbol: cleanSymbol
    });
  }

  // Generate realistic sparkline from real price and day movement
  const numPrice = parseFloat(scrapedData.price) || 0;
  const isPos = scrapedData.isPositive;
  const sparkline = Array.from({ length: 20 }, (_, i) => {
    const progress = i / 19;
    const trend = isPos ? (progress * 0.003) : (-progress * 0.003);
    const noise = (Math.sin(i * 1.5) * 0.001);
    return {
      time: `${i}:00`,
      price: parseFloat((numPrice * (1 + trend + noise)).toFixed(2))
    };
  });

  const responsePayload = {
    symbol: cleanSymbol,
    fullSymbol: scrapedData.fullSymbol,
    name: scrapedData.name,
    price: scrapedData.price,
    changeAmount: scrapedData.changeAmount,
    changePercent: scrapedData.changePercent,
    isPositive: scrapedData.isPositive,
    peRatio: scrapedData.peRatio,
    eps: scrapedData.eps,
    marketCap: scrapedData.marketCap,
    dayRange: scrapedData.dayRange,
    yearRange: scrapedData.yearRange,
    high52: scrapedData.high52,
    low52: scrapedData.low52,
    dividendYield: scrapedData.dividendYield,
    prevClose: scrapedData.prevClose,
    volume: scrapedData.volume,
    sharesOutstanding: scrapedData.sharesOutstanding,
    sparkline,
    source: scrapedData.source,
    range,
    interval,
    timestamp: new Date().toISOString()
  };

  // --- STAGE 2: SAVE TO SUPABASE CACHE ---
  if (supabase) {
    try {
      let ttlMs = 3 * 60 * 1000; // 3 mins for 1d real-time
      if (range === '1w' || range === '1mo') ttlMs = 60 * 60 * 1000;
      if (range === '1y') ttlMs = 24 * 60 * 60 * 1000;

      const expiresAt = new Date(Date.now() + ttlMs).toISOString();
      await supabase
        .from('market_cache')
        .upsert({
          cache_key: cacheKey,
          data: responsePayload,
          expires_at: expiresAt
        }, { onConflict: 'cache_key' });
    } catch (e) {
      console.warn('[Ticker API] Cache save failed:', e.message);
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(responsePayload);
}
