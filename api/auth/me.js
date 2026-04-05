import { supabase } from '../lib/db.js';
import { verifyToken, getAuthToken } from '../lib/auth-util.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = getAuthToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_image, provider, terms_accepted, onboarded')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[Auth Me] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
