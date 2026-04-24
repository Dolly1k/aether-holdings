import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const TIER_YIELDS: Record<string, number> = { A: 43, B: 100, C: 200 };
const TIER_CAPS:   Record<string, number> = { A: 1300, B: 3000, C: 6000 };

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  try {
    const userList = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = userList[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // No deposit verified yet — return zeroed state, no yield
    if (!user.depositDate || !user.tier) {
      return NextResponse.json({
        balance: 0,
        tier: null,
        dailyYield: 0,
        monthlyCap: 0,
        lastYield: null,
        depositDate: null,
      });
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const daily = TIER_YIELDS[user.tier] ?? 0;
    const cap   = TIER_CAPS[user.tier]   ?? 0;
    let newBalance = user.balance ?? 0;

    // Credit yield if 24h has passed since last credit
    if (daily > 0 && user.lastYield && now - user.lastYield > oneDay) {
      newBalance = Math.min(newBalance + daily, cap);
      await db.update(users)
        .set({ balance: newBalance, lastYield: now })
        .where(eq(users.email, email.toLowerCase()));
    }

    return NextResponse.json({
      balance: newBalance,
      tier: user.tier,
      dailyYield: daily,
      monthlyCap: cap,
      lastYield: user.lastYield,
      depositDate: user.depositDate,
    });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, tier } = await req.json();
    await db.update(users)
      .set({ tier, lastYield: Date.now() })
      .where(eq(users.email, email.toLowerCase()));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
  }
}
