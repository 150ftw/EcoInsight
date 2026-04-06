import fetch from 'node-fetch';

/**
 * Web Search Proxy for EcoInsight
 * Uses DuckDuckGo HTML Lite with robust headers and error handling.
 */

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;

  try {
    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://duckduckgo.com/',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      // Handle rate limits or bot detection
      if (response.status === 403 || response.status === 429) {
         return res.status(response.status).json({
            error: 'Upstream Search Blocked',
            message: 'Search provider detected automated traffic. Please try again in a few minutes.',
            results: []
         });
      }
      throw new Error(`Upstream Error: ${response.status}`);
    }

    const html = await response.text();

    // Check for "Bots use DuckDuckGo too" (CAPTCHA)
    if (html.includes('anomaly-modal') || html.includes('Bots use DuckDuckGo too')) {
       return res.status(200).json({
          error: 'Anomaly Detected',
          message: 'Upstream search is temporarily restricted. Falling back to internal intelligence.',
          results: [],
          is_blocked: true
       });
    }

    // Extraction logic for DuckDuckGo HTML results
    const results = [];
    // Result blocks usually look like: <div class="result results_links results_links_deep web-result ">
    const resultBlocks = html.match(/<div class="[^"]*web-result[\s\S]*?<\/div>[\s\S]*?<\/div>/g) || [];

    for (const block of resultBlocks) {
      const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const linkMatch = block.match(/class="result__url"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (titleMatch && linkMatch) {
         results.push({
           title: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
           url: linkMatch[1].replace(/<[^>]+>/g, '').trim(),
           snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : ''
         });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      query: q, 
      results: results.slice(0, 5), // Return top 5 results
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WebSearch Error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
}
