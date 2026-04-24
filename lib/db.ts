import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

const sqlite = new Database('aether.db');
export const db = drizzle(sqlite);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  code: text('code'),
  codeExpires: integer('code_expires'),
  balance: integer('balance').default(0),
  tier: text('tier').default('A'),
  lastYield: integer('last_yield').default(0),
  lastInvoiceId: text('last_invoice_id'),
  createdAt: integer('created_at').default(Date.now()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const emailSchema = z.string().email().toLowerCase();
export const codeSchema = z.string().length(6).regex(/^\d+$/);
