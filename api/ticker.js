import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Symbol Mapping for Better Search Queries
  const queryMap = {
    '^NSEI': 'Nifty 50 index price google finance',
    '^BSESN': 'Sensex index price google finance',
    '^GSPC': 'S&P 500 index price google finance',
    '^IXIC': 'Nasdaq 100 index price google finance',
    'INR=X': 'USD/INR exchange rate google finance',
    'AAPL:NASDAQ': 'Apple stock price google finance',
    'NVDA:NASDAQ': 'NVIDIA stock price google finance'
  };

  const searchQuery = queryMap[symbol] || `${symbol} stock price google finance`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Cloud Link Failed: ${response.status}`);
    }

    const html = await response.text();

    // EXTRACTION FROM SEARCH SNIPPETS
    // Google Finance snippets look like: "Nifty 50 (^NSEI) is at 22,644.20 (-0.30%) - Google Finance"
    // or include the price string directly.
    let price = 'N/A';
    let changePercent = '0.00';
    let name = symbol.split(':')[0];

    // Find snippets
    const snippets = html.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g) || [];
    
    for (const s of snippets) {
        const text = s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
        // Regex for Price following Ticker or Currency
        // e.g. "22,644.20", "255.92", "22,644.20 (▼ 0.27%)"
        const pMatch = text.match(/([\d,]+\.\d{2})/);
        if (pMatch && price === 'N/A') {
            price = pMatch[1].replace(/,/g, '');
            
            // Try to find percentage in the same snippet
            const cMatch = text.match(/\(([-▲▼\s]+)?([-0-9.]+)?%\)/);
            if (cMatch) {
                const direction = text.includes('▼') || text.includes('-') ? '-' : '';
                changePercent = direction + (cMatch[2] || '0.00');
            }
            break; // Found primary price
        }
    }

    const numericPrice = parseFloat(price) || 0;
    const isPositive = parseFloat(changePercent) >= 0;

    // Sparkline Simulation (v5)
    const sparkline = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      price: numericPrice > 0 ? numericPrice - (Math.random() * (numericPrice * 0.005)) + (i * (numericPrice * 0.0003) * (isPositive ? 1 : -1)) : 0
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      symbol: symbol.replace('^', ''),
      fullSymbol: symbol,
      name,
      price: numericPrice > 0 ? numericPrice.toFixed(2) : price,
      changePercent,
      isPositive,
      sparkline,
      source: 'SEARCH-SYNC v5'
    });
  } catch (error) {
    console.error('Scraper v5 Exception:', error);
    res.status(500).json({ error: 'Search Sync failed', message: error.message });
  }
}
