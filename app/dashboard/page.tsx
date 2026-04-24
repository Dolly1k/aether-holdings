'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLanguage, useCurrency, tiers } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import DepositModal from '@/components/DepositModal';

export default function Dashboard() {
  const { isLoggedIn, userEmail } = useAuth();
  const { t } = useLanguage();
  const { fmt, currency } = useCurrency();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [tier] = useState(tiers[0]);
  const [balance, setBalance] = useState(1240);
  const [depositDate] = useState(new Date('2026-03-15')); // simulated

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push('/');
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) return <div className="min-h-screen bg-[#050505]" />;

  const history = [
    { date: '2026-04-22', amount: 43 },
    { date: '2026-04-21', amount: 43 },
    { date: '2026-04-20', amount: 43 },
    { date: '2026-04-19', amount: 43 },
    { date: '2026-04-18', amount: 43 },
    { date: '2026-04-17', amount: 43 },
    { date: '2026-04-16', amount: 43 },
  ];

  const daysSinceDeposit = Math.floor((Date.now() - depositDate.getTime()) / (1000 * 60 * 60 * 24));
  const lockupDaysRemaining = Math.max(0, 40 - daysSinceDeposit);
  const canWithdraw = lockupDaysRemaining === 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Nav />

      <div className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          {/* Header */}
          <div className="flex justify-between items-start sm:items-end mb-10 sm:mb-14 pb-6 sm:pb-8 border-b border-white/10">
            <div>
              <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">{t('privateByDesign')} • {t('needToKnow')}</div>
              <h1 className="text-2xl sm:text-4xl font-light tracking-tight">Board Dashboard</h1>
              <div className="text-[11px] text-white/40 mt-2">{t('loggedInAs')}: <span className="text-white/70 font-mono break-all">{userEmail}</span></div>
            </div>
            <div className="text-right text-[10px] tracking-[3px] text-white/30 shrink-0 ml-4">
              GRADE {tier.grade}<br />
              <span className="text-emerald-400">ACTIVE</span>
            </div>
          </div>

          {/* Balance grid */}
          <div className="grid md:grid-cols-3 gap-px bg-white/10 mb-10 sm:mb-16">
            <div className="p-6 sm:p-10 bg-[#050505]">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">{t('balance')}</div>
              <div className="text-4xl sm:text-5xl font-light text-emerald-400 tabular-nums">{fmt(balance)}</div>
              <div className="text-[10px] tracking-widest text-white/30 mt-2">USD BASE</div>
            </div>
            <div className="p-6 sm:p-10 bg-[#050505]">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">{t('todayYield').toUpperCase()}</div>
              <div className="text-4xl sm:text-5xl font-light tabular-nums">+{fmt(tier.dailyYieldUSD)}</div>
              <div className="text-[10px] tracking-widest text-emerald-400 mt-2">CREDITED 00:00 UTC</div>
            </div>
            <div className="p-6 sm:p-10 bg-[#050505]">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">MONTHLY CAP</div>
              <div className="text-4xl sm:text-5xl font-light tabular-nums">{fmt(tier.monthlyCapUSD)}</div>
              <div className="text-[10px] tracking-widest text-white/30 mt-2">GRADE {tier.grade}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-10 sm:mb-16">
            <button
              onClick={() => setShowDeposit(true)}
              className="p-6 sm:p-8 bg-emerald-900 hover:bg-emerald-700 transition-colors text-left"
            >
              <div className="text-[10px] tracking-[3px] text-emerald-300 mb-2">ACTION</div>
              <div className="text-xl font-light">{t('deposit')}</div>
              <div className="text-[11px] text-emerald-200/70 mt-3">USDT • BTC • ETH • Auto-credited on confirmation</div>
            </button>

            <button
              onClick={() => setShowWithdraw(true)}
              className="p-6 sm:p-8 border border-white/10 hover:border-white/30 transition-colors text-left"
            >
              <div className="text-[10px] tracking-[3px] text-white/40 mb-2">ACTION</div>
              <div className="text-xl font-light">{t('withdraw')}</div>
              <div className="text-[11px] text-white/50 mt-3">
                {canWithdraw ? 'Eligible for withdrawal' : `${lockupDaysRemaining} days remaining in lockup`}
              </div>
            </button>
          </div>

          {/* Yield history */}
          <div>
            <div className="text-[10px] tracking-[3px] text-white/40 mb-6">{t('yieldHistory')}</div>
            <div className="border-t border-white/10">
              {history.map((entry, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/10 text-sm">
                  <span className="font-mono text-white/60 text-xs tracking-wider">{entry.date}</span>
                  <span className="text-[10px] tracking-[2px] text-white/30">DAILY ACCRUAL</span>
                  <span className="text-emerald-400 tabular-nums">+{fmt(entry.amount)}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/30 mt-4 tracking-widest">
              FULL HISTORY AVAILABLE ON REQUEST VIA SECURE CHANNEL
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm p-6">
          <div className="w-full max-w-md p-10 bg-zinc-950 border border-white/10">
            <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2 text-center">LOCKUP POLICY</div>
            <h3 className="text-xl font-light tracking-wide mb-8 text-center">Withdrawal Request</h3>

            <div className="border border-emerald-900/40 bg-emerald-950/20 p-6 mb-6">
              <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">40-DAY LOCKUP</div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                All deposits are subject to a 40-day lockup period from deposit date. This policy protects capital deployment into underlying assets (crude oil, fueling stations, real estate).
              </p>
            </div>

            <div className="space-y-2 text-[11px] text-white/60 mb-8">
              <div className="flex justify-between"><span>Deposit date:</span><span className="font-mono">{depositDate.toISOString().split('T')[0]}</span></div>
              <div className="flex justify-between"><span>Days elapsed:</span><span className="font-mono">{daysSinceDeposit}</span></div>
              <div className="flex justify-between"><span>Days remaining:</span><span className={`font-mono ${canWithdraw ? 'text-emerald-400' : 'text-amber-400'}`}>{lockupDaysRemaining}</span></div>
            </div>

            <button
              disabled={!canWithdraw}
              className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {canWithdraw ? 'Submit Request' : `Locked for ${lockupDaysRemaining} days`}
            </button>

            <button onClick={() => setShowWithdraw(false)} className="mt-6 text-[10px] tracking-widest text-white/30 hover:text-white block mx-auto">
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
