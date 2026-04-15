import fetch from 'node-fetch';
import { supabase } from './lib/db.js';

/**
 * Search-Sync v6: Ultra-Resilient Market Data Scraper
 * Author: EcoInsight Engineering
 * Logic: Primary (Google Search Snippet) -> Secondary (Yahoo Chart Proxy) -> Tertiary (Mock Drift)
 */

const HUMAN_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

export default async function handler(req, res) {
  const { symbol, range = '1d', interval = '5m', force } = req.query;
  const isForceMatch = force === 'true';
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  // --- STAGE 0: SERVER-SIDE CACHE CHECK ---
  // Bypass cache if ?force=true is provided to allow fresh scraping during volatility
  if (supabase && !isForceMatch) {
    try {
      const { data: cached, error: cacheErr } = await supabase
        .from('market_cache')
        .select('data, expires_at')
        .eq('cache_key', `ticker_${symbol}`)
        .maybeSingle();

      if (!cacheErr && cached && new Date(cached.expires_at) > new Date()) {
        return res.status(200).json({
          ...cached.data,
          source: 'SERVER-CACHE (Supabase)',
          cachedAt: cached.expires_at
        });
      }
    } catch (e) {
      console.warn('[Ticker API] Cache lookup failed:', e.message);
    }
  }

  // Symbol Mapping for Better Search Queries
  const queryMap = {
    '^NSEI': 'Nifty 50 index price',
    '^BSESN': 'Sensex index price',
    'NIFTYBANK': 'Nifty Bank index price',
    'USDINR': 'USD/INR exchange rate',
    'EURINR': 'EUR/INR exchange rate',
    'RELIANCE:NSE': 'NSE:RELIANCE stock price',
    'TCS:NSE': 'NSE:TCS stock price',
    'HDFCBANK:NSE': 'NSE:HDFCBANK stock price',
    'INFY:NSE': 'NSE:INFY stock price',
    'GC=F': 'Gold price in USD',
    'SI=F': 'Silver price in USD'
  };

  const cleanSymbol = symbol.replace('^', '');
  const searchQuery = queryMap[symbol] || `${symbol} price`;
  
  let price = '---';
  let changePercent = '0.00';
  let source = 'NONE';
  let name = cleanSymbol.split(':')[0];

  try {
    // --- STAGE 1: GOOGLE SEARCH TITLE/SNIPPET SCRAPER ---
    try {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' google finance')}`;
      const googleRes = await fetch(googleUrl, { 
        headers: HUMAN_HEADERS,
        timeout: 5000 // 5s timeout to prevent hanging
      });
      
      if (googleRes.ok) {
        const html = await googleRes.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          const titleText = titleMatch[1];
          const pMatch = titleText.match(/([\d,]+\.\d{2})/);
          if (pMatch) {
            const scrapedPrice = parseFloat(pMatch[1].replace(/,/g, ''));
            
            const basePrices = {
              'NSEI': 22500, 'BSESN': 74000, 'NIFTYBANK': 48000, 
              'USDINR': 83.35, 'EURINR': 90.15,
              'RELIANCE:NSE': 2950, 'TCS:NSE': 3900, 'HDFCBANK:NSE': 1550, 'INFY:NSE': 1480
            };
            const base = basePrices[symbol] || basePrices[cleanSymbol];
            
            if (base && Math.abs(scrapedPrice - base) / base > 0.8) {
              console.log(`Plausibility check failed for ${symbol}: Scraped ${scrapedPrice} vs Base ${base}. Falling back.`);
            } else {
              price = pMatch[1].replace(/,/g, '');
              source = 'SEARCH-SYNC v6 (GOOGLE)';
              
              const cMatch = html.match(/([-+]?[\d.]+)%/);
              if (cMatch) {
                changePercent = cMatch[1];
              }
            }
          }
        }
      }
    } catch (gError) {
      console.warn(`Search-Sync v6 Stage 1 (Google) Error for ${symbol}:`, gError.message);
    }

    // --- STAGE 2: YAHOO CHART API FALLBACK & HISTORICAL DATA ---
    let historyData = null;
    // Always run Stage 2 if we need historical data or a specific range
    if (price === '---' || range !== '1d' || historyData === null) {
      try {
        let yahooSymbol = symbol.includes(':') ? symbol.split(':')[0] : symbol;
        if (symbol.endsWith(':NSE') || symbol.endsWith(':NS')) {
            yahooSymbol = yahooSymbol.replace(':NS', '').replace(':NSE', '') + '.NS';
        }
        if (symbol.endsWith(':BOM') || symbol.endsWith(':BSE') || symbol.endsWith(':BO')) {
            yahooSymbol = yahooSymbol.replace(':BO', '').replace(':BOM', '').replace(':BSE', '') + '.BO';
        }
        
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`;
        
        const yahooRes = await fetch(yahooUrl, { 
          headers: HUMAN_HEADERS,
          timeout: 5000
        });
        
        if (yahooRes.ok) {
          const data = await yahooRes.json();
          const result = data.chart?.result?.[0];
          const meta = result?.meta;
          if (meta && meta.regularMarketPrice) {
            if (price === '---') {
              price = meta.regularMarketPrice.toFixed(2);
              const prevClose = meta.previousClose || meta.chartPreviousClose;
              if (prevClose) {
                const diff = meta.regularMarketPrice - prevClose;
                changePercent = ((diff / prevClose) * 100).toFixed(2);
              }
              source = 'SEARCH-SYNC v6 (YAHOO)';
            }

            // Extract real history for sparkline
            const indicators = result?.indicators?.quote?.[0];
            const timestamps = result?.timestamp;
            if (indicators && (indicators.close || indicators.open) && timestamps) {
              const closes = indicators.close || indicators.open;
              historyData = timestamps.map((t, i) => ({
                time: new Date(t * 1000).toISOString(),
                price: closes[i] ? parseFloat(closes[i].toFixed(2)) : null
              })).filter(pt => pt.price !== null);
            }
          }
        }
      } catch (yError) {
        console.warn(`Search-Sync v6 Stage 2 (Yahoo) Error for ${symbol}:`, yError.message);
      }
    }

    // --- STAGE 3: CLOUD FALLBACK (Synthetic Drift) ---
    if (price === '---') {
      // Mock data based on last known stable points for UI continuity
      const basePrices = {
        'NSEI': 22500, 'BSESN': 74000, 'NIFTYBANK': 48000, 
        'USDINR': 83.35, 'EURINR': 90.15,
        'RELIANCE:NSE': 2950, 'TCS:NSE': 3900, 'HDFCBANK:NSE': 1550, 'INFY:NSE': 1480,
        'IN10Y:INDEXINDEX': 7.12
      };
      const base = basePrices[symbol] || basePrices[cleanSymbol] || 100;
      price = (base + (Math.random() * base * 0.01) - (base * 0.005)).toFixed(2);
      changePercent = ((Math.random() * 2) - 1).toFixed(2);
      source = 'SEARCH-SYNC v6 (SYNTHETIC)';
    }

    const numericPrice = parseFloat(price) || 0;
    const isPositive = parseFloat(changePercent) >= 0;

    // Sparkline Generation for UI
    const sparkline = (historyData && historyData.length > 0) ? historyData : Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      price: numericPrice > 0 ? numericPrice - (Math.random() * (numericPrice * 0.002)) + (i * (numericPrice * 0.0001) * (isPositive ? 1 : -1)) : 0
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    const responsePayload = {
      symbol: cleanSymbol,
      fullSymbol: symbol,
      name,
      price,
      changePercent: (isPositive ? '+' : '') + changePercent + '%',
      isPositive,
      sparkline,
      source,
      timestamp: new Date().toISOString()
    };

    // --- STAGE 5: SAVE TO CACHE ---
    if (supabase && price !== '---' && source !== 'SEARCH-SYNC v6 (SYNTHETIC)') {
      try {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL
        await supabase
          .from('market_cache')
          .upsert({
            cache_key: `ticker_${symbol}`,
            data: responsePayload,
            expires_at: expiresAt
          }, { onConflict: 'cache_key' });
      } catch (e) {
        console.warn('[Ticker API] Cache save failed:', e.message);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Search-Sync v6 Exception:', error);
    res.status(500).json({ error: 'Search Sync failed', message: error.message });
  }
}
