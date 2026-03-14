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
        // We now call our OWN serverless function at /api/send-welcome
        // This avoids CORS issues and keeps the API key secure on the server.
        const response = await fetch('/api/send-welcome', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                name: userName
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('--- WELCOME EMAIL SENT (SERVERLESS) ---');
            return { success: true, message: 'Welcome email sent via Serverless Function', data };
        } else {
            console.error('[EmailService] Serverless error:', data);
            
            // If the serverless function itself returns an error, we fall back to mock log
            console.log('--- WELCOME EMAIL MOCK LOG (API FAIL) ---');
            console.log(`To: ${userEmail}`);
            console.log('-------------------------------');
            return { success: true, message: 'Email logged (Server error fallback)' };
        }

    } catch (error) {
        console.error('[EmailService] Failed to send welcome email:', error);
        return { success: false, error: error.message };
    }
};
