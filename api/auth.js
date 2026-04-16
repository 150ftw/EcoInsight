import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Resend } from 'resend';
import { supabase } from '../lib/db.js';
import { 
  signToken, 
  verifyToken, 
  setAuthCookie, 
  clearAuthCookie, 
  getAuthToken 
} from '../lib/auth-util.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET;

const APPLE_CLIENT_ID = process.env.APPLE_ID_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_ID_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_ID_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_ID_PRIVATE_KEY;

// Helper for dynamic Google Callback URL
function getCallbackUrl(req) {
  if (process.env.VITE_APP_URL) {
    const baseUrl = process.env.VITE_APP_URL.replace(/\/+$/, '');
    return `${baseUrl}/api/auth?action=google-callback`;
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:5173';
  return `${protocol}://${host}/api/auth?action=google-callback`;
}

function getAppleCallbackUrl(req) {
  if (process.env.VITE_APP_URL) {
    const baseUrl = process.env.VITE_APP_URL.replace(/\/+$/, '');
    return `${baseUrl}/api/auth?action=apple-callback`;
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:5173';
  return `${protocol}://${host}/api/auth?action=apple-callback`;
}

/**
 * Generates the signed Client Secret JWT required by Apple.
 */
function getAppleClientSecret() {
  const timeNow = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: APPLE_TEAM_ID,
    iat: timeNow,
    exp: timeNow + (86400 * 180), // 6 months expiration
    aud: 'https://appleid.apple.com',
    sub: APPLE_CLIENT_ID,
  };

  const header = {
    alg: 'ES256',
    kid: APPLE_KEY_ID,
  };

  // Convert raw private key to standard format if needed (handle newlines)
  const privateKey = APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: header,
  });
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
      case 'apple':
        return await handleAppleInit(req, res);
      case 'apple-callback':
        return await handleAppleCallback(req, res);
      case 'update-profile':
        return await handleUpdateProfile(req, res);
      case 'update-password':
        return await handleUpdatePassword(req, res);
      case 'forgot-password':
        return await handleForgotPassword(req, res);
      case 'reset-password':
        return await handleResetPassword(req, res);
      case 'decrement-credits':
        return await handleDecrementCredits(req, res);
      default:
        return res.status(404).json({ message: 'Action not found' });
    }
  } catch (err) {
    console.error(`[Auth API: ${action}] CRITICAL ERROR:`, err.message);
    if (err.stack) console.error(err.stack); // Full stack trace for production debugging
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined 
    });
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
    user: { 
      id: newUser.id, 
      email: newUser.email, 
      first_name: newUser.first_name, 
      last_name: newUser.last_name
    }
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
    user: { 
      id: user.id, 
      email: user.email, 
      first_name: user.first_name, 
      last_name: user.last_name, 
      profile_image: user.profile_image
    }
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
  
  // Consistently redirect with success flag for frontend synchronization
  return res.redirect('/?auth_success=true');
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

async function handleForgotPassword(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // 1. Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, email, first_name')
    .eq('email', email.toLowerCase())
    .single();

  if (fetchError || !user) {
    // Return success even if user not found for security (obscurity)
    return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
  }

  // 2. Generate Token
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  // 3. Save to DB
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      reset_token: token,
      reset_expires_at: expires.toISOString()
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  // 4. Send Email via Resend
  const apiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[handleForgotPassword] No Resend API Key found. Reset link:', token);
    return res.status(200).json({ message: 'Reset link generated (Mock send - check logs)' });
  }

  const resend = new Resend(apiKey);
  const resetLink = `${process.env.VITE_APP_URL || 'https://www.ecoinsight.online'}/?action=reset&token=${token}`;

  await resend.emails.send({
    from: 'EcoInsight Security <security@ecoinsight.online>',
    to: [user.email],
    subject: 'Reset your EcoInsight Intelligence access',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
        <h2>Password Reset Requested</h2>
        <p>Hello ${user.first_name || 'Analyst'},</p>
        <p>We received a request to reset your EcoInsight password. Click the link below to authorize this change:</p>
        <div style="margin: 2rem 0;">
          <a href="${resetLink}" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; borderRadius: 8px;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
        <p>Best Regards,<br/>EcoInsight Security Team</p>
      </div>
    `
  });

  return res.status(200).json({ message: 'Reset link sent successfully' });
}

async function handleResetPassword(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { token, newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Invalid token or password too short' });
  }

  // 1. Verify token
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, reset_expires_at')
    .eq('reset_token', token)
    .single();

  if (fetchError || !user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const isExpired = new Date(user.reset_expires_at) < new Date();
  if (isExpired) {
    return res.status(400).json({ message: 'Reset token has expired' });
  }

  // 2. Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // 3. Update DB
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      password_hash: passwordHash,
      reset_token: null,
      reset_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  return res.status(200).json({ message: 'Password reset successful. You can now log in.' });
}

async function handleAppleInit(req, res) {
  const callbackUrl = getAppleCallbackUrl(req);
  const scope = encodeURIComponent('name email');
  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&response_mode=form_post`;
  return res.redirect(appleAuthUrl);
}

async function handleAppleCallback(req, res) {
  // Apple uses POST form_post for callbacks when scopes like 'email' or 'name' are requested
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  
  // body will contain 'code' and 'user' (user only on first registration)
  const { code, user } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: 'No authorization code received from Apple' });
  }

  try {
    const clientSecret = getAppleClientSecret();
    const callbackUrl = getAppleCallbackUrl(req);

    // Exchange code for tokens
    const response = await axios.post('https://appleid.apple.com/auth/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: APPLE_CLIENT_ID,
      client_secret: clientSecret,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { id_token } = response.data;
    const decodedToken = jwt.decode(id_token);
    const appleUserEmail = decodedToken.email?.toLowerCase();
    const appleUserId = decodedToken.sub;

    if (!appleUserEmail) {
      return res.status(400).json({ message: 'Could not retrieve email from Apple ID' });
    }

    // Parse 'user' if present (contains name)
    let firstName = 'Apple';
    let lastName = 'User';
    if (user) {
      try {
        const userData = JSON.parse(user);
        firstName = userData.name?.firstName || firstName;
        lastName = userData.name?.lastName || lastName;
      } catch (e) { console.error('Error parsing Apple user data:', e); }
    }

    // Sync with Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', appleUserEmail)
      .single();

    let finalUser;
    if (fetchError || !existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: appleUserEmail,
          first_name: firstName,
          last_name: lastName,
          provider: 'apple',
          provider_id: appleUserId,
          credits: 100,
          onboarded: false
        })
        .select()
        .single();
      
      if (createError) throw createError;
      finalUser = newUser;
    } else {
      // Update existing user (link provider if needed)
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          provider: 'apple',
          provider_id: appleUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      finalUser = updatedUser;
    }

    // Set auth cookie and redirect to engine
    const token = signToken({ id: finalUser.id, email: finalUser.email });
    setAuthCookie(res, token);
    
    // Redirect back to main dashboard
    const baseUrl = process.env.VITE_APP_URL || 'https://www.ecoinsight.online';
    return res.redirect(`${baseUrl}/?auth_success=true`);

  } catch (error) {
    console.error('Apple Callback Error:', error.response?.data || error.message);
    const baseUrl = process.env.VITE_APP_URL || 'https://www.ecoinsight.online';
    return res.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(error.message)}`);
  }
}

async function handleDecrementCredits(req, res) {
  // Credits sys removed for launch - unlimited usage enabled
  return res.status(200).json({ credits: 999999, unlimited: true });
}
