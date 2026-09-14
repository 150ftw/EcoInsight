import { supabase } from './lib/db.js';
import { getAuthToken, verifyToken } from './lib/auth-util.js';

/**
 * Server-side user_settings storage — see api/chats.js for why this moved off
 * direct browser-to-Supabase access.
 */
export default async function handler(req, res) {
  const token = getAuthToken(req);
  const decoded = token ? verifyToken(token) : null;
  if (!decoded?.id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const userId = decoded.id;

  const { action } = req.query;

  try {
    switch (action) {
      case 'get':
        return await handleGet(req, res, userId);
      case 'save':
        return await handleSave(req, res, userId);
      default:
        return res.status(404).json({ message: 'Action not found' });
    }
  } catch (err) {
    console.error(`[Settings API: ${action}] ERROR:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGet(req, res, userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return res.status(200).json({ settings: data });
}

async function handleSave(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { ai_settings, chat_settings, personalization, appearance, profile } = req.body || {};

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ai_settings,
      chat_settings,
      personalization,
      appearance,
      profile
    }, { onConflict: 'user_id' });

  if (error) throw error;
  return res.status(200).json({ message: 'Saved' });
}
