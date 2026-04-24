'use client';

import { useLanguage } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Nav />

      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-10">
          <div className="text-emerald-400 text-[10px] tracking-[3px] mb-6">{t('privateByDesign')}</div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-10 sm:mb-12">{t('aboutTitle')}<br /><span className="text-emerald-500">Aether</span></h1>

          <div className="max-w-none">
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10">
              {t('aboutIntro')}
            </p>

            <div className="grid sm:grid-cols-2 gap-px bg-white/10 my-12 sm:my-16">
              <div className="p-6 sm:p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">{t('mandateLabel')}</div>
                <h3 className="text-xl sm:text-2xl font-light mb-4">Controlled Capital Deployment</h3>
                <p className="text-sm text-white/60 leading-relaxed">{t('mandateText')}</p>
              </div>
              <div className="p-6 sm:p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">{t('governanceLabel')}</div>
                <h3 className="text-xl sm:text-2xl font-light mb-4">Statutory Grounding</h3>
                <p className="text-sm text-white/60 leading-relaxed">{t('governanceText')}</p>
              </div>
              <div className="p-6 sm:p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">{t('privacyLabel')}</div>
                <h3 className="text-xl sm:text-2xl font-light mb-4">Private by Design</h3>
                <p className="text-sm text-white/60 leading-relaxed">{t('privacyText')}</p>
              </div>
              <div className="p-6 sm:p-10 bg-[#050505]">
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-4">{t('reachLabel')}</div>
                <h3 className="text-xl sm:text-2xl font-light mb-4">15,000+ Investors</h3>
                <p className="text-sm text-white/60 leading-relaxed">{t('reachText')}</p>
              </div>
            </div>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-20">Three Grades</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{t('threeGradesText')}</p>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-16">Lockup</h2>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{t('lockupAboutText')}</p>

            <h2 className="text-3xl font-light tracking-tight mb-6 mt-16">Disclosure</h2>
            <p className="text-sm text-white/50 leading-relaxed">{t('disclosureText')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
