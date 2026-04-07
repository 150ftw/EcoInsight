import fetch from 'node-fetch';

/**
 * Web Search Proxy for EcoInsight
 * Uses DuckDuckGo HTML Lite with robust headers and error handling.
 */

export default async function handler(req, res) {
  const { q } = req.query;
  let { type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Auto-detect type if not provided
  if (!type) {
    if (q.includes('stock symbol') || q.includes('NSE') || q.includes('BSE') || q.length <= 6) {
      type = 'ticker';
    } else {
      type = 'news';
    }
  }

  try {
    // STRATEGY 1: TICKER SEARCH (Yahoo Finance API)
    if (type === 'ticker') {
      const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`;
      const response = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const results = (data.quotes || []).map(q => ({
          title: `${q.longname || q.shortname || q.symbol} (${q.symbol})`,
          url: `https://www.google.com/finance/quote/${q.symbol.replace('.', ':')}`,
          symbol: q.symbol,
          exch: q.exchDisp || 'NSE',
          type: q.quoteType
        })).filter(r => r.type === 'EQUITY' || r.symbol.includes('.NS') || r.symbol.includes('.BO'));
        
        if (results.length > 0) {
          return res.status(200).json({ query: q, results, source: 'Yahoo Finance' });
        }
      }
    }

    // STRATEGY 2: LOCALIZED NEWS (The Economic Times - Strictly India)
    if (type === 'news') {
      // Use Markets feed (has data) but with strict filtering
      const rssUrl = encodeURIComponent('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms');
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
      
      if (response.ok) {
        const data = await response.json();
        // Expanded list of Indian context keywords
        const indianKeywords = ['india', 'nse', 'bse', 'sebi', 'nifty', 'sensex', 'inr', 'rs.', 'crore', 'lakh', 'it stocks', 'bank', 'tata', 'reliance', 'hdfc', 'infosys', 'adani', 'dalal street', 'mumbai', 'domestic', 'rbi', 'pvt', 'ltd'];
        const globalFilters = ['us stocks', 'nasdaq', 'wall street', 's&p 500', 'london', 'uk stocks', 'trump', 'medicare', 'eu stocks', 'nikkei', 'hang seng', 'goldman sachs fund sells cello world']; // Cello World is Indian, keep it

        const results = (data.items || [])
          .map(item => ({
            title: item.title,
            url: item.link,
            source: 'Economic Times',
            date: item.pubDate,
            snippet: item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 100) : ''
          }))
          .filter(item => {
            const lowTitle = item.title.toLowerCase();
            const lowSnippet = item.snippet.toLowerCase();
            
            // Check for explicit local noise (sometimes feeds have junk)
            if (lowTitle.includes('ad clicks') || lowTitle.includes('privacy protected')) return false;

            // Check for Indian relevance (broad)
            const hasIndianContext = indianKeywords.some(key => lowTitle.includes(key) || lowSnippet.includes(key));
            
            // Explicit global filters (e.g. "US stocks")
            const isGlobalNoise = ['us stocks', 'nyse', 'nasdaq', 'wall street', 'medicare', 'trump'].some(key => lowTitle.includes(key));

            // Logic: Must have Indian context AND shouldn't be purely global noise
            // Exception: If it has global noise but ALSO mentions India/NSE/BSE, keep it (macro impacts)
            const isStrictlyGlobal = isGlobalNoise && !lowTitle.includes('india') && !lowTitle.includes('nse') && !lowTitle.includes('nifty');

            return hasIndianContext && !isStrictlyGlobal;
          });
        
        return res.status(200).json({ query: q, results: results.slice(0, 10), source: 'RSS Aggregator' });
      }
    }

    // FINAL FALLBACK: Popular Indian Assets (Always return something)
    const popular = [
      { title: 'Reliance Industries (RELIANCE:NSE)', symbol: 'RELIANCE:NSE', exch: 'NSE' },
      { title: 'Tata Consultancy Services (TCS:NSE)', symbol: 'TCS:NSE', exch: 'NSE' },
      { title: 'HDFC Bank (HDFCBANK:NSE)', symbol: 'HDFCBANK:NSE', exch: 'NSE' },
      { title: 'Infosys Ltd (INFY:NSE)', symbol: 'INFY:NSE', exch: 'NSE' },
      { title: 'Nifty 50 Index (^NSEI)', symbol: '^NSEI', exch: 'NSE' }
    ].filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || q.length < 3);

    return res.status(200).json({ 
       query: q, 
       results: popular, 
       source: 'Internal intelligence' 
    });

  } catch (error) {
    console.error('WebSearch Error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}
