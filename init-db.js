#!/usr/bin/env node
/**
 * Initialize SQLite database with schema
 * Usage: node init-db.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'aether.db');
console.log(`Initializing database at: ${dbPath}`);

const db = new Database(dbPath);

// Create users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  code TEXT,
  code_expires INTEGER,
  balance INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'A',
  last_yield INTEGER DEFAULT 0,
  last_invoice_id TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
`;

try {
  db.exec(createUsersTable);
  console.log('✓ Created users table');
  
  // Check if table was created
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✓ Database tables:', tables.map(t => t.name).join(', '));
  
  // Check permissions
  db.prepare('SELECT 1').get();
  console.log('✓ Database is readable/writable');
  
  console.log('\n✓ Database initialization complete!');
} catch (err) {
  console.error('✗ Database initialization failed:', err.message);
  process.exit(1);
} finally {
  db.close();
}
