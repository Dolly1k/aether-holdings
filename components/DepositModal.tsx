'use client';

import { useState } from 'react';
import { useLanguage, useAuth, tiers } from '@/lib/shared';

const COINS = [
  { id: 'USDT', label: 'USDT TRC20', network: 'TRON', envKey: 'NEXT_PUBLIC_USDT_ADDRESS' },
  { id: 'USDC', label: 'USDC TRC20', network: 'TRON', envKey: 'NEXT_PUBLIC_USDC_ADDRESS' },
  { id: 'TRX',  label: 'TRX',        network: 'TRON', envKey: 'NEXT_PUBLIC_TRX_ADDRESS' },
  { id: 'BTC',  label: 'BTC',        network: 'Bitcoin', envKey: 'NEXT_PUBLIC_BTC_ADDRESS' },
] as const;

type CoinId = typeof COINS[number]['id'];

type Step = 'select-tier' | 'select-coin' | 'send' | 'verifying' | 'done' | 'error';

export default function DepositModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { userEmail } = useAuth();

  const [step, setStep] = useState<Step>('select-tier');
  const [selectedTier, setSelectedTier] = useState<typeof tiers[number] | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinId>('USDT');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addresses: Record<CoinId, string> = {
    USDT: process.env.NEXT_PUBLIC_USDT_ADDRESS || '',
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
    TRX:  process.env.NEXT_PUBLIC_TRX_ADDRESS  || '',
    BTC:  process.env.NEXT_PUBLIC_BTC_ADDRESS  || '',
  };

  const coin = COINS.find(c => c.id === selectedCoin)!;
  const address = addresses[selectedCoin];

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
        body: JSON.stringify({
          email: userEmail,
          coin: selectedCoin,
          amountUSD: selectedTier.amountUSD,
          tier: selectedTier.grade,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        setErrorMsg(data.error || 'Payment not detected yet.');
        setStep('error');
      }
    } catch {
      setErrorMsg('Network error. Try again.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-emerald-900/30 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/10">
          <div className="text-[10px] tracking-[3px] text-emerald-400 mb-1">CRYPTO DEPOSIT</div>
          <h3 className="text-xl font-light text-white/90">{t('deposit')}</h3>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-6">

          {/* STEP 1 — select tier */}
          {(step === 'select-tier') && (
            <div className="space-y-3">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-4">SELECT GRADE</div>
              {tiers.map(tier => (
                <button
                  key={tier.grade}
                  onClick={() => { setSelectedTier(tier); setStep('select-coin'); }}
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

          {/* STEP 2 — select coin */}
          {step === 'select-coin' && (
            <div className="space-y-3">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-4">
                GRADE {selectedTier?.grade} — ${selectedTier?.amountUSD.toLocaleString()} — SELECT COIN
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COINS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCoin(c.id); setStep('send'); }}
                    className="border border-white/10 hover:border-emerald-700 p-4 text-left transition-colors"
                  >
                    <div className="text-sm font-light text-white">{c.label}</div>
                    <div className="text-[10px] text-white/40 mt-1">{c.network}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('select-tier')} className="text-[10px] text-white/30 hover:text-white mt-2">← back</button>
            </div>
          )}

          {/* STEP 3 — send payment */}
          {step === 'send' && selectedTier && (
            <div className="space-y-5">
              <div className="text-[10px] tracking-[3px] text-white/40">
                SEND EXACTLY ${selectedTier.amountUSD.toLocaleString()} IN {coin.label}
              </div>

              {address ? (
                <>
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] text-white/40 tracking-widest mb-2">{coin.label} ADDRESS ({coin.network})</div>
                    <div className="font-mono text-xs text-white/80 break-all leading-relaxed">{address}</div>
                    <button
                      onClick={copy}
                      className="mt-3 text-[10px] tracking-[2px] text-emerald-400 hover:text-emerald-300 uppercase"
                    >
                      {copied ? '✓ COPIED' : 'COPY ADDRESS'}
                    </button>
                  </div>

                  <div className="border border-amber-900/40 bg-amber-950/10 p-4 text-[11px] text-amber-200/80 leading-relaxed space-y-1">
                    <div>• Send <strong>${selectedTier.amountUSD.toLocaleString()}</strong> worth of {coin.label} to the address above.</div>
                    <div>• {coin.network === 'TRON' ? 'Use TRC20 network only.' : 'Use Bitcoin mainnet only.'}</div>
                    <div>• Click <strong>Verify Payment</strong> within 30 minutes of sending.</div>
                  </div>

                  <button
                    onClick={verify}
                    className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors"
                  >
                    VERIFY PAYMENT
                  </button>
                </>
              ) : (
                <div className="border border-red-900/40 p-4 text-[11px] text-red-300/80">
                  Address not configured. Contact support: board@aether.holdings
                </div>
              )}

              <button onClick={() => setStep('select-coin')} className="text-[10px] text-white/30 hover:text-white">← back</button>
            </div>
          )}

          {/* Verifying */}
          {step === 'verifying' && (
            <div className="py-10 text-center">
              <div className="text-emerald-400 text-[10px] tracking-[3px] mb-4">CHECKING BLOCKCHAIN</div>
              <div className="text-white/50 text-sm">Querying network for your transaction…</div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="py-8 text-center space-y-4">
              <div className="text-emerald-400 text-2xl">✓</div>
              <div className="text-[10px] tracking-[3px] text-emerald-400">PAYMENT CONFIRMED</div>
              <p className="text-sm text-white/60">Your deposit has been received. Grade {selectedTier?.grade} tier is now active. Daily yield will begin accruing at 00:00 UTC.</p>
              <button onClick={onClose} className="mt-4 w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors">
                RETURN TO DASHBOARD
              </button>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="border border-red-900/40 bg-red-950/10 p-4 text-[11px] text-red-300/80 leading-relaxed">
                {errorMsg}
              </div>
              <button
                onClick={() => setStep('send')}
                className="w-full border border-white/20 py-3 text-[11px] tracking-[3px] uppercase hover:bg-white/5"
              >
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
