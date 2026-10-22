import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function createDatabase(path = process.env.DATABASE_PATH ?? './data/tienda.sqlite') {
  const resolvedPath = path === ':memory:' ? path : resolve(projectDir, 'backend', path);
  if (resolvedPath !== ':memory:') mkdirSync(dirname(resolvedPath), { recursive: true });
  const db = new DatabaseSync(resolvedPath);
  db.exec('PRAGMA foreign_keys = ON');
  if (resolvedPath !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec(readFileSync(resolve(projectDir, 'schema.sql'), 'utf8'));
  const count = db.prepare('SELECT COUNT(*) AS total FROM productos').get().total;
  if (count === 0) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.exec(readFileSync(resolve(projectDir, 'seed.sql'), 'utf8'));
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      db.close();
      throw error;
    }
  }
  return db;
}

