import { Resend } from 'resend';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  console.log(`[API Send Welcome] Processing request for email: ${email}`);

  // Use the API key from environment variables (server-side)
  // Support both common names
  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[API Send Welcome] Missing Resend API Key. Keys found:', Object.keys(process.env).filter(k => k.includes('KEY')));
    return res.status(500).json({ status: 'error', message: 'Missing API Key on server' });
  }

  const resend = new Resend(apiKey);

  const templateHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; }
        .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; color: #8b5cf6; text-decoration: none; letter-spacing: -0.025em; }
        .hero { margin-bottom: 30px; }
        .title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 15px; }
        .text { font-size: 16px; color: #374151; margin-bottom: 20px; }
        .feature-grid { background: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 30px; }
        .feature-title { font-weight: 700; color: #111827; margin-bottom: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .cta-button { display: inline-block; background-color: #8b5cf6; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #6b7280; }
        .founder-name { font-weight: 800; color: #111827; }
        @media (prefers-color-scheme: dark) {
          body { background-color: #030712; color: #f9fafb; }
          .container { background-color: #030712; }
          .title { color: #f9fafb; }
          .text { color: #d1d5db; }
          .feature-grid { background: #111827; }
          .feature-title { color: #f9fafb; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://ecoinsight.online" class="logo">ECOINSIGHT</a>
        </div>
        <div class="hero">
          <p class="text">Hey ${name || 'Valued Analyst'},</p>
          <div class="title">I’m Shivam Sharma — the founder of EcoInsight.</div>
          <p class="text">
            I started EcoInsight because I believe <strong>economic intelligence shouldn’t be gated behind complexity</strong>. 
            Whether you're tracking Nifty trends or decoded RBI policy, you deserve direct access to the truth.
          </p>
          <p class="text">We’ve built this engine to make sophisticated economic insights <strong>simple, accessible, and actionable</strong> for everyone.</p>
        </div>
        
        <div class="feature-grid">
          <div class="feature-title">Next Steps for Your Analysis</div>
          <p class="text" style="font-size: 15px; margin-bottom: 10px;">
            1. <strong>Synchronize with Markets</strong>: Check the live dashboard for real-time volatility tracking.<br/>
            2. <strong>Search the Intelligence Feed</strong>: Ask our AI about specific sectors or global macroeconomic shifts.<br/>
            3. <strong>Define your Watchlist</strong>: Customize your alerts for the assets that matter to your portfolio.
          </p>
          <a href="https://ecoinsight.online" class="cta-button">Launch intelligence Engine</a>
        </div>

        <p class="text">
          I’m curious — what specific part of the economy are you most interested in right now? 
          Just hit <strong>Reply</strong> and let me know. I personally read every response.
        </p>

        <div class="footer">
          <p>
            Best Regards,<br/>
            <span class="founder-name">Shivam Sharma</span><br/>
            Founder, EcoInsight
          </p>
          <p style="font-size: 12px;">© 2026 EcoInsight Economic Intelligence. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Attempt primary send from verified domain via SDK
    const { data, error } = await resend.emails.send({
      from: 'Shivam from EcoInsight <shivam@ecoinsight.online>',
      to: [email],
      replyTo: 'ss18244646@gmail.com',
      subject: 'Welcome to EcoInsight — Your Market Intelligence Partner',
      html: templateHtml,
      tags: [{ name: 'template', value: 'founder-welcome-introduction' }]
    });

    if (error) {
      console.warn('[API Send Welcome] Primary send failed:', error);
      
      // Fallback to resend.dev if domain is unverified
      if (error.message?.includes('unverified') || error.name === 'validation_error') {
        const fallback = await resend.emails.send({
          from: 'EcoInsight <onboarding@resend.dev>',
          to: [email],
          subject: 'Welcome to EcoInsight — Your Market Intelligence Partner',
          html: templateHtml
        });
        
        if (fallback.error) {
           return res.status(400).json(fallback.error);
        }
        return res.status(200).json(fallback.data);
      }
      return res.status(400).json(error);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('[API Send Welcome] Internal Error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
