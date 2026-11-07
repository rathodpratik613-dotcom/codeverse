import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from './db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  longestStreak: number;
  selectedLanguages: string[];
  preferences: {
    theme: string;
    editorFontSize: number;
    reducedMotion: boolean;
    notifications: boolean;
  };
  role: 'student' | 'admin';
  createdAt: string;
}

interface User extends AuthUser {
  password: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, rememberMe = false): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<AuthUser> {
  const db = await getDb();
  const hashedPassword = await hashPassword(password);

  const user: User = {
    id: crypto.randomUUID(),
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name: username,
    xp: 0,
    coins: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    selectedLanguages: [],
    preferences: {
      theme: 'dark',
      editorFontSize: 14,
      reducedMotion: false,
      notifications: true,
    },
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  db.data.users.push(user);
  await saveDb();

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.email === email.toLowerCase());
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function findUserByUsername(username: string): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.username === username.toLowerCase());
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.id === id);
  if (!user) return null;

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserWithPassword(id: string): Promise<User | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.id === id);
  return user || null;
}

export async function getUserWithPasswordByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.email === email.toLowerCase());
  return user || null;
}

export async function updateUserXP(userId: string, xpToAdd: number): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.id === userId);
  if (!user) return null;

  user.xp += xpToAdd;
  const newLevel = Math.floor(user.xp / 1000) + 1;
  if (newLevel > user.level) {
    user.level = newLevel;
  }

  await saveDb();
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserCoins(userId: string, coinsToAdd: number): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.id === userId);
  if (!user) return null;

  user.coins += coinsToAdd;
  await saveDb();
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUserStreak(userId: string, streak: number): Promise<AuthUser | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.id === userId);
  if (!user) return null;

  user.streak = streak;
  if (streak > user.longestStreak) {
    user.longestStreak = streak;
  }

  await saveDb();
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function createSession(userId: string, token: string, rememberMe: boolean, userAgent?: string, ipAddress?: string): Promise<void> {
  const db = await getDb();

  const session = {
    id: crypto.randomUUID(),
    userId,
    token,
    expiresAt: new Date(Date.now() + (rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY)).toISOString(),
    isRememberMe: rememberMe,
    userAgent,
    ipAddress,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.data.sessions.push(session);
  await saveDb();
}

/**
 * Validates a bearer token end-to-end: JWT signature/expiry AND an active,
 * unexpired session record. Returns null if either check fails, which means
 * logout and password resets actually revoke access.
 */
export async function getSessionAuth(token: string): Promise<{ userId: string; sessionId: string } | null> {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const session = await getSessionByToken(token);
  if (!session || session.userId !== decoded.userId) return null;

  return { userId: decoded.userId, sessionId: session.sessionId };
}

export async function getSessionByToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
  const db = await getDb();
  const session = db.data.sessions.find((s: any) => s.token === token && s.isActive && new Date(s.expiresAt) > new Date());
  if (!session) return null;

  return {
    userId: session.userId,
    sessionId: session.id,
  };
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDb();
  const session = db.data.sessions.find((s: any) => s.token === token);
  if (session) {
    session.isActive = false;
    await saveDb();
  }
}

export async function deleteAllUserSessions(userId: string, exceptToken?: string): Promise<void> {
  const db = await getDb();
  db.data.sessions.forEach((s: any) => {
    if (s.userId === userId && s.isActive && (!exceptToken || s.token !== exceptToken)) {
      s.isActive = false;
    }
  });
  await saveDb();
}

export async function getUserSessions(userId: string): Promise<Array<{ id: string; userAgent?: string; ipAddress?: string; createdAt: string; isRememberMe: boolean }>> {
  const db = await getDb();
  return db.data.sessions
    .filter((s: any) => s.userId === userId && s.isActive && new Date(s.expiresAt) > new Date())
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((s: any) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      isRememberMe: s.isRememberMe,
    }));
}

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const db = await getDb();
  const user = db.data.users.find((u: any) => u.email === email.toLowerCase());
  if (!user) return null;

  // Invalidate any previous unused reset tokens for this user
  db.data.passwordResetTokens.forEach((t: any) => {
    if (t.userId === user.id && !t.usedAt) {
      t.usedAt = new Date().toISOString();
    }
  });

  const token = crypto.randomBytes(32).toString('hex');
  db.data.passwordResetTokens.push({
    id: crypto.randomUUID(),
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  });
  await saveDb();
  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const db = await getDb();
  const reset = db.data.passwordResetTokens.find(
    (t: any) => t.token === token && !t.usedAt && new Date(t.expiresAt) > new Date()
  );
  if (!reset) return false;

  const user = db.data.users.find((u: any) => u.id === reset.userId);
  if (!user) return false;

  user.password = await hashPassword(newPassword);
  reset.usedAt = new Date().toISOString();

  // Revoke all existing sessions so old tokens stop working
  db.data.sessions.forEach((s: any) => {
    if (s.userId === user.id) {
      s.isActive = false;
    }
  });

  await saveDb();
  return true;
}
