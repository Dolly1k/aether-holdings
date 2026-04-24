'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useLanguage } from '@/lib/shared';
import LoginModal from './LoginModal';

export default function Nav() {
  const { isLoggedIn, logout } = useAuth();
  const { language, toggle, t } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isLoggedIn
    ? [
        { href: '/dashboard', label: t('navDashboard') },
        { href: '/about', label: t('navAbout') },
        { href: '/contact', label: t('navContact') },
      ]
    : [
        { href: '/#investments', label: t('navInvestments') },
        { href: '/about', label: t('navAbout') },
        { href: '/#mandate', label: t('navMandate') },
        { href: '/contact', label: t('navContact') },
      ];

  return (
    <>
      <nav className="fixed top-0 w-full border-b border-white/10 bg-black/95 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4" onClick={() => setMenuOpen(false)}>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="font-medium text-lg tracking-[4px]">AETHER</span>
          </Link>

          {/* Desktop nav — hidden below lg (1024px) */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[2px] font-light">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-emerald-400 transition-colors">{l.label}</Link>
            ))}
            <button onClick={toggle} className="border border-white/20 px-3 py-1.5 text-[10px] hover:border-emerald-500 transition-colors">
              {language === 'en' ? 'РУС' : 'ENG'}
            </button>
            {isLoggedIn ? (
              <button onClick={logout} className="text-white/50 hover:text-white text-[10px]">{t('logout')}</button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="bg-emerald-900 hover:bg-emerald-700 transition-colors px-4 py-1.5 text-[10px] tracking-widest">
                {t('signIn')}
              </button>
            )}
          </div>

          {/* Hamburger — shown below lg */}
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`block w-5 h-px bg-white transition-transform origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}></span>
            <span className={`block w-5 h-px bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-px bg-white transition-transform origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}></span>
          </button>
        </div>

        {/* Mobile/tablet menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/98 px-5 py-6 flex flex-col gap-5 text-[11px] uppercase tracking-[2px]">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-emerald-400 transition-colors" onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              <button onClick={toggle} className="border border-white/20 px-3 py-1.5 text-[10px] hover:border-emerald-500 transition-colors">
                {language === 'en' ? 'РУС' : 'ENG'}
              </button>
              {isLoggedIn ? (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-white/50 hover:text-white text-[10px]">{t('logout')}</button>
              ) : (
                <button onClick={() => { setShowLogin(true); setMenuOpen(false); }} className="bg-emerald-900 hover:bg-emerald-700 transition-colors px-4 py-1.5 text-[10px] tracking-widest">
                  {t('signIn')}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
