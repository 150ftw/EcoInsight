export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Use the API key from environment variables (server-side)
  // VERCEL provides these to the function
  const apiKey = process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.error('[API Send Welcome] Missing Resend API Key');
    return res.status(500).json({ status: 'error', message: 'Missing API Key on server' });
  }

  const templateHtml = `
    <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6; color: #333;">
                    <p>Hey ${name || 'Valued Analyst'},</p>

                    <p>I’m <strong>Shivam Sharma</strong> — the founder of <strong>EcoInsight</strong>.</p>

                    <p>I started EcoInsight because I believe <strong>economic knowledge shouldn’t be complicated or hidden behind complex reports</strong>. Anyone interested in markets, policy, or global trends should be able to understand what’s happening in the economy.</p>

                    <p>So we built EcoInsight to make <strong>economic insights simple, accessible, and useful</strong>.</p>

                    <p>Here are 3 things you can do to get started:</p>

                    <ol>
                        <li><strong>Explore the latest insights</strong><br/>
                        <a href="https://ecoinsight.online" style="color: #6d28d9; font-weight: bold;">https://ecoinsight.online</a></li>
                        <br/>
                        <li><strong>Check out current economic trends</strong><br/>
                        Discover updates on markets, policies, and global developments.</li>
                        <br/>
                        <li><strong>Start learning something new today</strong><br/>
                        Dive into data, analysis, and insights that matter.</li>
                    </ol>

                    <p>P.S. — I’m curious, what made you sign up for EcoInsight?</p>

                    <p>Just hit <strong>Reply</strong> and let me know. I personally read every email.</p>

                    <p>Best,<br/>
                    <strong>Shivam Sharma</strong><br/>
                    Founder, EcoInsight<br/>
                    <a href="https://ecoinsight.online" style="color: #6d28d9;">https://ecoinsight.online</a></p>
                </div>
  `;

  try {
    // Attempt primary send from verified domain
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Shivam from EcoInsight <shivam@ecoinsight.online>',
        to: email,
        reply_to: 'ss18244646@gmail.com',
        subject: 'Welcome to EcoInsight — Your Market Intelligence Partner',
        html: templateHtml,
        tags: [{ name: 'template', value: 'founder-welcome-introduction' }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[API Send Welcome] Primary send failed:', data);
      
      // Fallback to resend.dev if domain is unverified
      if (data.message?.includes('unverified') || data.name === 'validation_error') {
        const fallbackResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: 'EcoInsight <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to EcoInsight — Your Market Intelligence Partner',
            html: templateHtml
          })
        });
        const fallbackData = await fallbackResponse.json();
        return res.status(fallbackResponse.status).json(fallbackData);
      }
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[API Send Welcome] Internal Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
