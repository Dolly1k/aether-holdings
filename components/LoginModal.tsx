'use client';

import { useState } from 'react';
import { useAuth, useLanguage } from '@/lib/shared';
import { useRouter } from 'next/navigation';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'send-code' }),
      });
      const data = await res.json();
      if (data.success) setCodeSent(true);
      else setError(data.error || 'Failed to send');
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'verify', code }),
      });
      const data = await res.json();
      if (data.success) {
        login(email);
        onClose();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="w-full max-w-sm p-10 bg-zinc-950 border border-emerald-900/40 rounded-sm">
        <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2 text-center">{t('privateByDesign')}</div>
        <h3 className="text-xl font-light tracking-wide mb-8 text-center text-white/90">Board Access</h3>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full bg-transparent border border-white/10 px-4 py-3 mb-3 text-sm focus:outline-none focus:border-emerald-700 transition-colors"
          disabled={codeSent}
        />

        {!codeSent && (
          <button
            onClick={handleSend}
            disabled={isLoading || !email}
            className="w-full border border-emerald-800 hover:bg-emerald-900/30 py-3 text-[11px] tracking-[3px] uppercase disabled:opacity-40 transition-colors"
          >
            {isLoading ? '•••' : t('sendCode')}
          </button>
        )}

        {codeSent && (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              maxLength={6}
              className="w-full bg-transparent border border-white/10 px-4 py-4 text-center text-2xl tracking-[10px] mb-3 focus:outline-none focus:border-emerald-700 transition-colors font-mono"
              autoFocus
            />
            <button
              onClick={handleVerify}
              disabled={isLoading || code.length !== 6}
              className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase disabled:opacity-40 transition-colors"
            >
              {isLoading ? '•••' : t('verify')}
            </button>
            <button
              onClick={() => { setCodeSent(false); setCode(''); }}
              className="w-full mt-2 text-[10px] text-white/40 hover:text-white"
            >
              use different email
            </button>
          </>
        )}

        {error && <p className="text-red-400 text-center mt-4 text-xs">{error}</p>}

        <button onClick={onClose} className="mt-8 text-[10px] tracking-widest text-white/30 hover:text-white block mx-auto">
          {t('close').toUpperCase()}
        </button>
      </div>
    </div>
  );
}
