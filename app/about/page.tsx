'use client';

import { useLanguage } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Nav />

      <section className="pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-10">
          <div className="text-emerald-400 text-[10px] tracking-[3px] mb-6">{t('privateByDesign')}</div>
          <h1 className="text-6xl font-light tracking-tight mb-12">{t('aboutTitle')}<br /><span className="text-emerald-500">Aether</span></h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Aether Holdings is a private investment platform established in 2019 to serve the Board of Directors of the Securities and Exchange Commission of Nigeria.
            </p>

            <div className="grid md:grid-cols-2 gap-px bg-white/10 my-16">
              <div className="p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">MANDATE</div>
                <h3 className="text-2xl font-light mb-4">Controlled Capital Deployment</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Capital is deployed exclusively into vetted revenue-generating assets: crude oil operations, fueling stations, prime real estate, and high-ROI enterprises across West Africa.
                </p>
              </div>
              <div className="p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">GOVERNANCE</div>
                <h3 className="text-2xl font-light mb-4">Statutory Grounding</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Operations are conducted under the Constitution of the Federal Republic of Nigeria 1999 (as amended) and the Investment and Securities Act Cap. 134 s.45(1)(a), Third Schedule.
                </p>
              </div>
              <div className="p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">PRIVACY</div>
                <h3 className="text-2xl font-light mb-4">Private by Design</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  No public listings. No solicitation. Access is granted on a strict need-to-know basis to verified Board members and accredited foreign investors.
                </p>
              </div>
              <div className="p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">REACH</div>
                <h3 className="text-2xl font-light mb-4">15,000+ Investors</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Verified capital partners across Nigeria, Ghana, Senegal, Ivory Coast, Mali, Burkina Faso, Togo, Benin, Russia, China, UAE, UK, Germany, Brazil and South Africa.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-20">Three Grades</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Participation is structured into three defined grades — A ($4,500), B ($10,000), and C ($15,000) — each with a fixed monthly yield cap. Daily credits are posted at 00:00 UTC into the participant&apos;s dashboard.
            </p>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-16">Lockup</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              All deposits are subject to a 40-day lockup period. This ensures orderly deployment of capital into illiquid underlying assets and protects yield consistency.
            </p>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-16">Disclosure</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              This platform is intended solely for the Board of Directors of the Nigerian Securities and Exchange Commission and their verified accredited partners. Past performance is not indicative of future results. All investment carries risk. This page is not an offer or solicitation.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

