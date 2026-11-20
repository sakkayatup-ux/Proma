import { promises as fs } from 'fs';
import path from 'path';
import { createEmptyDb } from './seed';
import type { Db } from './types';

// ใช้เฉพาะฝั่งเซิร์ฟเวอร์ (API routes)
const FILE = path.join(process.cwd(), 'data', 'db.json');

export async function load(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as Db;
  } catch {
    const db = createEmptyDb();
    await save(db);
    return db;
  }
}

export async function save(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

export const stripPasswords = (db: Db): Db => ({
  ...db,
  accounts: db.accounts.map((a) => ({ ...a, password: '' })),
});
