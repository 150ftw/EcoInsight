import { supabase } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  console.log(`[Auth CheckUser] Checking email: ${email.toLowerCase()}`);

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, provider')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      throw error;
    }

    return res.status(200).json({ 
      exists: !!data,
      provider: data ? data.provider : null
    });
  } catch (err) {
    if (err.code === 'PGRST205') {
      return res.status(500).json({ 
        message: 'Database schema mismatch. Please ensure the "users" table is created in Supabase.',
        details: 'Missing table public.users'
      });
    }
    console.error('[Auth CheckUser] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
