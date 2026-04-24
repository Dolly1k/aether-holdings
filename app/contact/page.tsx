'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/shared';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CONTACT]', form);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Nav />

      <section className="pt-32 sm:pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-10">
          <div className="text-emerald-400 text-[10px] tracking-[3px] mb-6">{t('contactChannel')}</div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-6">{t('contactTitle')}</h1>
          <p className="text-white/50 text-sm mb-12 sm:mb-16 max-w-lg">{t('contactIntro')}</p>

          <div className="grid lg:grid-cols-5 gap-10 sm:gap-12">
            <div className="lg:col-span-2 space-y-8 sm:space-y-10">
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">{t('secureEmail')}</div>
                <div className="text-sm font-mono text-emerald-400">board@aether.holdings</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">{t('jurisdiction')}</div>
                <div className="text-sm text-white/70">{t('jurisdictionVal')}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">{t('responseWindow')}</div>
                <div className="text-sm text-white/70 whitespace-pre-line">{t('responseWindowVal')}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">{t('contactNoteLabel')}</div>
                <div className="text-sm text-white/70 leading-relaxed">{t('contactNoteText')}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder={t('formName')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                />
                <input
                  required
                  type="email"
                  placeholder={t('formEmail')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>
              <input
                required
                placeholder={t('formSubject')}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
              />
              <textarea
                required
                rows={6}
                placeholder={t('formMessage')}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700 resize-none"
              />

              <button
                type="submit"
                disabled={sent}
                className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors disabled:opacity-50"
              >
                {sent ? t('formSent') : t('formSend')}
              </button>

              <p className="text-[10px] text-white/30 tracking-widest">{t('transmissionsLogged')}</p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
