import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle /api/web-search locally (mimics the Vercel serverless function)
function webSearchPlugin() {
  return {
    name: 'web-search-proxy',
    configureServer(server) {
      server.middlewares.use('/api/web-search', async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const query = url.searchParams.get('q');

        if (!query || query.trim().length < 2) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
          return;
        }

        try {
          const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
            },
          });

          if (!response.ok) throw new Error(`DuckDuckGo returned ${response.status}`);
          const html = await response.text();

          const results = [];
          const resultBlocks = html.split(/class="result\s/g).slice(1);

          for (const block of resultBlocks.slice(0, 8)) {
            try {
              const titleMatch = block.match(/class="result__a"[^>]*>([^<]+(?:<[^>]+>[^<]*)*)<\/a>/);
              let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

              const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
              let snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';

              const urlMatch = block.match(/class="result__url"[^>]*>([^<]+)/);
              let sourceUrl = urlMatch ? urlMatch[1].trim() : '';

              const hrefMatch = block.match(/class="result__a"\s+href="([^"]+)"/);
              let href = '';
              if (hrefMatch) {
                href = hrefMatch[1];
                const uddgMatch = href.match(/uddg=([^&]+)/);
                if (uddgMatch) href = decodeURIComponent(uddgMatch[1]);
              }

              if (title && snippet) {
                results.push({ title, snippet, url: href || sourceUrl, source: sourceUrl });
              }
            } catch (e) { continue; }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ query, results, resultCount: results.length, timestamp: new Date().toISOString() }));
        } catch (error) {
          console.error('Web search proxy error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Search failed', message: error.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), webSearchPlugin()],
  server: {
    proxy: {
      '/v1': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err); ß
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/yahoo-finance': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/yahoo-finance/, ''),
      },
      '/google-finance': {
        target: 'https://www.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/google-finance/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      '/exchange-rates': {
        target: 'https://api.exchangerate-api.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/exchange-rates/, ''),
      },
      '/angel-one': {
        target: 'https://www.angelone.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/angel-one/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    }
  }
})