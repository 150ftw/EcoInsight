import bcrypt from 'bcryptjs';
import { supabase } from '../lib/db.js';
import { verifyToken, getAuthToken } from '../lib/auth-util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = getAuthToken(req);
  const decoded = token ? verifyToken(token) : null;

  if (!decoded) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    // 1. Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 2. Update user in table
    const { error } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.id);

    if (error) throw error;

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[Auth Update Password] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
