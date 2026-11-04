import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  createdAt: string;
}

// In-memory user storage (replace with database in production)
let users: User[] = [];

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

export async function registerUser(username: string, email: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);

  const user: User = {
    id: Date.now().toString(),
    username,
    email,
    password: hashedPassword,
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function updateUserXP(userId: string, xpToAdd: number): User | undefined {
  const user = findUserById(userId);
  if (user) {
    user.xp += xpToAdd;
    // Level up every 1000 XP
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
  }
  return user;
}

export function updateUserCoins(userId: string, coinsToAdd: number): User | undefined {
  const user = findUserById(userId);
  if (user) {
    user.coins += coinsToAdd;
  }
  return user;
}

export function updateUserStreak(userId: string, streak: number): User | undefined {
  const user = findUserById(userId);
  if (user) {
    user.streak = streak;
  }
  return user;
}
