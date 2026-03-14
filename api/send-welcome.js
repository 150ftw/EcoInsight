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

  const apiKey = process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.error('[API Send Welcome] Missing Resend API Key');
    return res.status(500).json({ status: 'error', message: 'Missing API Key on server' });
  }

  const resend = new Resend(apiKey);

  const templateHtml = `
    <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6; color: #333;">
      <p>Hey ${name || 'Valued Analyst'},</p>
      <p>I’m <strong>Shivam Sharma</strong> — the founder of <strong>EcoInsight</strong>.</p>
      <p>I started EcoInsight because I believe <strong>economic knowledge shouldn’t be complicated or hidden behind complex reports</strong>. Anyone interested in markets, policy, or global trends should be able to understand what’s happening in the economy.</p>
      <p>So we built EcoInsight to make <strong>economic insights simple, accessible, and useful</strong>.</p>
      <p>Here are 3 things you can do to get started:</p>
      <ol>
        <li><strong>Explore the latest insights</strong><br/><a href="https://ecoinsight.online" style="color: #6d28d9; font-weight: bold;">https://ecoinsight.online</a></li>
        <br/>
        <li><strong>Check out current economic trends</strong><br/>Discover updates on markets, policies, and global developments.</li>
        <br/>
        <li><strong>Start learning something new today</strong><br/>Dive into data, analysis, and insights that matter.</li>
      </ol>
      <p>P.S. — I’m curious, what made you sign up for EcoInsight?</p>
      <p>Just hit <strong>Reply</strong> and let me know. I personally read every email.</p>
      <p>Best,<br/><strong>Shivam Sharma</strong><br/>Founder, EcoInsight<br/><a href="https://ecoinsight.online" style="color: #6d28d9;">https://ecoinsight.online</a></p>
    </div>
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
