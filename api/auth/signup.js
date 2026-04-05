import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // I added uuid to package.json earlier (wait, did I?)
// Actually, let me use crypto.randomUUID() which is native in Node 19+ or just use Supabase to generate it.
import { supabase } from '../lib/db.js';
import { signToken, setAuthCookie } from '../lib/auth-util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, lastName, email, password } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user
    const userId = crypto.randomUUID();
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          provider: 'local'
        }
      ])
      .select()
      .single();

    if (createError) throw createError;

    // 4. Generate JWT & Set Cookie
    const token = signToken({ id: newUser.id, email: newUser.email });
    setAuthCookie(res, token);

    // 5. Return user
    const { password_hash, ...userResponse } = newUser;
    return res.status(201).json({ user: userResponse });

  } catch (err) {
    if (err.code === 'PGRST205') {
      return res.status(500).json({ 
        message: 'Database schema mismatch. Please ensure the "users" table is created in Supabase.',
        details: 'Missing table public.users'
      });
    }
    console.error('[Auth Signup] Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
