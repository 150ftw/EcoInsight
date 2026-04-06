import fetch from 'node-fetch';

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
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Symbol Mapping for Better Search Queries
  const queryMap = {
    '^NSEI': 'Nifty 50 index price',
    '^BSESN': 'Sensex index price',
    '^GSPC': 'S&P 500 index price',
    '^IXIC': 'Nasdaq 100 index price',
    'INR=X': 'USD/INR exchange rate',
    'AAPL:NASDAQ': 'Apple stock price',
    'NVDA:NASDAQ': 'NVIDIA stock price',
    'TSLA:NASDAQ': 'Tesla stock price',
    'MSFT:NASDAQ': 'Microsoft stock price'
  };

  const cleanSymbol = symbol.replace('^', '');
  const searchQuery = queryMap[symbol] || `${symbol} stock price`;
  
  let price = '---';
  let changePercent = '0.00';
  let source = 'NONE';
  let name = cleanSymbol.split(':')[0];

  try {
    // --- STAGE 1: GOOGLE SEARCH TITLE/SNIPPET SCRAPER ---
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    const googleRes = await fetch(googleUrl, { headers: HUMAN_HEADERS });
    
    if (googleRes.ok) {
      const html = await googleRes.text();
      // Google search titles often include the price: "Nifty 50 (NI50) 22,644.20 - Google Search"
      // or "Apple Inc (AAPL) 255.92 - Google Search"
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) {
        const titleText = titleMatch[1];
        // Regex for Price like 22,644.20 or 255.92 or 1.05
        const pMatch = titleText.match(/([\d,]+\.\d{2})/);
        if (pMatch) {
          price = pMatch[1].replace(/,/g, '');
          source = 'SEARCH-SYNC v6 (GOOGLE)';
          
          // Try to extract change percent if present in title/snippet
          const cMatch = html.match(/([-+]?[\d.]+)%/);
          if (cMatch) {
            changePercent = cMatch[1];
          }
        }
      }
    }

    // --- STAGE 2: YAHOO CHART API FALLBACK (Bypass 429) ---
    if (price === '---') {
      const yahooSymbol = symbol.includes(':') ? symbol.split(':')[0] : symbol;
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=5m`;
      
      const yahooRes = await fetch(yahooUrl, { headers: HUMAN_HEADERS });
      if (yahooRes.ok) {
        const data = await yahooRes.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          price = meta.regularMarketPrice.toFixed(2);
          const prevClose = meta.previousClose || meta.chartPreviousClose;
          if (prevClose) {
            const diff = meta.regularMarketPrice - prevClose;
            changePercent = ((diff / prevClose) * 100).toFixed(2);
          }
          source = 'SEARCH-SYNC v6 (YAHOO)';
        }
      }
    }

    // --- STAGE 3: CLOUD FALLBACK (Synthetic Drift) ---
    if (price === '---') {
      // Mock data based on last known stable points for UI continuity
      const basePrices = {
        'NSEI': 22500, 'BSESN': 74000, 'GSPC': 5200, 'IXIC': 16000,
        'AAPL': 180, 'NVDA': 900, 'TSLA': 175, 'MSFT': 420
      };
      const base = basePrices[cleanSymbol] || 100;
      price = (base + (Math.random() * base * 0.01) - (base * 0.005)).toFixed(2);
      changePercent = ((Math.random() * 2) - 1).toFixed(2);
      source = 'SEARCH-SYNC v6 (SYNTHETIC)';
    }

    const numericPrice = parseFloat(price) || 0;
    const isPositive = parseFloat(changePercent) >= 0;

    // Sparkline Generation for UI
    const sparkline = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      price: numericPrice > 0 ? numericPrice - (Math.random() * (numericPrice * 0.002)) + (i * (numericPrice * 0.0001) * (isPositive ? 1 : -1)) : 0
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      symbol: cleanSymbol,
      fullSymbol: symbol,
      name,
      price,
      changePercent: (isPositive ? '+' : '') + changePercent + '%',
      isPositive,
      sparkline,
      source,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search-Sync v6 Exception:', error);
    res.status(500).json({ error: 'Search Sync failed', message: error.message });
  }
}
