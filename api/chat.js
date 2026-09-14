import fetch from 'node-fetch';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const SKIP_RESPONSE_HEADERS = new Set(['content-encoding', 'content-length', 'connection']);

/**
 * Server-side proxy for NVIDIA chat completions.
 * Keeps the NVIDIA API key out of the client bundle; streams the upstream
 * response straight through so the existing SSE client code keeps working.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error('[Chat Proxy] CRITICAL ERROR: NVIDIA_API_KEY is not configured.');
    return res.status(500).json({ error: { message: 'AI provider is not configured on the server' } });
  }

  const { model, messages, temperature, top_p, max_tokens, reasoning_effort, stream } = req.body || {};
  if (!messages) {
    return res.status(400).json({ error: { message: 'messages is required' } });
  }

  try {
    const upstream = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-oss-20b',
        messages,
        temperature: temperature ?? 0.5,
        top_p: top_p ?? 1,
        max_tokens: max_tokens || 1024,
        reasoning_effort: reasoning_effort || 'low',
        stream: stream !== false
      })
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    if (!upstream.body) {
      const text = await upstream.text();
      return res.send(text);
    }

    upstream.body.pipe(res);
  } catch (err) {
    console.error('[Chat Proxy] Upstream request failed:', err.message);
    return res.status(502).json({ error: { message: 'Failed to reach AI provider' } });
  }
}
