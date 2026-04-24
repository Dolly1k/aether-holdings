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

      <section className="pt-40 pb-20">
        <div className="max-w-4xl mx-auto px-10">
          <div className="text-emerald-400 text-[10px] tracking-[3px] mb-6">SECURE CHANNEL</div>
          <h1 className="text-6xl font-light tracking-tight mb-6">{t('contactTitle') || 'Contact'}</h1>
          <p className="text-white/50 text-sm mb-16 max-w-lg">
            All communication is confidential. For board-level inquiries or verification, use the encrypted form below.
          </p>

          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">{t('secureEmail') || 'SECURE EMAIL'}</div>
                <div className="text-sm font-mono text-emerald-400">board@aether.holdings</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">JURISDICTION</div>
                <div className="text-sm text-white/70">Federal Republic of Nigeria</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-white/40 mb-2">RESPONSE WINDOW</div>
                <div className="text-sm text-white/70">24–72 hours (board members)<br />5–10 days (new inquiries)</div>
              </div>
              <div>
                <div className="text-[10px] tracking-[3px] text-emerald-400 mb-2">NOTE</div>
                <div className="text-sm text-white/70 leading-relaxed">
                  Unverified inquiries without a board referral are reviewed quarterly. This platform does not conduct public outreach.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
                />
              </div>
              <input
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700"
              />
              <textarea
                required
                rows={6}
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700 resize-none"
              />

              <button
                type="submit"
                disabled={sent}
                className="w-full bg-emerald-900 hover:bg-emerald-700 py-3 text-[11px] tracking-[3px] uppercase transition-colors disabled:opacity-50"
              >
                {sent ? 'MESSAGE RECEIVED' : 'SEND SECURELY'}
              </button>

              <p className="text-[10px] text-white/30 tracking-widest">
                ALL TRANSMISSIONS ARE LOGGED. DO NOT INCLUDE SENSITIVE CREDENTIALS.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
