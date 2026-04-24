'use client';

import { useLanguage } from '@/lib/shared';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-black border-t border-white/10 py-16 sm:py-20 text-[10px] text-white/40 relative z-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">
          <div>
            <div className="text-white/80 tracking-[3px] text-xs mb-4">AETHER</div>
            <p className="leading-relaxed">{t('footerAbout')}</p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">LEGAL</div>
            <p className="leading-relaxed">{t('footerLegal')}</p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">SCOPE</div>
            <p className="leading-relaxed">{t('footerScope')}</p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">{t('privateByDesign')}</div>
            <p className="leading-relaxed">{t('footerPrivacy')}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-2 sm:justify-between text-[9px] tracking-widest text-white/30">
          <span>{t('footerCopyright')}</span>
          <span>{t('footerDisclaimer')}</span>
        </div>
      </div>
    </footer>
  );
}
