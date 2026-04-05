import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only';
const COOKIE_NAME = 'ei_auth_token';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: -1,
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getAuthToken(req) {
  const cookies = parse(req.headers.cookie || '');
  return cookies[COOKIE_NAME];
}
