import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

function buildEmailHtml(code: string): string {
  const digits = code.split('');
  const digitCells = digits.map(d =>
    `<td style="width:44px;height:56px;text-align:center;vertical-align:middle;background:#0d0d0d;border:1px solid #1a2e1a;font-family:monospace;font-size:28px;font-weight:400;letter-spacing:0;color:#d1fae5;">${d}</td>`
  ).join('<td style="width:6px;"></td>');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Board Access</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;min-height:100vh;">
    <tr><td align="center" style="padding:48px 20px;">
      <table width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0" border="0">

        <!-- Header -->
        <tr>
          <td style="border-bottom:1px solid #151515;padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:8px;height:8px;background:#10b981;border-radius:50%;vertical-align:middle;"></td>
                <td style="width:12px;"></td>
                <td style="font-size:13px;letter-spacing:4px;color:#ededed;font-weight:500;vertical-align:middle;">AETHER</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Label -->
        <tr><td style="padding-top:40px;padding-bottom:8px;">
          <p style="margin:0;font-size:10px;letter-spacing:3px;color:#4b5563;text-transform:uppercase;">BOARD ACCESS</p>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding-bottom:36px;">
          <h1 style="margin:0;font-size:24px;font-weight:300;color:#ededed;letter-spacing:-0.02em;line-height:1.2;">Verification Code</h1>
        </td></tr>

        <!-- Code block -->
        <tr><td style="padding-bottom:36px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>${digitCells}</tr>
          </table>
        </td></tr>

        <!-- Instruction -->
        <tr><td style="padding-bottom:12px;">
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            Enter this code on the sign-in screen.<br>
            Valid for <span style="color:#d1fae5;">15 minutes</span>. Single use only.
          </p>
        </td></tr>

        <!-- Warning -->
        <tr><td style="padding-bottom:48px;">
          <p style="margin:0;font-size:11px;color:#374151;letter-spacing:0.5px;line-height:1.6;">
            If you did not request this code, discard this message.<br>
            Do not share this code with anyone.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #111111;padding-top:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:9px;letter-spacing:2px;color:#1f2937;text-transform:uppercase;">AETHER HOLDINGS</td>
                <td align="right" style="font-size:9px;letter-spacing:2px;color:#1f2937;text-transform:uppercase;">PRIVATE BY DESIGN</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendCodeEmail(email: string, code: string) {
  const apiKey = process.env.SMTP_PASS || '';
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@aetherholdings.org';

  try {
    const res = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${apiKey}`,
      },
      body: JSON.stringify({
        from: { address: fromEmail, name: 'Aether' },
        to: [{ email_address: { address: email } }],
        subject: 'Board Access — Verification Code',
        htmlbody: buildEmailHtml(code),
        textbody: `AETHER HOLDINGS — BOARD ACCESS\n\nVerification Code: ${code}\n\nValid for 15 minutes. Single use only.\nDo not share this code with anyone.\n\n— PRIVATE BY DESIGN`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return true;
  } catch (e) {
    console.log(`\n=== VERIFICATION CODE FOR ${email} ===`);
    console.log(code);
    console.log('=====================================\n');
    console.error('[email]', e);
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
