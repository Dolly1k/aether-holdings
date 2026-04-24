'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Tier {
  grade: string;
  amountUSD: number;
  monthlyCapUSD: number;
  dailyYieldUSD: number;
}

export const tiers: Tier[] = [
  { grade: 'A', amountUSD: 4500, monthlyCapUSD: 1300, dailyYieldUSD: 43 },
  { grade: 'B', amountUSD: 10000, monthlyCapUSD: 3000, dailyYieldUSD: 100 },
  { grade: 'C', amountUSD: 15000, monthlyCapUSD: 6000, dailyYieldUSD: 200 },
];

export const translations = {
  en: {
    navInvestments: 'INVESTMENTS',
    navDashboard: 'DASHBOARD',
    navAbout: 'ABOUT',
    navContact: 'CONTACT',
    navMandate: 'MANDATE',
    heroSubtitle: 'Private investment platform for the Board of Directors of the Securities and Exchange Commission of Nigeria',
    accessDashboard: 'ACCESS DASHBOARD',
    makeDeposit: 'MAKE CRYPTO DEPOSIT',
    gradesTitle: 'Three Grades of Participation',
    monthlyCap: 'monthly cap',
    signIn: 'SIGN IN',
    signUp: 'SIGN UP',
    emailPlaceholder: 'Board email address',
    sendCode: 'Send Code',
    enterCode: 'Enter 6-digit code',
    verify: 'Verify',
    logout: 'LOGOUT',
    privateByDesign: 'PRIVATE BY DESIGN',
    needToKnow: 'NEED-TO-KNOW BASIS',
    close: 'Close',
    continueDeposit: 'Continue to Deposit',
    withdraw: 'Request Withdrawal',
    lockup: '40-day lockup period from deposit date',
    balance: 'CURRENT BALANCE',
    todayYield: 'Today\'s Yield',
    yieldHistory: 'YIELD HISTORY',
    deposit: 'Deposit',
    loggedInAs: 'Signed in as',
    // Page specific
    aboutTitle: 'About Aether',
    contactTitle: 'Contact',
    secureEmail: 'Secure Email',
    legalTitle: 'BOARD OF DIRECTORS PLATFORM',
    legalText: 'This platform operates exclusively under the Constitution of the Federal Republic of Nigeria 1999 (as amended) and Investment and Securities Act Cap. 134 s.45(1)(a). Restricted to authorized personnel only. All investments carry risk. Past performance is not indicative of future results.',
  },
  ru: {
    navInvestments: 'ИНВЕСТИЦИИ',
    navDashboard: 'ДАШБОРД',
    navAbout: 'О НАС',
    navContact: 'КОНТАКТЫ',
    navMandate: 'МАНДАТ',
    heroSubtitle: 'Частная инвестиционная платформа для Совета директоров Комиссии по ценным бумагам и биржам Нигерии',
    accessDashboard: 'ДОСТУП К ДАШБОРДУ',
    makeDeposit: 'ДЕПОЗИТ',
    gradesTitle: 'Три уровня участия',
    monthlyCap: 'месячный лимит',
    signIn: 'ВОЙТИ',
    signUp: 'РЕГИСТРАЦИЯ',
    emailPlaceholder: 'Email совета',
    sendCode: 'Отправить код',
    enterCode: 'Введите 6-значный код',
    verify: 'Подтвердить',
    logout: 'ВЫЙТИ',
    privateByDesign: 'ЧАСТНЫЙ ПО ДИЗАЙНУ',
    needToKnow: 'ТОЛЬКО ПО НЕОБХОДИМОСТИ',
    close: 'Закрыть',
    continueDeposit: 'Продолжить',
    withdraw: 'Вывод',
    lockup: 'Блокировка 40 дней с даты депозита',
    balance: 'ТЕКУЩИЙ БАЛАНС',
    todayYield: 'Доход сегодня',
    yieldHistory: 'История доходов',
    deposit: 'Депозит',
    loggedInAs: 'Вошли как',
    // Page specific
    aboutTitle: 'О Aether',
    contactTitle: 'Контакты',
    secureEmail: 'Защищённый email',
    legalTitle: 'ПЛАТФОРМА ДЛЯ СОВЕТА ДИРЕКТОРОВ',
    legalText: 'Эта платформа работает исключительно в соответствии с Конституцией Федеративной Республики Нигерия 1999 года (с изменениями) и Законом об инвестициях и ценных бумагах Cap. 134 s.45(1)(a). Только для уполномоченных лиц. Все инвестиции несут риск. Прошлые результаты не гарантируют будущие.',
  }
};

export type Lang = 'en' | 'ru';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('aether_email') : null;
    if (stored) {
      setIsLoggedIn(true);
      setUserEmail(stored);
    }
  }, []);

  const login = (email: string) => {
    localStorage.setItem('aether_email', email);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('aether_email');
    setIsLoggedIn(false);
    setUserEmail('');
  };

  return { isLoggedIn, userEmail, login, logout };
}

export function useLanguage() {
  const [language, setLanguage] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('aether_lang') as Lang;
    if (stored) setLanguage(stored);
    else {
      const lang = navigator.language.toLowerCase();
      if (lang.includes('ru')) setLanguage('ru');
    }
  }, []);

  const toggle = () => {
    const next = language === 'en' ? 'ru' : 'en';
    setLanguage(next);
    localStorage.setItem('aether_lang', next);
  };

  return { language, toggle, t: (k: keyof typeof translations['en']) => translations[language][k] };
}

export function useCurrency() {
  const [currency, setCurrency] = useState('$');
  useEffect(() => {
    const lang = navigator.language.toLowerCase();
    if (lang.includes('ru')) setCurrency('₽');
    else if (lang.includes('ng')) setCurrency('₦');
    else setCurrency('$');
  }, []);

  const usdToLocal = (usd: number) => {
    if (currency === '₦') return Math.round(usd * 1600);
    if (currency === '₽') return Math.round(usd * 92);
    return usd;
  };

  const fmt = (usd: number) => `${currency}${usdToLocal(usd).toLocaleString()}`;
  return { currency, usdToLocal, fmt };
}
