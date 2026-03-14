/**
 * EmailService.js - Utility for sending automated emails to EcoInsight users.
 * 
 * - **Founder's Welcome Email**: Implemented the personalized template from Shivam Sharma. New users receive a "direct" note from the founder upon signup.
 * - **Template Identification**: Labeled the automated emails with the specific template identifier `founder-welcome-introduction` for tracking in the Resend dashboard.
 * - **Direct Reply-to**: Configured the email to route replies straight to `ss18244646@gmail.com`, enabling personal engagement with new analysts.
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
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        from: 'Shivam from EcoInsight <shivam@ecoinsight.online>',
                        to: userEmail,
                        reply_to: 'ss18244646@gmail.com',
                        subject: emailContent.subject,
                        html: emailContent.html,
                        tags: [
                            {
                                name: 'template',
                                value: 'founder-welcome-introduction'
                            }
                        ]
                    })
                });

                if (response.ok) {
                    console.log('--- WELCOME EMAIL SENT (RESEND: founder-welcome-introduction) ---');
                    return { success: true, message: 'Welcome email sent (Template: founder-welcome-introduction)' };
                } else {
                    const errorData = await response.json();
                    console.error('[EmailService] Resend API error:', JSON.stringify(errorData, null, 2));
                    
                    // Specific check for unverified domain
                    if (errorData.message?.includes('unverified') || errorData.name === 'validation_error') {
                        console.warn('[EmailService] Domain ecoinsight.online may not be verified. Trying again with onboarding@resend.dev...');
                        
                        const fallbackResponse = await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify({
                                from: 'EcoInsight <onboarding@resend.dev>',
                                to: userEmail,
                                subject: emailContent.subject,
                                html: emailContent.html
                            })
                        });
                        
                        if (fallbackResponse.ok) {
                            console.log('--- WELCOME EMAIL SENT (RESEND FALLBACK) ---');
                            return { success: true, message: 'Welcome email sent via Resend (onboarding fallback)' };
                        } else {
                            const fallbackError = await fallbackResponse.json();
                            console.error('[EmailService] Resend Fallback failed:', fallbackError);
                        }
                    }
                }
            } catch (fetchError) {
                console.error('[EmailService] Network error during Resend call:', fetchError);
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
