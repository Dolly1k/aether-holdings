'use client';

import { useLanguage } from '@/lib/shared';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-black border-t border-white/10 py-20 text-[10px] text-white/40 relative z-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">
          <div>
            <div className="text-white/80 tracking-[3px] text-xs mb-4">AETHER</div>
            <p className="leading-relaxed">Private investment authority. Est. 2019. Restricted platform.</p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">LEGAL</div>
            <p className="leading-relaxed">
              Constitution of the Federal Republic of Nigeria 1999 (as amended) • Investment and Securities Act Cap. 134 s.45(1)(a) • Third Schedule
            </p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">SCOPE</div>
            <p className="leading-relaxed">Exclusively for the Board of Directors of the Securities and Exchange Commission of Nigeria and accredited foreign investors.</p>
          </div>
          <div>
            <div className="text-white/60 tracking-[2px] text-[10px] mb-4">{t('privateByDesign')}</div>
            <p className="leading-relaxed">Access granted on a need-to-know basis. All activity logged.</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-2 sm:justify-between text-[9px] tracking-widest text-white/30">
          <span>© 2019–2026 AETHER HOLDINGS</span>
          <span>PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS</span>
        </div>
      </div>
    </footer>
  );
}
