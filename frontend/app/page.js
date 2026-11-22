'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { getHomeCopy } from '../utils/home-copy';
import ItemShowcase from '../components/ItemShowcase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const faqs = [
  {
    question: 'How do I register an item?',
    answer: 'Create an account, choose the type of item, then add its details such as photos, identifiers, and proof of ownership where available.',
  },
  {
    question: 'What should I do if my item is lost or stolen?',
    answer: 'Sign in to your dashboard and update the item status right away. Keeping its record current helps with verification and any possible recovery match.',
  },
  {
    question: 'I found an item. How can I help return it?',
    answer: 'Use the Report Found Item page to share the item details. We will use the information to look for a registered owner and guide a safer return.',
  },
  {
    question: 'Are my contact details visible to everyone?',
    answer: 'No. The platform is designed to support verification and matching without publicly displaying an owner’s private contact details.',
  },
  {
    question: 'Can I search for an item before creating an account?',
    answer: 'Yes. You can search available records and use verification information to check whether an item may already be registered.',
  },
];

export default function Home() {
  const { language } = usePreferences();
  const copy = getHomeCopy(language);
  const faqItems = language === 'en' ? faqs.map(({ question, answer }) => [question, answer]) : copy.faqs;
  const [stats, setStats] = useState({ totalUsers: 0, itemsTracked: 0, recoveredRate: 0, confidenceScore: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const response = await fetch(`${API_URL}/public/stats`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && payload?.data) setStats(payload.data);
      } catch (error) {
        // Keep the last known values when the API is temporarily unavailable.
      }
    };

    loadStats();
    const refreshTimer = window.setInterval(loadStats, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#10233f]">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-[#203449] bg-[#10233f] p-8 shadow-2xl shadow-[#10233f]/15 sm:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#ff9277]/40 bg-[#f46b4f]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb09e]">
                {copy.badge}
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-300">
                {copy.heroText}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/register"
                  className="rounded-full bg-[#f46b4f] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#f46b4f]/25 transition-all hover:bg-[#ff8065]"
                >
                  {copy.getStarted}
                </a>
                <a
                  href="/login"
                  className="rounded-full border border-white/25 bg-white/5 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  {copy.login}
                </a>
                <a
                  href="/search"
                  className="rounded-full border border-[#ff9277]/40 bg-[#f46b4f]/10 px-7 py-3 text-sm font-bold text-[#ffb09e] transition-all hover:bg-[#f46b4f]/20"
                >
                  {copy.searchItems}
                </a>
                <a
                  href="/found"
                  className="rounded-full border border-white/25 bg-white/5 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
                >
                  {copy.reportFound}
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-400/20 bg-slate-900/70 p-6 shadow-inner shadow-orange-500/10">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.verification}</p>
                  <p className="mt-3 text-2xl font-black text-white">{stats.confidenceScore}%</p>
                  <p className="mt-1 text-sm text-slate-300">{copy.confidence}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                    <p className="text-sm text-slate-400">{copy.tracked}</p>
                    <p className="mt-2 text-2xl font-black text-white">{stats.itemsTracked.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                    <p className="text-sm text-slate-400">{copy.recovered}</p>
                    <p className="mt-2 text-2xl font-black text-white">{stats.recoveredRate}%</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                    <p className="text-sm text-slate-400">{copy.users}</p>
                    <p className="mt-2 text-2xl font-black text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slideshow of every item type that can be registered */}
      <ItemShowcase copy={copy} language={language} />

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black sm:text-4xl mb-4">{copy.howTitle}</h2>
          <p className="text-lg text-slate-600">{copy.howText}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a
            href="/register"
            className="block rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-inherit no-underline hover:border-orange-400/30 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-black mb-3">{copy.feature1Title}</h3>
            <p className="text-slate-100">{copy.feature1Text}</p>
          </a>

          <a
            href="/dashboard/my-items"
            className="block rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-inherit no-underline hover:border-orange-400/30 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-black mb-3">{copy.feature2Title}</h3>
            <p className="text-slate-100">{copy.feature2Text}</p>
          </a>

          <a
            href="/verify"
            className="block rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-inherit no-underline hover:border-orange-400/30 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          >
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-xl font-black mb-3">{copy.feature3Title}</h3>
            <p className="text-slate-100">{copy.feature3Text}</p>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
          <span className="w-full text-sm font-semibold text-slate-400">{copy.boards}</span>
          <a href="/lost-items" className="rounded-full bg-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-400 hover:shadow-xl">
            {copy.browseLost}
          </a>
          <a href="/found-items" className="rounded-full bg-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-400 hover:shadow-xl">
            {copy.browseFound}
          </a>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="border-t border-[#dce3df] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f46b4f]">{copy.faqLabel}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{copy.faqTitle}</h2>
            <p className="mt-4 max-w-sm leading-7 text-slate-600">{copy.faqText}</p>
            <a href="/contact" className="mt-7 inline-flex text-sm font-bold text-[#f46b4f] transition hover:text-[#d9533d]">{copy.contactHelp}</a>
          </div>

          <div className="space-y-3">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-[#dce3df] bg-[#f8f9f7] px-5 py-1 transition hover:border-[#f46b4f]/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-black text-[#10233f] marker:content-none">
                  {question}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-xl font-normal text-[#f46b4f] transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-2xl pb-5 pr-10 text-sm leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-12 text-center">
          <h2 className="text-3xl font-black mb-4">{copy.ctaTitle}</h2>
          <p className="text-lg text-slate-700 mb-8">{copy.ctaText}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/register"
              className="rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-400"
            >
              {copy.createAccount}
            </a>
            <a
              href="/about"
              className="rounded-full border border-white bg-white px-8 py-4 text-base font-bold text-[#10233f] transition-all hover:border-[#f46b4f] hover:bg-[#fff0eb] hover:text-[#d9533d]"
            >
              {copy.learnMore}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
