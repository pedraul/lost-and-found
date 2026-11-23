'use client';

import Link from 'next/link';
import SocialIcons from './SocialIcons';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t-4 border-[#f46b4f] bg-gradient-to-b from-[#10233f] to-[#07172d] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Phones: two blocks per row (brand + Explore, then Reach us + Policies). */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-10 lg:grid-cols-4">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f46b4f] text-lg shadow-lg shadow-[#f46b4f]/20">
                <span>🔍</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb09e]">Kigali community</p>
                <h3 className="text-lg font-black tracking-tight text-white">Lost &amp; Found</h3>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Secure item recovery, better verification, and faster reunification for what matters most.
            </p>
          </div>

          <div className="min-w-0">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Explore</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link href="/search" className="transition-colors hover:text-white">Search items</Link></li>
              <li><Link href="/found" className="transition-colors hover:text-white">Report found item</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-white">About us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Reach us</h4>
            <p className="text-sm text-slate-300">Kigali, Rwanda</p>
            <a href="mailto:barflow01@gmail.com" className="mt-3 inline-block break-all text-sm font-medium text-orange-400 transition-colors hover:text-orange-200">
              barflow01@gmail.com
            </a>
            <a href="tel:+250780497307" className="mt-2 block text-sm font-medium text-orange-400 transition-colors hover:text-orange-200">
              +250 780 497 307
            </a>
            <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Follow us</p>
            <SocialIcons className="gap-2 sm:gap-3" />
          </div>

          <div className="min-w-0">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Policies</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy policy</Link></li>
              <li><Link href="/terms-of-use" className="transition-colors hover:text-white">Terms of use</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          © {currentYear} Lost & Found. All rights reserved.
          <span>Built for safer recoveries in Kigali.</span>
        </div>
      </div>
    </footer>
  );
}
