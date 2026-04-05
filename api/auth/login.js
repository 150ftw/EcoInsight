import bcrypt from 'bcryptjs';
import { supabase } from '../lib/db.js';
import { signToken, setAuthCookie } from '../lib/auth-util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // 1. Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check if local account
    if (user.provider !== 'local') {
      return res.status(400).json({ 
        message: `This account is linked with ${user.provider}. Please use ${user.provider} to log in.` 
      });
    }

    // 3. Verify password
    const isMatched = await bcrypt.compare(password, user.password_hash);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Generate JWT & Set Cookie
    const token = signToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    // 5. Return user
    const { password_hash, ...userResponse } = user;
    return res.status(200).json({ user: userResponse });

  } catch (err) {
    console.error('[Auth Login] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
