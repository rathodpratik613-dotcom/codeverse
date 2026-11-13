import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'codeverse.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: any[];
  sessions: any[];
  lessonProgress: any[];
  editorDrafts: any[];
  challengeSubmissions: any[];
  xpTransactions: any[];
  coinTransactions: any[];
  userAchievements: any[];
  bookmarks: any[];
  notes: any[];
  activityLog: any[];
  notifications: any[];
  passwordResetTokens: any[];
  contentItems: any[];
  languageSuggestions: any[];
  gameHistory: any[];
  dailyChallenges: any[];
}

const defaultData: DatabaseSchema = {
  users: [],
  sessions: [],
  lessonProgress: [],
  editorDrafts: [],
  challengeSubmissions: [],
  xpTransactions: [],
  coinTransactions: [],
  userAchievements: [],
  bookmarks: [],
  notes: [],
  activityLog: [],
  notifications: [],
  passwordResetTokens: [],
  contentItems: [],
  languageSuggestions: [],
  gameHistory: [],
  dailyChallenges: [],
};

let db: Low<DatabaseSchema> | null = null;

export async function getDb(): Promise<Low<DatabaseSchema>> {
  if (!db) {
    db = new Low<DatabaseSchema>(new JSONFile(DB_FILE), defaultData);
    await db.read();
    
    // Ensure all collections exist
    const data = db.data as any;
    for (const key of Object.keys(defaultData)) {
      if (!data[key]) {
        data[key] = [];
      }
    }
    await db.write();
  }
  return db;
}

export async function saveDb(): Promise<void> {
  if (db) {
    await db.write();
  }
}
