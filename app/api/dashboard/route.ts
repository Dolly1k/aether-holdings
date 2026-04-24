import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const TIER_YIELDS: Record<string, number> = {
  'A': 43,
  'B': 100,
  'C': 200,
};

const TIER_CAPS: Record<string, number> = {
  'A': 1300,
  'B': 3000,
  'C': 6000,
};

function getDailyYield(tier: string): number {
  return TIER_YIELDS[tier] || 43;
}

function getMonthlyCap(tier: string): number {
  return TIER_CAPS[tier] || 1300;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const userList = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const user = userList[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = Date.now();
    const lastYieldTime = user.lastYield || 0;
    const oneDay = 24 * 60 * 60 * 1000;

    let newBalance = user.balance;

    // Apply daily yield if 24h has passed (simulates 00:00 UTC logic)
    if (now - lastYieldTime > oneDay && user.tier) {
      const daily = getDailyYield(user.tier);
      const cap = getMonthlyCap(user.tier);
      
      newBalance = Math.min((user.balance || 0) + daily, cap);
      
      await db
        .update(users)
        .set({ 
          balance: newBalance,
          lastYield: now 
        })
        .where(eq(users.email, email.toLowerCase()));
    }

    return NextResponse.json({
      balance: newBalance,
      tier: user.tier || 'A',
      dailyYield: getDailyYield(user.tier || 'A'),
      monthlyCap: getMonthlyCap(user.tier || 'A'),
      lastYield: user.lastYield
    });
  } catch (e) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, tier } = await req.json();

    await db
      .update(users)
      .set({ tier, lastYield: Date.now() })
      .where(eq(users.email, email.toLowerCase()));

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
  }
}
