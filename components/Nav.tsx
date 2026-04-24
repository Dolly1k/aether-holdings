'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useLanguage } from '@/lib/shared';
import LoginModal from './LoginModal';

export default function Nav() {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const { language, toggle, t } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full border-b border-white/10 bg-black/95 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-10 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="font-medium text-lg tracking-[4px]">AETHER</span>
          </Link>

          <div className="flex items-center gap-8 text-[11px] uppercase tracking-[2px] font-light">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">{t('navDashboard')}</Link>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">{t('navAbout')}</Link>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">{t('navContact')}</Link>
              </>
            ) : (
              <>
                <Link href="/#investments" className="hover:text-emerald-400 transition-colors">{t('navInvestments')}</Link>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">{t('navAbout')}</Link>
                <Link href="/#mandate" className="hover:text-emerald-400 transition-colors">{t('navMandate')}</Link>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">{t('navContact')}</Link>
              </>
            )}

            <button onClick={toggle} className="border border-white/20 px-3 py-1.5 text-[10px] hover:border-emerald-500 transition-colors">
              {language === 'en' ? 'РУС' : 'ENG'}
            </button>

            {isLoggedIn ? (
              <button onClick={logout} className="text-white/50 hover:text-white text-[10px]">
                {t('logout')}
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-emerald-900 hover:bg-emerald-700 transition-colors px-4 py-1.5 text-[10px] tracking-widest">
                {t('signIn')}
              </button>
            )}
          </div>
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
