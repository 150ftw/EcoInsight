import fetch from 'node-fetch';

/**
 * Robust Regex-based DuckDuckGo Lite Parser
 */
const parseDDGResults = (html) => {
  const results = [];
  // Regex to find each result block
  const resultBlockRegex = /<div class="result__body">([\s\S]*?)<\/div>[\s\S]*?<\/div>/g;
  const titleLinkRegex = /<a class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/;
  const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/;

  let match;
  while ((match = resultBlockRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = titleLinkRegex.exec(block);
    const snippetMatch = snippetRegex.exec(block);

    if (titleMatch) {
      let url = titleMatch[1];
      // DDG Lite URLs are often prefixed with /l/?kh=-1&uddg=
      if (url.includes('uddg=')) {
        url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
      }

      results.push({
        title: titleMatch[2].replace(/<[^>]+>/g, '').trim(),
        url: url,
        snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        source: new URL(url).hostname.replace('www.', '')
      });
    }
    if (results.length >= 8) break;
  }
  return results;
};

export default async function handler(req, res) {
  const { q } = req.query;
  let { type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    // STRATEGY 1: TICKER DISCO (Yahoo Finance)
    if (type === 'ticker') {
      const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`;
      const response = await fetch(yahooUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
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
          return res.status(200).json({ query: q, results, source: 'Yahoo Finance Intelligence' });
        }
      }
    }

    // STRATEGY 2: ACTIVE DYNAMIC SEARCH (DuckDuckGo Lite)
    // This solves the "Static Sources" issue by searching the live web for the actual query
    const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const ddgRes = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9'
      }
    });

    if (ddgRes.ok) {
      const html = await ddgRes.text();
      const results = parseDDGResults(html);

      if (results.length > 0) {
        return res.status(200).json({ 
          query: q, 
          results, 
          source: 'Live Intelligence (DDG)',
          freshness: new Date().toISOString()
        });
      }
    }

    // FALLBACK: RSS Feed from Economic Times (only if active search fails)
    const rssUrl = encodeURIComponent('https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms');
    const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
    
    if (rssRes.ok) {
      const data = await rssRes.json();
      const results = (data.items || []).slice(0, 5).map(item => ({
        title: item.title,
        url: item.link,
        source: 'Economic Times (Legacy Fallback)',
        snippet: item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 150) : ''
      }));
      
      return res.status(200).json({ query: q, results, source: 'Economic Times Archive' });
    }

    // LAST RESORT: Internal Reference
    return res.status(200).json({ 
       query: q, 
       results: [
         { title: 'Indian Market Overview', url: 'https://www.nseindia.com', source: 'NSE India', snippet: 'Real-time data for Indian equities and derivatives.' }
       ], 
       source: 'Internal Knowledge' 
    });

  } catch (error) {
    console.error('WebSearch Core Error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}

