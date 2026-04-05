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

  const { name, profileImage } = req.body;

  try {
    // Basic name splitting for schema compatibility
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        first_name: firstName, 
        last_name: lastName,
        profile_image: profileImage,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[Auth Update Profile] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
