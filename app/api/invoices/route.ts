import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { email, amountUSD } = await req.json();

  if (!process.env.BITCART_URL || !process.env.BITCART_API_KEY || !process.env.BITCART_STORE_ID) {
    return NextResponse.json({ error: 'Bitcart not configured' }, { status: 500 });
  }

  // Find user
  const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!userList.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const user = userList[0];

  // Create invoice
  const res = await fetch(`${process.env.BITCART_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BITCART_API_KEY}`,
    },
    body: JSON.stringify({
      price: amountUSD,
      currency: 'USD',
      store_id: Number(process.env.BITCART_STORE_ID),
      order_id: `aether-${email}-${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/bitcart`,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.detail || 'Failed to create invoice' }, { status: 500 });
  }

  // Save invoice id for webhook lookup
  await db.update(users)
    .set({ lastInvoiceId: data.id })
    .where(eq(users.email, email));

  return NextResponse.json({
    invoiceId: data.id,
    checkoutUrl: `${process.env.BITCART_URL}/invoices/${data.id}`,
  });
}
