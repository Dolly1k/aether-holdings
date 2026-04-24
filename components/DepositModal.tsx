'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/shared';
import { useAuth } from '@/lib/shared';

export default function DepositModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const { userEmail } = useAuth();
  const [copied, setCopied] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tiers = [
    { name: 'Grade A', usd: 4500, desc: 'Crude Oil & Fueling Stations' },
    { name: 'Grade B', usd: 10000, desc: 'Prime Real Estate' },
    { name: 'Grade C', usd: 15000, desc: 'High-ROI Enterprises' },
  ];

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(''), 1500);
  };

  const handlePay = async (usd: number) => {
    if (!userEmail) {
      alert('Not logged in');
      return;
    }
    setLoadingId(String(usd));
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, amountUSD: usd }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert('Failed to create invoice: ' + (data.error || 'Unknown'));
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl p-8 bg-zinc-950 border border-emerald-900/40 max-h-[90vh] overflow-y-auto">
        <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2 text-center">BITCART PAYMENT</div>
        <h3 className="text-xl font-light tracking-wide mb-6 text-center text-white/90">Deposit</h3>

        <div className="space-y-4 mb-6">
          {tiers.map(tier => (
            <div key={tier.usd} className="border border-white/10 p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm font-light text-white">{tier.name} — ${tier.usd.toLocaleString()}</div>
                  <div className="text-[10px] text-white/50">{tier.desc}</div>
                </div>
                <button
                  onClick={() => handlePay(tier.usd)}
                  disabled={loadingId === String(tier.usd)}
                  className="text-[10px] bg-emerald-900 hover:bg-emerald-700 px-3 py-1.5 tracking-widest disabled:opacity-50"
                >
                  {loadingId === String(tier.usd) ? '...' : 'PAY'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 mb-6">
          <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">MANUAL PAYMENT</div>
          <div className="text-xs text-white/60 mb-2">USDT (TRC20)</div>
          <div className="font-mono text-sm text-white/70 break-all flex justify-between items-center">
            <span>T...yourAddressHere</span>
            <button onClick={() => copy('T...yourAddressHere')} className="text-[9px] text-white/40 hover:text-white ml-2">
              {copied === 'T...' ? '✓' : 'copy'}
            </button>
          </div>
        </div>

        <div className="p-3 border border-emerald-900/20 bg-emerald-950/10 text-[10px] text-emerald-200/80">
          After payment, balance will be credited upon confirmation. {t('lockup')}.
        </div>

        <button onClick={onClose} className="mt-6 w-full py-3 text-[10px] tracking-widest border border-white/20 hover:bg-white/5">
          {t('close').toUpperCase()}
        </button>
      </div>
    </div>
  );
}


