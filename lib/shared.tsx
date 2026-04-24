'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
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
    // Nav
    navInvestments: 'INVESTMENTS',
    navDashboard: 'DASHBOARD',
    navAbout: 'ABOUT',
    navContact: 'CONTACT',
    navMandate: 'MANDATE',
    signIn: 'SIGN IN',
    signUp: 'SIGN UP',
    logout: 'LOGOUT',
    // Hero
    heroSubtitle: 'Private investment platform for the Board of Directors of the Securities and Exchange Commission of Nigeria',
    accessDashboard: 'ACCESS DASHBOARD',
    makeDeposit: 'MAKE CRYPTO DEPOSIT',
    est2019Badge: 'EST. 2019',
    exclusiveBadge: 'NEED-TO-KNOW BASIS • EXCLUSIVE BY DESIGN',
    activeSinceBadge: 'ACTIVE SINCE 2019 • 40-DAY LOCKUP',
    // Investments section
    gradesTitle: 'Three Grades of Participation',
    monthlyCap: 'monthly cap',
    crudeOil: 'Crude Oil • Fueling Stations',
    realEstate: 'Prime Real Estate',
    enterprises: 'High-ROI Enterprises',
    // Mandate section
    globalMandate: 'GLOBAL MANDATE',
    accreditedCapital: 'Accredited capital from Nigeria, Ghana, Senegal, Ivory Coast, Mali, Burkina Faso, Togo, Benin, Russia, China, UAE, United Kingdom, Germany, Brazil and South Africa.',
    // Auth
    emailPlaceholder: 'Board email address',
    sendCode: 'Send Code',
    enterCode: 'Enter 6-digit code',
    verify: 'Verify',
    close: 'Close',
    privateByDesign: 'PRIVATE BY DESIGN',
    needToKnow: 'NEED-TO-KNOW BASIS',
    // About page
    aboutTitle: 'About',
    aboutIntro: 'Aether Holdings is a private investment platform established in 2019 to serve the Board of Directors of the Securities and Exchange Commission of Nigeria.',
    mandateLabel: 'MANDATE',
    governanceLabel: 'GOVERNANCE',
    privacyLabel: 'PRIVACY',
    reachLabel: 'REACH',
    mandateText: 'Capital is deployed exclusively into vetted revenue-generating assets: crude oil operations, fueling stations, prime real estate, and high-ROI enterprises across West Africa.',
    governanceText: 'Operations are conducted under the Constitution of the Federal Republic of Nigeria 1999 (as amended) and the Investment and Securities Act Cap. 134 s.45(1)(a), Third Schedule.',
    privacyText: 'No public listings. No solicitation. Access is granted on a strict need-to-know basis to verified Board members and accredited foreign investors.',
    reachText: 'Verified capital partners across Nigeria, Ghana, Senegal, Ivory Coast, Mali, Burkina Faso, Togo, Benin, Russia, China, UAE, UK, Germany, Brazil and South Africa.',
    threeGradesText: 'Participation is structured into three defined grades — A ($4,500), B ($10,000), and C ($15,000) — each with a fixed monthly yield cap. Daily credits are posted at 00:00 UTC into the participant\'s dashboard.',
    lockupAboutText: 'All deposits are subject to a 40-day lockup period. This ensures orderly deployment of capital into illiquid underlying assets and protects yield consistency.',
    disclosureText: 'This platform is intended solely for the Board of Directors of the Nigerian Securities and Exchange Commission and their verified accredited partners. Past performance is not indicative of future results. All investment carries risk. This page is not an offer or solicitation.',
    // Contact page
    contactTitle: 'Contact',
    contactChannel: 'SECURE CHANNEL',
    contactIntro: 'All communication is confidential. For board-level inquiries or verification, use the encrypted form below.',
    secureEmail: 'SECURE EMAIL',
    jurisdiction: 'JURISDICTION',
    jurisdictionVal: 'Federal Republic of Nigeria',
    responseWindow: 'RESPONSE WINDOW',
    responseWindowVal: '24–72 hours (board members)\n5–10 days (new inquiries)',
    contactNoteLabel: 'NOTE',
    contactNoteText: 'Unverified inquiries without a board referral are reviewed quarterly. This platform does not conduct public outreach.',
    formName: 'Full name',
    formEmail: 'Email address',
    formSubject: 'Subject',
    formMessage: 'Message',
    formSend: 'SEND SECURELY',
    formSent: 'MESSAGE RECEIVED',
    transmissionsLogged: 'ALL TRANSMISSIONS ARE LOGGED. DO NOT INCLUDE SENSITIVE CREDENTIALS.',
    // Dashboard
    balance: 'CURRENT BALANCE',
    todayYield: 'Today\'s Yield',
    yieldHistory: 'YIELD HISTORY',
    deposit: 'Deposit',
    withdraw: 'Request Withdrawal',
    loggedInAs: 'Signed in as',
    usdBase: 'USD BASE',
    creditedUtc: 'CREDITED 00:00 UTC',
    dailyAccrual: 'DAILY ACCRUAL',
    fullHistoryNote: 'FULL HISTORY AVAILABLE ON REQUEST VIA SECURE CHANNEL',
    autoCredited: 'USDT • BTC • Auto-credited on confirmation',
    eligibleWithdraw: 'Eligible for withdrawal',
    daysRemainingLockup: 'days remaining in lockup',
    lockupPolicy: 'LOCKUP POLICY',
    withdrawalRequestTitle: 'Withdrawal Request',
    fortyDayLockup: '40-DAY LOCKUP',
    lockupPolicyText: 'All deposits are subject to a 40-day lockup period from deposit date. This policy protects capital deployment into underlying assets (crude oil, fueling stations, real estate).',
    depositDateLabel: 'Deposit date:',
    daysElapsedLabel: 'Days elapsed:',
    daysRemainingLabel: 'Days remaining:',
    submitRequest: 'Submit Request',
    lockedFor: 'Locked for',
    days: 'days',
    continueDeposit: 'Continue to Deposit',
    lockup: '40-day lockup period from deposit date',
    // Footer
    footerAbout: 'Private investment authority. Est. 2019. Restricted platform.',
    footerLegal: 'Constitution of the Federal Republic of Nigeria 1999 (as amended) • Investment and Securities Act Cap. 134 s.45(1)(a) • Third Schedule',
    footerScope: 'Exclusively for the Board of Directors of the Securities and Exchange Commission of Nigeria and accredited foreign investors.',
    footerPrivacy: 'Access granted on a need-to-know basis. All activity logged.',
    footerCopyright: '© 2019–2026 AETHER HOLDINGS',
    footerDisclaimer: 'PAST PERFORMANCE DOES NOT GUARANTEE FUTURE RESULTS',
    // Legal
    legalTitle: 'BOARD OF DIRECTORS PLATFORM',
    legalText: 'This platform operates exclusively under the Constitution of the Federal Republic of Nigeria 1999 (as amended) and Investment and Securities Act Cap. 134 s.45(1)(a). Restricted to authorized personnel only. All investments carry risk. Past performance is not indicative of future results.',
  },
  ru: {
    // Nav
    navInvestments: 'ИНВЕСТИЦИИ',
    navDashboard: 'ДАШБОРД',
    navAbout: 'О НАС',
    navContact: 'КОНТАКТЫ',
    navMandate: 'МАНДАТ',
    signIn: 'ВОЙТИ',
    signUp: 'РЕГИСТРАЦИЯ',
    logout: 'ВЫЙТИ',
    // Hero
    heroSubtitle: 'Частная инвестиционная платформа для Совета директоров Комиссии по ценным бумагам и биржам Нигерии',
    accessDashboard: 'ДОСТУП К ДАШБОРДУ',
    makeDeposit: 'СДЕЛАТЬ ДЕПОЗИТ',
    est2019Badge: 'ОСН. 2019',
    exclusiveBadge: 'ТОЛЬКО ПО НЕОБХОДИМОСТИ • ЭКСКЛЮЗИВНО',
    activeSinceBadge: 'АКТИВНО С 2019 • 40-ДНЕВНАЯ БЛОКИРОВКА',
    // Investments section
    gradesTitle: 'Три уровня участия',
    monthlyCap: 'месячный лимит',
    crudeOil: 'Нефть • Заправочные станции',
    realEstate: 'Элитная недвижимость',
    enterprises: 'Высокодоходные предприятия',
    // Mandate section
    globalMandate: 'ГЛОБАЛЬНЫЙ МАНДАТ',
    accreditedCapital: 'Аккредитованный капитал из Нигерии, Ганы, Сенегала, Кот-д\'Ивуара, Мали, Буркина-Фасо, Того, Бенина, России, Китая, ОАЭ, Великобритании, Германии, Бразилии и Южной Африки.',
    // Auth
    emailPlaceholder: 'Email совета',
    sendCode: 'Отправить код',
    enterCode: 'Введите 6-значный код',
    verify: 'Подтвердить',
    close: 'Закрыть',
    privateByDesign: 'ЧАСТНЫЙ ПО ДИЗАЙНУ',
    needToKnow: 'ТОЛЬКО ПО НЕОБХОДИМОСТИ',
    // About page
    aboutTitle: 'О компании',
    aboutIntro: 'Aether Holdings — частная инвестиционная платформа, основанная в 2019 году для обслуживания Совета директоров Комиссии по ценным бумагам и биржам Нигерии.',
    mandateLabel: 'МАНДАТ',
    governanceLabel: 'УПРАВЛЕНИЕ',
    privacyLabel: 'КОНФИДЕНЦИАЛЬНОСТЬ',
    reachLabel: 'ОХВАТ',
    mandateText: 'Капитал направляется исключительно в проверенные активы: нефтяные операции, заправочные станции, элитную недвижимость и высокодоходные предприятия по всей Западной Африке.',
    governanceText: 'Деятельность осуществляется в соответствии с Конституцией Федеративной Республики Нигерия 1999 года (с изменениями) и Законом об инвестициях и ценных бумагах Cap. 134 s.45(1)(a), Третье Приложение.',
    privacyText: 'Без публичных листингов. Без привлечения. Доступ предоставляется верифицированным членам Совета и аккредитованным иностранным инвесторам на строгой основе необходимости знания.',
    reachText: 'Верифицированные партнёры по капиталу из Нигерии, Ганы, Сенегала, Кот-д\'Ивуара, Мали, Буркина-Фасо, Того, Бенина, России, Китая, ОАЭ, Великобритании, Германии, Бразилии и Южной Африки.',
    threeGradesText: 'Участие структурировано в три уровня — A ($4,500), B ($10,000) и C ($15,000) — каждый с фиксированным ежемесячным лимитом доходности. Ежедневные зачисления производятся в 00:00 UTC на дашборд участника.',
    lockupAboutText: 'Все депозиты подлежат 40-дневному периоду блокировки. Это обеспечивает упорядоченное размещение капитала в неликвидных базовых активах и защищает стабильность доходности.',
    disclosureText: 'Эта платформа предназначена исключительно для Совета директоров Нигерийской комиссии по ценным бумагам и биржам и их верифицированных аккредитованных партнёров. Прошлые результаты не являются показателем будущих результатов. Все инвестиции несут риск.',
    // Contact page
    contactTitle: 'Контакты',
    contactChannel: 'ЗАЩИЩЁННЫЙ КАНАЛ',
    contactIntro: 'Все переговоры конфиденциальны. Для запросов уровня совета директоров или верификации используйте зашифрованную форму ниже.',
    secureEmail: 'ЗАЩИЩЁННЫЙ EMAIL',
    jurisdiction: 'ЮРИСДИКЦИЯ',
    jurisdictionVal: 'Федеративная Республика Нигерия',
    responseWindow: 'ОКНО ОТВЕТА',
    responseWindowVal: '24–72 часа (члены совета)\n5–10 дней (новые запросы)',
    contactNoteLabel: 'ПРИМЕЧАНИЕ',
    contactNoteText: 'Неверифицированные запросы без рекомендации совета рассматриваются ежеквартально. Платформа не ведёт публичную деятельность.',
    formName: 'Полное имя',
    formEmail: 'Адрес email',
    formSubject: 'Тема',
    formMessage: 'Сообщение',
    formSend: 'ОТПРАВИТЬ ЗАЩИЩЁННО',
    formSent: 'СООБЩЕНИЕ ПОЛУЧЕНО',
    transmissionsLogged: 'ВСЕ ПЕРЕДАЧИ РЕГИСТРИРУЮТСЯ. НЕ ВКЛЮЧАЙТЕ КОНФИДЕНЦИАЛЬНЫЕ ДАННЫЕ.',
    // Dashboard
    balance: 'ТЕКУЩИЙ БАЛАНС',
    todayYield: 'Доход сегодня',
    yieldHistory: 'ИСТОРИЯ ДОХОДОВ',
    deposit: 'Депозит',
    withdraw: 'Запрос на вывод',
    loggedInAs: 'Вошли как',
    usdBase: 'БАЗА USD',
    creditedUtc: 'ЗАЧИСЛЕНО 00:00 UTC',
    dailyAccrual: 'ЕЖЕДНЕВНОЕ НАЧИСЛЕНИЕ',
    fullHistoryNote: 'ПОЛНАЯ ИСТОРИЯ ДОСТУПНА ПО ЗАПРОСУ',
    autoCredited: 'USDT • BTC • Автозачисление после подтверждения',
    eligibleWithdraw: 'Доступно для вывода',
    daysRemainingLockup: 'дней до разблокировки',
    lockupPolicy: 'ПОЛИТИКА БЛОКИРОВКИ',
    withdrawalRequestTitle: 'Запрос на вывод',
    fortyDayLockup: 'БЛОКИРОВКА 40 ДНЕЙ',
    lockupPolicyText: 'Все депозиты подлежат 40-дневному периоду блокировки с даты депозита. Эта политика защищает размещение капитала в базовых активах (нефть, заправки, недвижимость).',
    depositDateLabel: 'Дата депозита:',
    daysElapsedLabel: 'Прошло дней:',
    daysRemainingLabel: 'Осталось дней:',
    submitRequest: 'Отправить запрос',
    lockedFor: 'Заблокировано на',
    days: 'дней',
    continueDeposit: 'Продолжить',
    lockup: 'Блокировка 40 дней с даты депозита',
    // Footer
    footerAbout: 'Частный инвестиционный центр. Осн. 2019. Ограниченная платформа.',
    footerLegal: 'Конституция ФРН 1999 года (с изменениями) • Закон об инвестициях и ценных бумагах Cap. 134 s.45(1)(a) • Третье Приложение',
    footerScope: 'Исключительно для Совета директоров Комиссии по ценным бумагам и биржам Нигерии и аккредитованных иностранных инвесторов.',
    footerPrivacy: 'Доступ предоставляется по принципу необходимости знания. Вся активность регистрируется.',
    footerCopyright: '© 2019–2026 AETHER HOLDINGS',
    footerDisclaimer: 'ПРОШЛЫЕ РЕЗУЛЬТАТЫ НЕ ГАРАНТИРУЮТ БУДУЩИХ РЕЗУЛЬТАТОВ',
    // Legal
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

type LangCtx = {
  language: Lang;
  toggle: () => void;
  t: (k: keyof typeof translations['en']) => string;
};

const LanguageContext = createContext<LangCtx>({
  language: 'en',
  toggle: () => {},
  t: (k) => translations['en'][k],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('aether_lang') as Lang;
    if (stored && (stored === 'en' || stored === 'ru')) {
      setLanguage(stored);
    } else {
      const lang = navigator.language.toLowerCase();
      if (lang.includes('ru')) setLanguage('ru');
    }
  }, []);

  const toggle = () => {
    const next: Lang = language === 'en' ? 'ru' : 'en';
    setLanguage(next);
    localStorage.setItem('aether_lang', next);
  };

  return (
    <LanguageContext.Provider value={{ language, toggle, t: (k) => translations[language][k] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export interface CurrencyInfo {
  symbol: string;
  code: string;
  rate: number;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  NG: { symbol: '₦', code: 'NGN', rate: 1600 },
  RU: { symbol: '₽', code: 'RUB', rate: 92 },
  AE: { symbol: 'د.إ', code: 'AED', rate: 3.67 },
  GH: { symbol: 'GH₵', code: 'GHS', rate: 15 },
  ZA: { symbol: 'R', code: 'ZAR', rate: 18 },
  GB: { symbol: '£', code: 'GBP', rate: 0.79 },
  DE: { symbol: '€', code: 'EUR', rate: 0.92 },
  FR: { symbol: '€', code: 'EUR', rate: 0.92 },
  CN: { symbol: '¥', code: 'CNY', rate: 7.2 },
  BR: { symbol: 'R$', code: 'BRL', rate: 5 },
};

export function useCurrency() {
  const [info, setInfo] = useState<CurrencyInfo>({ symbol: '$', code: 'USD', rate: 1 });

  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(({ country }) => {
        const match = CURRENCY_MAP[country];
        if (match) setInfo(match);
      })
      .catch(() => {});
  }, []);

  const fmt = (usd: number) => {
    const local = info.rate === 1 ? usd : Math.round(usd * info.rate);
    return `${info.symbol}${local.toLocaleString()}`;
  };

  return { currency: info.symbol, currencyCode: info.code, usdToLocal: (usd: number) => Math.round(usd * info.rate), fmt };
}
