import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const USDC_TRC20 = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8';
const TRON_GRID = 'https://api.trongrid.io';
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

async function checkTrc20(address: string, contract: string, expectedUsdt: number): Promise<boolean> {
  const minTs = Date.now() - WINDOW_MS;
  const url = `${TRON_GRID}/v1/accounts/${address}/transactions/trc20?contract_address=${contract}&min_timestamp=${minTs}&limit=20&only_to=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return false;
  const { data } = await res.json();
  if (!Array.isArray(data)) return false;
  const decimals = 1_000_000; // TRC20 USDT/USDC use 6 decimals
  return data.some((tx: { value: string }) => {
    const amount = Number(tx.value) / decimals;
    return Math.abs(amount - expectedUsdt) < 0.5;
  });
}

async function checkTrx(address: string, expectedUsdt: number): Promise<boolean> {
  // Fetch recent TRX transactions — compare value in SUN (1 TRX = 1,000,000 SUN)
  // We need a TRX/USD rate; use a rough estimate or fetch from CoinGecko
  const rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd', {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  if (!rateRes?.ok) return false;
  const rateData = await rateRes.json();
  const trxUsd: number = rateData?.tron?.usd ?? 0;
  if (trxUsd === 0) return false;

  const expectedTrx = expectedUsdt / trxUsd;
  const minTs = Date.now() - WINDOW_MS;
  const url = `${TRON_GRID}/v1/accounts/${address}/transactions?min_timestamp=${minTs}&limit=20&only_to=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return false;
  const { data } = await res.json();
  if (!Array.isArray(data)) return false;
  return data.some((tx: { raw_data?: { contract?: [{ parameter?: { value?: { amount?: number } } }] } }) => {
    const sun = tx.raw_data?.contract?.[0]?.parameter?.value?.amount ?? 0;
    const trx = sun / 1_000_000;
    return Math.abs(trx - expectedTrx) / expectedTrx < 0.05; // 5% tolerance for rate fluctuation
  });
}

async function checkBtc(address: string, expectedUsdt: number): Promise<boolean> {
  const rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  if (!rateRes?.ok) return false;
  const rateData = await rateRes.json();
  const btcUsd: number = rateData?.bitcoin?.usd ?? 0;
  if (btcUsd === 0) return false;

  const expectedBtc = expectedUsdt / btcUsd;
  const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=10`, {
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res?.ok) return false;
  const data = await res.json();
  const windowStart = Math.floor((Date.now() - WINDOW_MS) / 1000);
  return (data.txs || []).some((tx: { time: number; out: Array<{ addr: string; value: number }> }) => {
    if (tx.time < windowStart) return false;
    const received = tx.out
      .filter((o: { addr: string }) => o.addr === address)
      .reduce((s: number, o: { value: number }) => s + o.value, 0);
    const btcAmount = received / 1e8;
    return Math.abs(btcAmount - expectedBtc) / expectedBtc < 0.05;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, coin, amountUSD, tier } = await req.json();
    if (!email || !coin || !amountUSD || !tier) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const addr = {
      USDT: process.env.USDT_TRC20_ADDRESS,
      USDC: process.env.USDC_TRC20_ADDRESS,
      TRX:  process.env.TRX_ADDRESS,
      BTC:  process.env.BTC_ADDRESS,
    }[coin as string];

    if (!addr) return NextResponse.json({ success: false, error: 'Coin not configured' }, { status: 400 });

    let found = false;
    if (coin === 'USDT') found = await checkTrc20(addr, USDT_TRC20, amountUSD);
    else if (coin === 'USDC') found = await checkTrc20(addr, USDC_TRC20, amountUSD);
    else if (coin === 'TRX') found = await checkTrx(addr, amountUSD);
    else if (coin === 'BTC') found = await checkBtc(addr, amountUSD);

    if (!found) {
      return NextResponse.json({ success: false, error: 'Payment not found. Wait a moment and try again.' });
    }

    // Credit the user
    const tierMap: Record<string, string> = { '4500': 'A', '10000': 'B', '15000': 'C' };
    const userTier = tier || tierMap[String(amountUSD)] || 'A';

    await db.update(users)
      .set({ tier: userTier, lastYield: Date.now() })
      .where(eq(users.email, email.toLowerCase()));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[payments/verify]', e);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
