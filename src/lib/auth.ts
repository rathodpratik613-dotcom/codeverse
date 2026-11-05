import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from './db';
import { User } from '@/models/user';
import { Session } from '@/models/session';

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
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<AuthUser> {
  await dbConnect();

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
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
  });

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  await dbConnect();
  const user = await User.findById(id);
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function getUserWithPassword(id: string): Promise<(AuthUser & { password: string }) | null> {
  await dbConnect();
  const user = await User.findById(id);
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
    password: user.password,
  };
}

export async function updateUserXP(userId: string, xpToAdd: number): Promise<AuthUser | null> {
  await dbConnect();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { xp: xpToAdd },
    },
    { new: true }
  );

  if (!user) return null;

  // Check for level up
  const newLevel = Math.floor(user.xp / 1000) + 1;
  if (newLevel > user.level) {
    await User.findByIdAndUpdate(userId, { level: newLevel });
    user.level = newLevel;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function updateUserCoins(userId: string, coinsToAdd: number): Promise<AuthUser | null> {
  await dbConnect();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { coins: coinsToAdd },
    },
    { new: true }
  );

  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function updateUserStreak(userId: string, streak: number): Promise<AuthUser | null> {
  await dbConnect();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      streak,
      longestStreak: Math.max(streak, (await User.findById(userId))?.longestStreak || 0),
    },
    { new: true }
  );

  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    coins: user.coins,
    streak: user.streak,
    longestStreak: user.longestStreak,
    selectedLanguages: user.selectedLanguages,
    preferences: user.preferences,
    role: user.role,
  };
}

export async function createSession(userId: string, token: string, rememberMe: boolean, userAgent?: string, ipAddress?: string): Promise<void> {
  await dbConnect();

  const expiresAt = new Date(Date.now() + (rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY));

  await Session.create({
    userId,
    token,
    expiresAt,
    isRememberMe: rememberMe,
    userAgent,
    ipAddress,
    isActive: true,
  });
}

export async function getSessionByToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
  await dbConnect();

  const session = await Session.findOne({ token, isActive: true, expiresAt: { $gt: new Date() } });
  if (!session) return null;

  return {
    userId: session.userId.toString(),
    sessionId: session._id.toString(),
  };
}

export async function deleteSession(token: string): Promise<void> {
  await dbConnect();
  await Session.findOneAndUpdate({ token }, { isActive: false });
}

export async function deleteAllUserSessions(userId: string, exceptToken?: string): Promise<void> {
  await dbConnect();

  const query: any = { userId, isActive: true };
  if (exceptToken) {
    query.token = { $ne: exceptToken };
  }

  await Session.updateMany(query, { isActive: false });
}

export async function getUserSessions(userId: string): Promise<Array<{ id: string; userAgent?: string; ipAddress?: string; createdAt: Date; isRememberMe: boolean }>> {
  await dbConnect();

  const sessions = await Session.find({ userId, isActive: true, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean();

  return sessions.map((s) => ({
    id: s._id.toString(),
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt,
    isRememberMe: s.isRememberMe,
  }));
}
