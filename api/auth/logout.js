import { clearAuthCookie } from '../lib/auth-util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
}
