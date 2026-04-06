import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  // Handle Common Symbol Mapping (Yahoo -> Google)
  let gSymbol = symbol;
  if (symbol === '^NSEI') gSymbol = 'NIFTY_50:INDEXNSE';
  else if (symbol === '^BSESN') gSymbol = 'SENSEX:INDEXBOM';
  else if (symbol === '^GSPC') gSymbol = '.INX:INDEXSP';
  else if (symbol === '^IXIC') gSymbol = '.IXIC:INDEXNASDAQ';
  else if (symbol === 'INR=X') gSymbol = 'USD-INR';

  const targetUrl = `https://www.google.com/finance/quote/${encodeURIComponent(gSymbol)}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Google returned ${response.status}`);
    }

    const html = await response.text();

    // 1. Scrape Current Price
    // Pattern: data-last-price="123.45" OR a specific span class
    const priceMatch = html.match(/data-last-price="([^"]+)"/) || html.match(/class="YMl7H"[^>]*>([^<]+)/);
    let price = priceMatch ? priceMatch[1] : 'N/A';

    // 2. Scrape Percentage Change
    // Pattern: class="N87Y7e" (Google's change class)
    const changeMatch = html.match(/"percentageChange":([-0-9.]+)/);
    let changePercent = changeMatch ? changeMatch[1] : '0.00';

    // 3. Scrape Full Name
    const nameMatch = html.match(/class="zzDe6b">([^<]+)/);
    let name = nameMatch ? nameMatch[1] : gSymbol.split(':')[0];

    // 4. Scrape Day High/Low & Volume (if available in HTML)
    // Google uses specific labels for these
    const volumeMatch = html.match(/Volume<\/div><div[^>]*>([^<]+)/);
    let volume = volumeMatch ? volumeMatch[1] : 'N/A';

    // 5. Generate Sparkline Mock-up (Since HTML scraping only gives current state)
    // We'll create a simple 'trending' sparkline based on current change
    const basePrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const sparkline = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}:00`,
      price: basePrice - (Math.random() * (basePrice * 0.005)) + (i * (basePrice * 0.0002) * (parseFloat(changePercent) >= 0 ? 1 : -1))
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      symbol: symbol.replace('^', ''),
      fullSymbol: symbol,
      name,
      price,
      changePercent,
      isPositive: parseFloat(changePercent) >= 0,
      sparkline,
      volume,
      dayHigh: 'N/A', // Scraped separately if needed
      dayLow: 'N/A'
    });
  } catch (error) {
    console.error('Scraper Exception:', error);
    res.status(500).json({ error: 'Scraper failed', message: error.message });
  }
}
