import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// TRC20 contracts (Tron)
const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const USDC_TRC20 = 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8';

// ERC20 contracts per chain
const CONTRACTS: Record<string, Record<string, string>> = {
  USDT: {
    eth: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    bnb: '0x55d398326f99059fF775485246999027B3197955',
    arb: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  USDC: {
    eth: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    bnb: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    arb: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
};

// Blockscout base URLs (free, no API key)
const BLOCKSCOUT: Record<string, string> = {
  eth: 'https://eth.blockscout.com/api/v2',
  bnb: 'https://bsc.blockscout.com/api/v2',
  arb: 'https://arbitrum.blockscout.com/api/v2',
};

const TRON_GRID = 'https://api.trongrid.io';
const WINDOW_MS = 30 * 60 * 1000;

// ── Helpers ────────────────────────────────────────────────────────────────────

async function coinPrice(id: string): Promise<number> {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);
  return (await r?.json().catch(() => null))?.[id]?.usd ?? 0;
}

// ── Tron ───────────────────────────────────────────────────────────────────────

async function checkTrc20(address: string, contract: string, expectedUsd: number): Promise<boolean> {
  const url = `${TRON_GRID}/v1/accounts/${address}/transactions/trc20?contract_address=${contract}&min_timestamp=${Date.now() - WINDOW_MS}&limit=20&only_to=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return false;
  const { data } = await res.json().catch(() => ({ data: [] }));
  return (data ?? []).some((tx: { value: string }) => Math.abs(Number(tx.value) / 1e6 - expectedUsd) < 0.5);
}

async function checkTrx(address: string, expectedUsd: number): Promise<boolean> {
  const trxUsd = await coinPrice('tron');
  if (!trxUsd) return false;
  const expectedTrx = expectedUsd / trxUsd;
  const url = `${TRON_GRID}/v1/accounts/${address}/transactions?min_timestamp=${Date.now() - WINDOW_MS}&limit=20&only_to=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return false;
  const { data } = await res.json().catch(() => ({ data: [] }));
  return (data ?? []).some((tx: { raw_data?: { contract?: [{ parameter?: { value?: { amount?: number } } }] } }) => {
    const trx = (tx.raw_data?.contract?.[0]?.parameter?.value?.amount ?? 0) / 1e6;
    return Math.abs(trx - expectedTrx) / expectedTrx < 0.05;
  });
}

// ── EVM (Blockscout) ───────────────────────────────────────────────────────────

async function checkErc20(chain: string, address: string, contract: string, expectedUsd: number): Promise<boolean> {
  const base = BLOCKSCOUT[chain];
  if (!base) return false;
  const url = `${base}/addresses/${address}/token-transfers?token=${contract}&filter=to`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return false;
  const data = await res.json().catch(() => null);
  const cutoff = new Date(Date.now() - WINDOW_MS);
  return (data?.items ?? []).some((tx: { timestamp: string; total: { value: string; decimals: string } }) => {
    if (new Date(tx.timestamp) < cutoff) return false;
    const decimals = Number(tx.total?.decimals ?? 6);
    const amount = Number(tx.total?.value ?? 0) / Math.pow(10, decimals);
    return Math.abs(amount - expectedUsd) < 0.5;
  });
}

async function checkNativeEvm(chain: string, coinId: string, address: string, expectedUsd: number): Promise<boolean> {
  const price = await coinPrice(coinId);
  if (!price) return false;
  const expectedAmt = expectedUsd / price;
  const base = BLOCKSCOUT[chain];
  if (!base) return false;
  const url = `${base}/addresses/${address}/transactions?filter=to`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return false;
  const data = await res.json().catch(() => null);
  const cutoff = new Date(Date.now() - WINDOW_MS);
  return (data?.items ?? []).some((tx: { timestamp: string; value: string }) => {
    if (new Date(tx.timestamp) < cutoff) return false;
    const amt = Number(tx.value) / 1e18;
    return Math.abs(amt - expectedAmt) / expectedAmt < 0.05;
  });
}

// ── Bitcoin ────────────────────────────────────────────────────────────────────

async function checkBtc(address: string, expectedUsd: number): Promise<boolean> {
  const btcUsd = await coinPrice('bitcoin');
  if (!btcUsd) return false;
  const expectedBtc = expectedUsd / btcUsd;
  const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=10`, {
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!res?.ok) return false;
  const data = await res.json().catch(() => null);
  const windowStart = Math.floor((Date.now() - WINDOW_MS) / 1000);
  return (data?.txs ?? []).some((tx: { time: number; out: Array<{ addr: string; value: number }> }) => {
    if (tx.time < windowStart) return false;
    const btc = tx.out.filter(o => o.addr === address).reduce((s, o) => s + o.value, 0) / 1e8;
    return Math.abs(btc - expectedBtc) / expectedBtc < 0.05;
  });
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { email, coin, amountUSD, tier } = await req.json();
    if (!email || !coin || !amountUSD || !tier) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const tron = process.env.TRX_ADDRESS || '';
    const evm  = process.env.ETH_ADDRESS  || '';
    const btc  = process.env.BTC_ADDRESS  || '';

    let found = false;

    switch (coin) {
      // Tron
      case 'TRX':        found = await checkTrx(tron, amountUSD);                                   break;
      case 'USDT_TRC20': found = await checkTrc20(tron, USDT_TRC20, amountUSD);                     break;
      case 'USDC_TRC20': found = await checkTrc20(tron, USDC_TRC20, amountUSD);                     break;
      // Ethereum
      case 'ETH_ETH':    found = await checkNativeEvm('eth', 'ethereum', evm, amountUSD);           break;
      case 'USDT_ETH':   found = await checkErc20('eth', evm, CONTRACTS.USDT.eth, amountUSD);       break;
      case 'USDC_ETH':   found = await checkErc20('eth', evm, CONTRACTS.USDC.eth, amountUSD);       break;
      // BNB Chain
      case 'BNB_BNB':    found = await checkNativeEvm('bnb', 'binancecoin', evm, amountUSD);        break;
      case 'USDT_BNB':   found = await checkErc20('bnb', evm, CONTRACTS.USDT.bnb, amountUSD);       break;
      case 'USDC_BNB':   found = await checkErc20('bnb', evm, CONTRACTS.USDC.bnb, amountUSD);       break;
      // Arbitrum
      case 'ETH_ARB':    found = await checkNativeEvm('arb', 'ethereum', evm, amountUSD);           break;
      case 'USDT_ARB':   found = await checkErc20('arb', evm, CONTRACTS.USDT.arb, amountUSD);       break;
      case 'USDC_ARB':   found = await checkErc20('arb', evm, CONTRACTS.USDC.arb, amountUSD);       break;
      // Bitcoin
      case 'BTC':        found = await checkBtc(btc, amountUSD);                                    break;
      default:
        return NextResponse.json({ success: false, error: 'Unsupported coin' }, { status: 400 });
    }

    if (!found) {
      return NextResponse.json({ success: false, error: 'Payment not found. Wait a moment and try again.' });
    }

    const now = Date.now();
    await db.update(users)
      .set({ tier, depositDate: now, lastYield: now })
      .where(eq(users.email, email.toLowerCase()));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[payments/verify]', e);
    return NextResponse.json({ success: false, error: 'Verification error' }, { status: 500 });
  }
}
