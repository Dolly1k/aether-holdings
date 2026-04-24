'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLanguage, useCurrency, tiers, translations } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import WorldMap from '@/components/WorldMap';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const { language, t } = useLanguage();
  const { fmt } = useCurrency();
  const router = useRouter();

  const [showLogin, setShowLogin] = useState(false);

  const handleDashboard = () => {
    if (isLoggedIn) router.push('/dashboard');
    else setShowLogin(true);
  };

  const handleDeposit = () => {
    if (isLoggedIn) router.push('/dashboard');
    else setShowLogin(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative">
      <Nav />

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a3d2e_0%,transparent_40%)] opacity-30"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')] bg-cover bg-center opacity-[0.04]"></div>

        <div className="max-w-6xl mx-auto px-10 text-center relative z-10">
          <div className="inline-flex items-center gap-3 border border-emerald-900/60 text-emerald-300 text-[10px] tracking-[4px] px-6 py-2 mb-12">
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            EST. 2019 • {t('privateByDesign')}
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
          </div>

          <h1 className="text-[96px] leading-[0.9] font-medium tracking-[-0.04em] mb-8 text-white">
            AETHER<br /><span className="text-emerald-500">HOLDINGS</span>
          </h1>

          <p className="max-w-xl mx-auto text-base text-white/60 mb-14 leading-relaxed">
            {translations[language].heroSubtitle}
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={handleDashboard} className="bg-emerald-900 hover:bg-emerald-700 px-10 py-4 text-[11px] tracking-[3px] transition-all border border-emerald-800">
              {t('accessDashboard')}
            </button>
            <button onClick={handleDeposit} className="border border-white/20 hover:bg-white/5 px-10 py-4 text-[11px] tracking-[3px] transition-all">
              {t('makeDeposit')}
            </button>
          </div>

          <div className="mt-20 text-[10px] tracking-[3px] text-white/30">
            NEED-TO-KNOW BASIS • EXCLUSIVE BY DESIGN
          </div>
        </div>
      </section>

      {/* INVESTMENTS */}
      <section id="investments" className="py-32 border-t border-white/10 relative">
        <div className="max-w-6xl mx-auto px-10">
          <div className="text-center mb-24">
            <p className="text-emerald-400 text-[10px] tracking-[3px] mb-3">INVESTMENT AND SECURITIES ACT (CAP. 134) S.45(1)(a)</p>
            <h2 className="text-5xl font-light tracking-tight">{t('gradesTitle')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {tiers.map(tier => (
              <div key={tier.grade} className="group p-10 bg-[#050505] hover:bg-zinc-950 transition-all">
                <div className="text-[10px] tracking-[3px] text-white/40 mb-8">GRADE {tier.grade}</div>
                <div className="text-5xl font-light tracking-tight mb-2">{fmt(tier.amountUSD)}</div>
                <div className="text-emerald-400 text-2xl font-light mb-10">
                  +{fmt(tier.monthlyCapUSD)} <span className="text-[10px] text-white/40 tracking-widest uppercase">{t('monthlyCap')}</span>
                </div>
                <div className="text-xs text-white/60 leading-loose border-t border-white/10 pt-6">
                  Crude Oil • Fueling Stations<br />
                  Prime Real Estate<br />
                  High-ROI Enterprises
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-[10px] tracking-[3px] text-white/30">
            ACTIVE SINCE 2019 • 40-DAY LOCKUP
          </div>
        </div>
      </section>

      {/* MANDATE */}
      <section id="mandate" className="py-32 border-t border-white/10 relative bg-zinc-950/30">
        <div className="max-w-6xl mx-auto px-10 grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5">
            <div className="text-emerald-400 text-[10px] tracking-[3px] mb-4">GLOBAL MANDATE</div>
            <h3 className="text-5xl leading-[1.05] font-light tracking-tight mb-6">15,000+<br />investors<br />since 2019</h3>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              Accredited capital from Nigeria, Ghana, Senegal, Ivory Coast, Mali, Burkina Faso, Togo, Benin, Russia, China, UAE, United Kingdom, Germany, Brazil and South Africa.
            </p>
          </div>
          <div className="md:col-span-7">
            <WorldMap />
          </div>
        </div>
      </section>

      <Footer />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
