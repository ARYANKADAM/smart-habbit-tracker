import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.warn('⚠️ JWT_SECRET should be at least 32 characters long');
}

export async function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookies() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('authToken')?.value;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    const decoded = await verifyToken(token);
    return decoded?.userId;
  } catch (error) {
    return null;
  }
}