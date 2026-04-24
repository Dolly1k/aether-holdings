'use client';

import { LanguageProvider } from '@/lib/shared';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
