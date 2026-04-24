'use client';

import { LanguageProvider, CurrencyProvider } from '@/lib/shared';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </LanguageProvider>
  );
}
