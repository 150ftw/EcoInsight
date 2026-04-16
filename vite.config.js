import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle Vercel serverless functions locally
function apiServerPlugin(env) {
  return {
    name: 'api-server-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }


        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.pathname.slice(5); // Remove /api/
        const possibleFiles = [
          `api/${filePath}.js`,
          `api/${filePath}/index.js`,
          `api/${filePath}.ts`
        ];

        let foundFile = null;
        let queryParams = Object.fromEntries(url.searchParams);
        
        const fs = await import('fs');
        const path = await import('path');

        for (const file of possibleFiles) {
          if (fs.existsSync(path.resolve(process.cwd(), file))) {
            foundFile = path.resolve(process.cwd(), file);
            break;
          }
        }

        // --- END API DISCOVERY ---

        if (!foundFile) {
          console.warn(`[API Proxy] No file found for ${req.url}`);
          return next();
        }

        try {
          // Ensure process.env is populated for the handler and its imports
          Object.assign(process.env, env);

          // Mock the Vercel req/res objects
          const bodyPromise = new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                resolve({});
              }
            });
          });

          const body = await bodyPromise;
          const mockReq = Object.assign(req, {
            body,
            query: queryParams,
            cookies: {} 
          });

          const mockRes = Object.assign(res, {
            status(code) {
              this.statusCode = code;
              return this;
            },
            json(data) {
              this.setHeader('Content-Type', 'application/json');
              this.end(JSON.stringify(data));
              return this;
            },
            send(data) {
              this.end(data);
              return this;
            },
            redirect(statusOrUrl, url) {
              if (typeof statusOrUrl === 'string') {
                this.status(307).setHeader('Location', statusOrUrl).end();
              } else {
                this.status(statusOrUrl).setHeader('Location', url).end();
              }
              return this;
            }
          });

          // Optional: if you need setHeader to be chainable
          const originalSetHeader = res.setHeader;
          res.setHeader = function(name, value) {
            originalSetHeader.apply(this, arguments);
            return this;
          };

          // Dynamic import for the handler
          const module = await server.ssrLoadModule(foundFile);
          if (module.default) {
            await module.default(mockReq, mockRes);
          } else {
            throw new Error(`No default export found in ${foundFile}`);
          }
        } catch (error) {
          console.error(`[API Proxy Error] ${req.url}:`, error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'External API Error', message: error.message }));
        }
      });
    },
  };
}

// ... existing webSearchPlugin definition ...

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), apiServerPlugin(env)],
    server: {
      proxy: {
        '/v1': {
          target: 'https://integrate.api.nvidia.com',
          changeOrigin: true,
          secure: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
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
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Strip ALL headers to avoid Yahoo 429
              Object.keys(req.headers).forEach(h => proxyReq.removeHeader(h));
              
              // Set bare minimum headers for Yahoo
              proxyReq.setHeader('Host', 'query1.finance.yahoo.com');
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
              proxyReq.setHeader('Origin', 'https://finance.yahoo.com');
              proxyReq.setHeader('Referer', 'https://finance.yahoo.com');
            });
          },
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
  }
})