import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { path } = req.query;
  
  if (!path) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  // Define the target Yahoo Finance URL
  const targetUrl = `https://query1.finance.yahoo.com/${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://finance.yahoo.com',
        'Referer': 'https://finance.yahoo.com',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yahoo Proxy Error (${response.status}):`, errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    
    // Add CORS headers for local development if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (error) {
    console.error('Yahoo Proxy Exception:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}
