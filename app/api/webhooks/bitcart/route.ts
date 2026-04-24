import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const event = await req.json();

  // Only handle invoice paid/completed
  if (event.event !== 'invoice_paid' && event.event !== 'invoice_completed') {
    return NextResponse.json({ received: true });
  }

  const invoiceId = event.id;
  const amountPaid = Number(event.price); // USD

  // Find user by invoice (order_id includes email if we set it)
  // We'll store invoiceId on user when creating invoice
  const userList = await db.select().from(users).where(eq(users.lastInvoiceId, invoiceId)).limit(1);
  if (!userList.length) {
    // Fallback: try to find by order_id if stored elsewhere
    return NextResponse.json({ error: 'User not found for invoice' }, { status: 404 });
  }

  const user = userList[0];
  const newBalance = (user.balance || 0) + amountPaid;

  await db.update(users)
    .set({ balance: newBalance })
    .where(eq(users.email, user.email));

  console.log(`[Bitcart] Credited $${amountPaid} to ${user.email}. New balance: $${newBalance}`);

  return NextResponse.json({ received: true });
}
