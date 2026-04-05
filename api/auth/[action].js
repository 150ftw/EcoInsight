import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../lib/db.js';
import { 
  signToken, 
  verifyToken, 
  setAuthCookie, 
  clearAuthCookie, 
  getAuthToken 
} from '../lib/auth-util.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Helper for dynamic Google Callback URL
function getCallbackUrl(req) {
  if (process.env.VITE_APP_URL) {
    const baseUrl = process.env.VITE_APP_URL.replace(/\/+$/, '');
    return `${baseUrl}/api/auth/google-callback`;
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:5173';
  return `${protocol}://${host}/api/auth/google-callback`;
}

export default async function handler(req, res) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'signup':
        return await handleSignup(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'me':
        return await handleMe(req, res);
      case 'check-user':
        return await handleCheckUser(req, res);
      case 'google':
        return await handleGoogleInit(req, res);
      case 'google-callback':
        return await handleGoogleCallback(req, res);
      case 'update-profile':
        return await handleUpdateProfile(req, res);
      case 'update-password':
        return await handleUpdatePassword(req, res);
      default:
        return res.status(404).json({ message: 'Action not found' });
    }
  } catch (err) {
    console.error(`[Auth API: ${action}] Error:`, err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleSignup(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // 1. Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Create user in table
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName || '',
      password_hash: passwordHash,
      onboarded: true 
    }])
    .select()
    .single();

  if (createError) throw createError;

  // 4. Set JWT cookie
  const token = signToken({ id: newUser.id, email: newUser.email });
  setAuthCookie(res, token);

  return res.status(200).json({ 
    message: 'User created successfully',
    user: { id: newUser.id, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name }
  });
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  // 1. Fetch user
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (fetchError || !user || !user.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials or user not found' });
  }

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // 3. Set JWT cookie
  const token = signToken({ id: user.id, email: user.email });
  setAuthCookie(res, token);

  return res.status(200).json({ 
    message: 'Login successful',
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image }
  });
}

async function handleLogout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out' });
}

async function handleMe(req, res) {
  const token = getAuthToken(req);
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return res.status(401).json({ user: null });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, profile_image, onboarded, provider')
    .eq('id', decoded.id)
    .single();

  if (error || !user) {
    return res.status(401).json({ user: null });
  }

  return res.status(200).json({ user });
}

async function handleCheckUser(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('id, provider')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return res.status(200).json({ 
    exists: !!data,
    provider: data?.provider || null
  });
}

async function handleGoogleInit(req, res) {
  const callbackUrl = getCallbackUrl(req);
  const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return res.redirect(googleAuthUrl);
}

async function handleGoogleCallback(req, res) {
  const { code } = req.query;
  const callbackUrl = getCallbackUrl(req);

  if (!code) return res.status(400).json({ message: 'Authorization code missing' });

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

  const googleUser = userResponse.data;

  // 3. Sync with Supabase
  let { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', googleUser.email.toLowerCase())
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: crypto.randomUUID(),
        email: googleUser.email.toLowerCase(),
        first_name: googleUser.given_name,
        last_name: googleUser.family_name || '',
        profile_image: googleUser.picture,
        provider: 'google',
        provider_id: googleUser.id,
        onboarded: true
      }])
      .select().single();
    if (createError) throw createError;
    user = newUser;
  } else {
    const { data: updatedUser } = await supabase
      .from('users')
      .update({ 
        profile_image: googleUser.picture,
        provider: 'google',
        provider_id: googleUser.id 
      })
      .eq('id', user.id)
      .select().single();
    user = updatedUser;
  }

  // 4. Set JWT cookie
  const token = signToken({ id: user.id, email: user.email });
  setAuthCookie(res, token);
  return res.redirect('/');
}

async function handleUpdateProfile(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const token = getAuthToken(req);
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });

  const { firstName, lastName, profileImage } = req.body;
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({ 
      first_name: firstName, 
      last_name: lastName, 
      profile_image: profileImage,
      updated_at: new Date().toISOString()
    })
    .eq('id', decoded.id)
    .select('id, email, first_name, last_name, profile_image, provider')
    .single();

  if (error) throw error;
  return res.status(200).json({ user: updatedUser });
}

async function handleUpdatePassword(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const token = getAuthToken(req);
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) return res.status(401).json({ message: 'Not authenticated' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  const { error } = await supabase
    .from('users')
    .update({ 
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', decoded.id);

  if (error) throw error;
  return res.status(200).json({ message: 'Password updated successfully' });
}
