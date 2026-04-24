'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLanguage, useCurrency, tiers } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import DepositModal from '@/components/DepositModal';

interface DashboardData {
  balance: number;
  tier: string;
  dailyYield: number;
  monthlyCap: number;
  lastYield: number | null;
  depositDate: number | null;
}

export default function Dashboard() {
  const { isLoggedIn, userEmail } = useAuth();
  const { t } = useLanguage();
  const { fmt } = useCurrency();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push('/');
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (mounted && isLoggedIn && userEmail) {
      fetch(`/api/dashboard?email=${encodeURIComponent(userEmail)}`)
        .then(r => r.json())
        .then(d => {
          if (!d.error) setData(d);
        })
        .catch(() => {});
    }
  }, [mounted, isLoggedIn, userEmail]);

  if (!mounted || !isLoggedIn) return <div className="min-h-screen bg-[#050505]" />;

  const tier = tiers.find(t => t.grade === (data?.tier || 'A')) || tiers[0];
  const balance = data?.balance ?? 0;
  const dailyYield = data?.dailyYield ?? tier.dailyYieldUSD;
  const monthlyCap = data?.monthlyCap ?? tier.monthlyCapUSD;

  const depositTimestamp = data?.depositDate || data?.lastYield;
  const depositDate = depositTimestamp ? new Date(depositTimestamp) : null;
  const daysSinceDeposit = depositDate ? Math.floor((Date.now() - depositDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const lockupDaysRemaining = depositDate ? Math.max(0, 40 - daysSinceDeposit) : 40;
  const canWithdraw = lockupDaysRemaining === 0 && balance > 0;

  // Build yield history from lastYield backwards (simulated daily entries)
  const history: { date: string; amount: number }[] = [];
  if (depositDate && balance > 0) {
    for (let i = 0; i < Math.min(7, daysSinceDeposit); i++) {
      const d = new Date(Date.now() - i * 86400000);
      history.push({ date: d.toISOString().split('T')[0], amount: dailyYield });
    }
  }

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 mb-10 sm:mb-16">
            <div className="p-6 sm:p-8 lg:p-10 bg-[#050505]">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">{t('balance')}</div>
              <div className="text-4xl sm:text-5xl font-light text-emerald-400 tabular-nums">{fmt(balance)}</div>
              <div className="text-[10px] tracking-widest text-white/30 mt-2">{t('usdBase')}</div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 bg-[#050505]">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">{t('todayYield').toUpperCase()}</div>
              <div className="text-4xl sm:text-5xl font-light tabular-nums">
                {balance > 0 ? <>+{fmt(dailyYield)}</> : <span className="text-white/20">—</span>}
              </div>
              <div className="text-[10px] tracking-widest text-emerald-400 mt-2">{t('creditedUtc')}</div>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 bg-[#050505] sm:col-span-2 lg:col-span-1">
              <div className="text-[10px] tracking-[3px] text-white/40 mb-3 sm:mb-4">MONTHLY CAP</div>
              <div className="text-4xl sm:text-5xl font-light tabular-nums">
                {balance > 0 ? fmt(monthlyCap) : <span className="text-white/20">—</span>}
              </div>
              <div className="text-[10px] tracking-widest text-white/30 mt-2">GRADE {tier.grade}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10 sm:mb-16">
            <button
              onClick={() => setShowDeposit(true)}
              className="p-6 sm:p-8 bg-emerald-900 hover:bg-emerald-700 transition-colors text-left"
            >
              <div className="text-[10px] tracking-[3px] text-emerald-300 mb-2">ACTION</div>
              <div className="text-xl font-light">{t('deposit')}</div>
              <div className="text-[11px] text-emerald-200/70 mt-3">{t('autoCredited')}</div>
            </button>

            <button
              onClick={() => setShowWithdraw(true)}
              className="p-6 sm:p-8 border border-white/10 hover:border-white/30 transition-colors text-left"
            >
              <div className="text-[10px] tracking-[3px] text-white/40 mb-2">ACTION</div>
              <div className="text-xl font-light">{t('withdraw')}</div>
              <div className="text-[11px] text-white/50 mt-3">
                {canWithdraw ? t('eligibleWithdraw') : `${lockupDaysRemaining} ${t('daysRemainingLockup')}`}
              </div>
            </button>
          </div>

          {/* Yield history */}
          <div>
            <div className="text-[10px] tracking-[3px] text-white/40 mb-6">{t('yieldHistory')}</div>
            <div className="border-t border-white/10">
              {history.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-white/30 tracking-widest">
                  {t('deposit').toUpperCase()} TO BEGIN ACCRUAL
                </div>
              ) : history.map((entry, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b border-white/10 text-sm">
                  <span className="font-mono text-white/60 text-xs tracking-wider">{entry.date}</span>
                  <span className="text-[10px] tracking-[2px] text-white/30">{t('dailyAccrual')}</span>
                  <span className="text-emerald-400 tabular-nums">+{fmt(entry.amount)}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/30 mt-4 tracking-widest">{t('fullHistoryNote')}</div>
          </div>

        </div>
      </div>

      <Footer />

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm p-5">
          <div className="w-full max-w-md p-8 sm:p-10 bg-zinc-950 border border-white/10">
            <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2 text-center">{t('lockupPolicy')}</div>
            <h3 className="text-xl font-light tracking-wide mb-8 text-center">{t('withdrawalRequestTitle')}</h3>

            <div className="border border-emerald-900/40 bg-emerald-950/20 p-6 mb-6">
              <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">{t('fortyDayLockup')}</div>
              <p className="text-[11px] text-white/70 leading-relaxed">{t('lockupPolicyText')}</p>
            </div>

            <div className="space-y-2 text-[11px] text-white/60 mb-8">
              <div className="flex justify-between">
                <span>{t('depositDateLabel')}</span>
                <span className="font-mono">{depositDate?.toISOString().split('T')[0] ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('daysElapsedLabel')}</span>
                <span className="font-mono">{daysSinceDeposit}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('daysRemainingLabel')}</span>
                <span className={`font-mono ${canWithdraw ? 'text-emerald-400' : 'text-amber-400'}`}>{lockupDaysRemaining}</span>
              </div>
            </div>

            <button
              disabled={!canWithdraw}
              className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {canWithdraw ? t('submitRequest') : `${t('lockedFor')} ${lockupDaysRemaining} ${t('days')}`}
            </button>

            <button onClick={() => setShowWithdraw(false)} className="mt-6 text-[10px] tracking-widest text-white/30 hover:text-white block mx-auto">
              {t('close').toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
