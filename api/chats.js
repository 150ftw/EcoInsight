import { supabase } from './lib/db.js';
import { getAuthToken, verifyToken } from './lib/auth-util.js';

/**
 * Server-side chats storage. Replaces direct browser-to-Supabase access, which
 * relied on RLS policies written for Supabase's own Auth (auth.uid()) — this app
 * uses its own JWT cookie auth instead, so those policies never matched anything
 * and left the anon key able to read every user's chats. The service-role client
 * here bypasses RLS entirely; user scoping is enforced in code via the verified
 * JWT, the same pattern api/auth.js already uses.
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
      case 'list':
        return await handleList(req, res, userId);
      case 'save':
        return await handleSave(req, res, userId);
      case 'delete':
        return await handleDelete(req, res, userId);
      case 'delete-all':
        return await handleDeleteAll(req, res, userId);
      default:
        return res.status(404).json({ message: 'Action not found' });
    }
  } catch (err) {
    console.error(`[Chats API: ${action}] ERROR:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleList(req, res, userId) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return res.status(200).json({ chats: null, activeChatId: null });
  }

  const chats = data.map(row => ({ id: row.id, title: row.title, messages: row.messages || [] }));
  const activeRow = data.find(row => row.is_active);
  const activeChatId = activeRow ? activeRow.id : chats[0].id;

  return res.status(200).json({ chats, activeChatId });
}

async function handleSave(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { chats, activeChatId } = req.body || {};
  if (!Array.isArray(chats)) return res.status(400).json({ message: 'chats must be an array' });

  const rows = chats.map(chat => ({
    id: chat.id,
    user_id: userId,
    title: chat.title,
    messages: chat.messages,
    is_active: chat.id === activeChatId
  }));

  const { error } = await supabase.from('chats').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  return res.status(200).json({ message: 'Saved' });
}

async function handleDelete(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { chatId } = req.body || {};
  if (!chatId) return res.status(400).json({ message: 'chatId is required' });

  const { error } = await supabase.from('chats').delete().eq('id', chatId).eq('user_id', userId);
  if (error) throw error;

  return res.status(200).json({ message: 'Deleted' });
}

async function handleDeleteAll(req, res, userId) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { error } = await supabase.from('chats').delete().eq('user_id', userId);
  if (error) throw error;

  return res.status(200).json({ message: 'All deleted' });
}
