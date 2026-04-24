import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

async function sendCodeEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Aether <noreply@aether.holdings>',
      to: email,
      subject: 'Aether Verification Code',
      text: `Your verification code is: ${code}\n\nIt expires in 15 minutes.`,
    });
    return true;
  } catch {
    // Fallback to console
    console.log(`\n=== VERIFICATION CODE FOR ${email} ===`);
    console.log(code);
    console.log('=====================================\n');
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action, code, amountUSD } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    const key = email.toLowerCase();

    // Send OTP code
    if (action === 'send-code') {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000;

      await db.insert(users).values({
        email: key,
        code: verificationCode,
        codeExpires: expires,
      }).onConflictDoUpdate({ target: users.email, set: { code: verificationCode, codeExpires: expires } });

      await sendCodeEmail(key, verificationCode);
      return NextResponse.json({ success: true });
    }

    // Verify OTP
    if (action === 'verify') {
      if (!code || code.length !== 6) {
        return NextResponse.json({ success: false, error: 'Invalid code format' }, { status: 400 });
      }

      const userList = await db.select().from(users).where(eq(users.email, key)).limit(1);
      if (!userList.length) return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });
      const user = userList[0];

      if (!user.code || user.code !== code) {
        return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
      }
      if (user.codeExpires && user.codeExpires < Date.now()) {
        await db.update(users).set({ code: null, codeExpires: null }).where(eq(users.email, key));
        return NextResponse.json({ success: false, error: 'Code expired' }, { status: 400 });
      }

      await db.update(users).set({ code: null, codeExpires: null }).where(eq(users.email, key));
      return NextResponse.json({ success: true, user: { email: user.email, tier: user.tier || 'A', balance: user.balance || 0 } });
    }

    // Manual credit (admin use)
    if (action === 'credit-balance') {
      const userList = await db.select().from(users).where(eq(users.email, key)).limit(1);
      if (!userList.length) return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });
      const user = userList[0];
      const newBalance = (user.balance || 0) + (amountUSD || 0);
      await db.update(users).set({ balance: newBalance }).where(eq(users.email, key));
      return NextResponse.json({ success: true, balance: newBalance });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[auth]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
