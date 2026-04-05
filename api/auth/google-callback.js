import axios from 'axios';
import { supabase } from '../lib/db.js';
import { signToken, setAuthCookie } from '../lib/auth-util.js';

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

export default async function handler(req, res) {
  const { code } = req.query;
  const callbackUrl = getCallbackUrl(req);

  if (!code) {
    return res.status(400).json({ message: 'Authorization code missing' });
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // 2. Get user info from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const googleUser = userResponse.data; // id, email, verified_email, name, given_name, family_name, picture

    // 3. Sync with Supabase users table
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', googleUser.email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: crypto.randomUUID(),
          email: googleUser.email.toLowerCase(),
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          profile_image: googleUser.picture,
          provider: 'google',
          provider_id: googleUser.id,
          onboarded: true // Google users are often considered verified
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      user = newUser;
    } else {
      // Update existing user if needed (e.g. update profile image)
      const { data: updatedUser } = await supabase
        .from('users')
        .update({ 
          profile_image: googleUser.picture,
          provider: 'google',
          provider_id: googleUser.id 
        })
        .eq('id', user.id)
        .select()
        .single();
      user = updatedUser;
    }

    // 4. Set JWT cookie
    const token = signToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    // 5. Redirect to frontend dashboard
    return res.redirect('/');

  } catch (err) {
    console.error('[Auth GoogleCallback] Error:', err.response?.data || err.message);
    return res.status(500).send('Authentication failed');
  }
}
