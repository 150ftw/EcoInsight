// Vercel Serverless Function: Web Search Proxy
// Scrapes DuckDuckGo HTML search results for real-time information
// No API key required, no rate limits

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        // Fetch DuckDuckGo HTML search results
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`DuckDuckGo returned ${response.status}`);
        }

        const html = await response.text();

        // Parse search results from DuckDuckGo HTML
        const results = [];

        // DuckDuckGo HTML format: results are in <div class="result"> blocks
        // Each result has:
        //   - Title in <a class="result__a"> 
        //   - Snippet in <a class="result__snippet">
        //   - URL in <a class="result__url">

        // Extract result blocks
        const resultBlocks = html.split(/class="result\s/g).slice(1); // Skip the first split (before first result)

        for (const block of resultBlocks.slice(0, 8)) {
            try {
                // Extract title
                const titleMatch = block.match(/class="result__a"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/a>/);
                let title = '';
                if (titleMatch) {
                    title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
                }

                // Extract snippet
                const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
                let snippet = '';
                if (snippetMatch) {
                    snippet = snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                }

                // Extract URL
                const urlMatch = block.match(/class="result__url"[^>]*>([^<]+)/);
                let url = '';
                if (urlMatch) {
                    url = urlMatch[1].trim();
                }

                // Also try to extract the actual href URL
                const hrefMatch = block.match(/class="result__a"\s+href="([^"]+)"/);
                let href = '';
                if (hrefMatch) {
                    href = hrefMatch[1];
                    // DuckDuckGo wraps URLs in a redirect, extract the actual URL
                    const uddgMatch = href.match(/uddg=([^&]+)/);
                    if (uddgMatch) {
                        href = decodeURIComponent(uddgMatch[1]);
                    }
                }

                if (title && snippet) {
                    results.push({
                        title,
                        snippet,
                        url: href || url,
                        source: url,
                    });
                }
            } catch (parseError) {
                // Skip malformed results
                continue;
            }
        }

        // Set cache headers (cache for 5 minutes to reduce load)
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

        return res.status(200).json({
            query: q,
            results,
            resultCount: results.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Web search error:', error);
        return res.status(500).json({
            error: 'Search failed',
            message: error.message,
        });
    }
}
