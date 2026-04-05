import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Note: Passport usually requires express-session, but we are using it statelessly
// with JWTs in the callback. We just use the 'authenticate' method to trigger the redirect.

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Support dynamic callback URL based on request host for local development
function getCallbackUrl(req) {
  if (process.env.VITE_APP_URL) {
    return `${process.env.VITE_APP_URL}/api/auth/google-callback`;
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:5173';
  return `${protocol}://${host}/api/auth/google-callback`;
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5173/api/auth/google-callback', // This is just for passport initialization, we manually redirect below
    scope: ['profile', 'email']
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));
}

export default async function handler(req, res) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_ID === 'your-google-client-id-here') {
    return res.status(500).json({ 
      message: 'Google OAuth not configured', 
      details: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file. You can get these from the Google Cloud Console.'
    });
  }

  const callbackUrl = getCallbackUrl(req);
  console.log(`[Auth Google] Redirecting with callback: ${callbackUrl}`);

  // We manually construct the redirect URL to avoid Passport's complex session requirements in serverless
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=profile%20email`;
  
  return res.redirect(googleAuthUrl);
}
