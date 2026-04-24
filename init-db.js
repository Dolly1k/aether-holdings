#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'aether.db');
console.log(`Initializing database at: ${dbPath}`);

const db = new Database(dbPath);

// Create table (new installs)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  code TEXT,
  code_expires INTEGER,
  balance INTEGER DEFAULT 0,
  tier TEXT,
  deposit_date INTEGER,
  last_yield INTEGER,
  last_invoice_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
`);
console.log('✓ users table ready');

// Migration: add deposit_date column if missing (existing installs)
const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

if (!cols.includes('deposit_date')) {
  db.exec('ALTER TABLE users ADD COLUMN deposit_date INTEGER');
  console.log('✓ migrated: added deposit_date column');
}

// Migration: reset accounts that were auto-credited by the old buggy defaults.
// Any account where deposit_date IS NULL has never completed a real payment —
// zero out their balance, tier, and last_yield so the dashboard shows clean state.
const reset = db.prepare(`
  UPDATE users
  SET balance = 0, tier = NULL, last_yield = NULL
  WHERE deposit_date IS NULL AND (balance > 0 OR tier IS NOT NULL OR tier = 'A')
`);
const info = reset.run();
if (info.changes > 0) {
  console.log(`✓ migrated: reset ${info.changes} account(s) with no verified deposit`);
}

db.prepare('SELECT 1').get();
console.log('✓ database is readable/writable');
console.log('\n✓ Database initialization complete!');
db.close();
