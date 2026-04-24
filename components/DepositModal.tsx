'use client';

import { useState } from 'react';
import { useLanguage, useAuth, tiers } from '@/lib/shared';

type CoinId =
  | 'USDT_TRC20' | 'USDC_TRC20' | 'TRX'
  | 'USDT_ETH'   | 'USDC_ETH'   | 'ETH_ETH'
  | 'USDT_BNB'   | 'USDC_BNB'   | 'BNB_BNB'
  | 'USDT_ARB'   | 'USDC_ARB'   | 'ETH_ARB'
  | 'BTC';

interface Coin {
  id: CoinId;
  token: string;
  network: string;
  addressKey: 'tron' | 'evm' | 'btc';
  note: string;
}

const COINS: Coin[] = [
  // Tron
  { id: 'USDT_TRC20', token: 'USDT', network: 'TRC20 · Tron',    addressKey: 'tron', note: 'Use Tron (TRC20) network.' },
  { id: 'USDC_TRC20', token: 'USDC', network: 'TRC20 · Tron',    addressKey: 'tron', note: 'Use Tron (TRC20) network.' },
  { id: 'TRX',        token: 'TRX',  network: 'Tron',             addressKey: 'tron', note: 'Use Tron mainnet.' },
  // Ethereum
  { id: 'USDT_ETH',   token: 'USDT', network: 'ERC20 · Ethereum', addressKey: 'evm',  note: 'Use Ethereum (ERC20) network.' },
  { id: 'USDC_ETH',   token: 'USDC', network: 'ERC20 · Ethereum', addressKey: 'evm',  note: 'Use Ethereum (ERC20) network.' },
  { id: 'ETH_ETH',    token: 'ETH',  network: 'Ethereum',          addressKey: 'evm',  note: 'Use Ethereum mainnet.' },
  // BNB Chain
  { id: 'USDT_BNB',   token: 'USDT', network: 'BEP20 · BNB Chain', addressKey: 'evm', note: 'Use BNB Chain (BEP20) network.' },
  { id: 'USDC_BNB',   token: 'USDC', network: 'BEP20 · BNB Chain', addressKey: 'evm', note: 'Use BNB Chain (BEP20) network.' },
  { id: 'BNB_BNB',    token: 'BNB',  network: 'BNB Chain',          addressKey: 'evm', note: 'Use BNB Chain mainnet.' },
  // Arbitrum
  { id: 'USDT_ARB',   token: 'USDT', network: 'Arbitrum',          addressKey: 'evm',  note: 'Use Arbitrum One network.' },
  { id: 'USDC_ARB',   token: 'USDC', network: 'Arbitrum',          addressKey: 'evm',  note: 'Use Arbitrum One network.' },
  { id: 'ETH_ARB',    token: 'ETH',  network: 'Arbitrum',          addressKey: 'evm',  note: 'Use Arbitrum One network.' },
  // Bitcoin
  { id: 'BTC',        token: 'BTC',  network: 'Bitcoin',            addressKey: 'btc',  note: 'Use Bitcoin mainnet only.' },
];

type Step = 'select-tier' | 'select-coin' | 'send' | 'verifying' | 'done' | 'error';

export default function DepositModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { userEmail } = useAuth();

  const addresses = {
    tron: process.env.NEXT_PUBLIC_TRX_ADDRESS  || '',
    evm:  process.env.NEXT_PUBLIC_ETH_ADDRESS  || '',
    btc:  process.env.NEXT_PUBLIC_BTC_ADDRESS  || '',
  };

  const [step, setStep]               = useState<Step>('select-tier');
  const [selectedTier, setSelectedTier] = useState<typeof tiers[number] | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinId>('USDT_TRC20');
  const [copied, setCopied]           = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');

  const coin    = COINS.find(c => c.id === selectedCoin)!;
  const address = addresses[coin.addressKey];

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const verify = async () => {
    if (!selectedTier || !userEmail) return;
    setStep('verifying');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, coin: selectedCoin, amountUSD: selectedTier.amountUSD, tier: selectedTier.grade }),
      });
      const data = await res.json();
      if (data.success) setStep('done');
      else { setErrorMsg(data.error || 'Payment not detected yet.'); setStep('error'); }
    } catch {
      setErrorMsg('Network error. Try again.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-emerald-900/30 max-h-[92vh] overflow-y-auto">

        <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/10">
          <div className="text-[10px] tracking-[3px] text-emerald-400 mb-1">CRYPTO DEPOSIT</div>
          <h3 className="text-xl font-light text-white/90">{t('deposit')}</h3>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">

          {/* STEP 1 — tier */}
          {step === 'select-tier' && (
            <div className="space-y-3">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-4">SELECT GRADE</div>
              {tiers.map(tier => (
                <button key={tier.grade} onClick={() => { setSelectedTier(tier); setStep('select-coin'); }}
                  className="w-full text-left border border-white/10 hover:border-emerald-700 p-4 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-light text-white">Grade {tier.grade} — ${tier.amountUSD.toLocaleString()}</div>
                      <div className="text-[10px] text-white/40 mt-1">+${tier.monthlyCapUSD.toLocaleString()} {t('monthlyCap')}</div>
                    </div>
                    <div className="text-emerald-400 text-[10px] tracking-widest">SELECT →</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 — coin */}
          {step === 'select-coin' && (
            <div className="space-y-4">
              <div className="text-[10px] tracking-[3px] text-white/40">
                GRADE {selectedTier?.grade} · ${selectedTier?.amountUSD.toLocaleString()} · SELECT COIN & NETWORK
              </div>

              {/* Group by: Tron, Ethereum, BNB Chain, Arbitrum, Bitcoin */}
              {[
                { label: 'TRON',      coins: COINS.filter(c => c.addressKey === 'tron') },
                { label: 'ETHEREUM',  coins: COINS.filter(c => c.addressKey === 'evm' && c.network.toLowerCase().includes('ethereum') || c.id === 'ETH_ETH' || c.id === 'USDT_ETH' || c.id === 'USDC_ETH') },
                { label: 'BNB CHAIN', coins: COINS.filter(c => c.network.includes('BNB')) },
                { label: 'ARBITRUM',  coins: COINS.filter(c => c.network.includes('Arbitrum')) },
                { label: 'BITCOIN',   coins: COINS.filter(c => c.addressKey === 'btc') },
              ].map(group => (
                <div key={group.label}>
                  <div className="text-[9px] tracking-[3px] text-white/20 mb-2">{group.label}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.coins.map(c => (
                      <button key={c.id} onClick={() => { setSelectedCoin(c.id); setStep('send'); }}
                        className="border border-white/10 hover:border-emerald-700 p-3 text-left transition-colors"
                      >
                        <div className="text-xs font-light text-white">{c.token}</div>
                        <div className="text-[9px] text-white/40 mt-0.5 leading-tight">{c.network.split('·')[0].trim()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={() => setStep('select-tier')} className="text-[10px] text-white/30 hover:text-white">← back</button>
            </div>
          )}

          {/* STEP 3 — send */}
          {step === 'send' && selectedTier && (
            <div className="space-y-5">
              <div className="text-[10px] tracking-[3px] text-white/40">
                {coin.token} · {coin.network} · ${selectedTier.amountUSD.toLocaleString()}
              </div>

              {address ? (
                <>
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] text-white/40 tracking-widest mb-2">{coin.token} ADDRESS ({coin.network})</div>
                    <div className="font-mono text-xs text-white/80 break-all leading-relaxed">{address}</div>
                    <button onClick={copy} className="mt-3 text-[10px] tracking-[2px] text-emerald-400 hover:text-emerald-300 uppercase">
                      {copied ? '✓ COPIED' : 'COPY ADDRESS'}
                    </button>
                  </div>

                  <div className="border border-amber-900/40 bg-amber-950/10 p-4 text-[11px] text-amber-200/80 leading-relaxed space-y-1">
                    <div>• Send exactly <strong>${selectedTier.amountUSD.toLocaleString()}</strong> worth of {coin.token}.</div>
                    <div>• {coin.note}</div>
                    <div>• Click <strong>Verify</strong> within 30 minutes of sending.</div>
                  </div>

                  <button onClick={verify} className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors">
                    VERIFY PAYMENT
                  </button>
                </>
              ) : (
                <div className="border border-red-900/40 p-4 text-[11px] text-red-300/80">
                  Address not configured. Contact: board@aether.holdings
                </div>
              )}

              <button onClick={() => setStep('select-coin')} className="text-[10px] text-white/30 hover:text-white">← back</button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-10 text-center">
              <div className="text-emerald-400 text-[10px] tracking-[3px] mb-4">CHECKING BLOCKCHAIN</div>
              <div className="text-white/50 text-sm">Querying {coin.network} for your transaction…</div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 text-center space-y-4">
              <div className="text-emerald-400 text-2xl">✓</div>
              <div className="text-[10px] tracking-[3px] text-emerald-400">PAYMENT CONFIRMED</div>
              <p className="text-sm text-white/60">Grade {selectedTier?.grade} activated. Daily yield begins at 00:00 UTC.</p>
              <button onClick={onClose} className="mt-4 w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors">
                RETURN TO DASHBOARD
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="border border-red-900/40 bg-red-950/10 p-4 text-[11px] text-red-300/80 leading-relaxed">
                {errorMsg}
              </div>
              <button onClick={() => setStep('send')} className="w-full border border-white/20 py-3 text-[11px] tracking-[3px] uppercase hover:bg-white/5">
                TRY AGAIN
              </button>
            </div>
          )}

        </div>

        <div className="px-6 sm:px-8 pb-6 border-t border-white/10 pt-4">
          <div className="text-[10px] text-white/30 mb-4 leading-relaxed">{t('lockup')}</div>
          <button onClick={onClose} className="w-full py-2 text-[10px] tracking-widest border border-white/10 hover:bg-white/5">
            {t('close').toUpperCase()}
          </button>
        </div>

      </div>
    </div>
  );
}
