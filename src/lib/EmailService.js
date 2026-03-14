/**
 * EmailService.js - Utility for sending automated emails to EcoInsight users.
 * 
 * To activate live emails:
 * 1. Install an email service provider (e.g., npm install @emailjs/browser or resend)
 * 2. Update the sendWelcomeEmail function with your API keys.
 */

export const sendWelcomeEmail = async (userEmail, userName = 'Valued Analyst') => {
    console.log(`[EmailService] Attempting to send welcome email to: ${userEmail}`);

    try {
        // --- MOCK IMPLEMENTATION ---
        // In a real scenario, you would call an API like Resend or EmailJS here.
        
        const emailContent = {
            subject: 'Welcome to EcoInsight — Your Market Intelligence Partner',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6; color: #333;">
                    <p>Hey ${userName},</p>

                    <p>I’m <strong>Shivam Sharma</strong> — the founder of <strong>EcoInsight</strong>.</p>

                    <p>I started EcoInsight because I believe <strong>economic knowledge shouldn’t be complicated or hidden behind complex reports</strong>. Anyone interested in markets, policy, or global trends should be able to understand what’s happening in the economy.</p>

                    <p>So we built EcoInsight to make <strong>economic insights simple, accessible, and useful</strong>.</p>

                    <p>Here are 3 things you can do to get started:</p>

                    <ol>
                        <li><strong>Explore the latest insights</strong><br/>
                        <a href="https://ecoinsight.online">https://ecoinsight.online</a></li>
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
                    <a href="https://ecoinsight.online">https://ecoinsight.online</a></p>
                </div>
            `
        };

        // --- LIVE IMPLEMENTATION ---
        // If VITE_RESEND_API_KEY is present in .env.local, we can use it.
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;

        if (apiKey && apiKey !== 'your_mock_key') {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    from: 'Shivam from EcoInsight <shivam@ecoinsight.online>',
                    to: userEmail,
                    reply_to: 'ss18244646@gmail.com', // Founder's direct email for replies
                    subject: emailContent.subject,
                    html: emailContent.html
                })
            });

            if (response.ok) {
                console.log('--- WELCOME EMAIL SENT (RESEND) ---');
                return { success: true, message: 'Welcome email sent via Resend' };
            } else {
                const errorData = await response.json();
                console.error('[EmailService] Resend API error:', errorData);
            }
        }

        // --- MOCK FALLBACK (If no API key or failed) ---
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('--- WELCOME EMAIL MOCK LOG ---');
        console.log(`To: ${userEmail}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log(`Content Preview: Hey ${userName}, I'm Shivam Sharma...`);
        console.log('-------------------------------');

        return { success: true, message: 'Welcome email logged (Mock Mode)' };

    } catch (error) {
        console.error('[EmailService] Failed to send welcome email:', error);
        return { success: false, error: error.message };
    }
};
