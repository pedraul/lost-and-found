'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// One slide per item type offered on the register-item form
// (DEVICE_TYPE_FORMS in app/dashboard/register-item/page.js).
// Photos live in public/items/ and are public domain / CC0 unless a credit is given.
const ITEMS = [
  { key: 'phone', category: 'electronics', name: { en: 'Phone', fr: 'Téléphone' } },
  { key: 'laptop', category: 'electronics', name: { en: 'Laptop', fr: 'Ordinateur portable' } },
  { key: 'tablet', category: 'electronics', name: { en: 'Tablet', fr: 'Tablette' } },
  { key: 'camera', category: 'electronics', name: { en: 'Camera', fr: 'Appareil photo' } },
  { key: 'tv', category: 'electronics', name: { en: 'TV', fr: 'Téléviseur' } },
  { key: 'printer', category: 'electronics', name: { en: 'Printer', fr: 'Imprimante' }, credit: 'Photo: Joydeep, CC BY-SA 3.0, via Wikimedia Commons' },
  { key: 'router', category: 'electronics', name: { en: 'Router', fr: 'Routeur' } },
  { key: 'hard_drive', category: 'electronics', name: { en: 'Hard Drive', fr: 'Disque dur' } },
  { key: 'projector', category: 'electronics', name: { en: 'Projector', fr: 'Projecteur' } },
  { key: 'solar_box', category: 'electronics', name: { en: 'Solar Box', fr: 'Kit solaire' } },
  { key: 'car', category: 'vehicles', name: { en: 'Car', fr: 'Voiture' } },
  { key: 'motorcycle', category: 'vehicles', name: { en: 'Motorcycle', fr: 'Moto' } },
  { key: 'bicycle', category: 'vehicles', name: { en: 'Bicycle', fr: 'Vélo' } },
  { key: 'truck', category: 'vehicles', name: { en: 'Truck', fr: 'Camion' } },
  { key: 'van', category: 'vehicles', name: { en: 'Van', fr: 'Fourgonnette' } },
  { key: 'passport', category: 'documents', name: { en: 'Passport', fr: 'Passeport' } },
  { key: 'national_id', category: 'documents', name: { en: 'National ID', fr: 'Carte d’identité' } },
  { key: 'speaker', category: 'audio', name: { en: 'Speaker', fr: 'Enceinte' } },
  { key: 'watch', category: 'accessories', name: { en: 'Watch', fr: 'Montre' } },
];

const CATEGORY_LABELS = {
  electronics: { en: 'Electronics', fr: 'Électronique', rw: 'Ikoranabuhanga' },
  vehicles: { en: 'Vehicles', fr: 'Véhicules', rw: 'Ibinyabiziga' },
  documents: { en: 'Documents', fr: 'Documents', rw: 'Ibyangombwa' },
  audio: { en: 'Audio', fr: 'Audio', rw: 'Ibyuma by’amajwi' },
  accessories: { en: 'Accessories', fr: 'Accessoires', rw: 'Ibikoresho byambarwa' },
};

const INTERVAL_MS = 4500;

const pick = (labels, language) => labels[language] || labels.en;

export default function ItemShowcase({ copy, language }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const touchStartX = useRef(null);
  const thumbsRef = useRef(null);
  const count = ITEMS.length;

  const go = useCallback((index) => setActive((index + count) % count), [count]);

  // Start paused for people who prefer reduced motion.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing || hovered) return undefined;
    const timer = window.setTimeout(() => go(active + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [active, playing, hovered, go]);

  // Keep the active thumbnail visible in the strip without scrolling the page.
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[active];
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') go(active - 1);
    if (event.key === 'ArrowRight') go(active + 1);
  };

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? active + 1 : active - 1);
    touchStartX.current = null;
  };

  const current = ITEMS[active];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8" aria-labelledby="item-showcase-title">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f46b4f]">{copy.showcaseLabel}</p>
          <h2 id="item-showcase-title" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.showcaseTitle}</h2>
          <p className="mt-3 text-slate-600">{copy.showcaseText}</p>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-slate-500" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {count}
        </p>
      </div>

      <div
        className="group relative overflow-hidden rounded-[28px] bg-[#10233f] shadow-2xl shadow-[#10233f]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f46b4f]"
        role="region"
        aria-roledescription="carousel"
        aria-label={copy.showcaseLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
          {ITEMS.map((item, index) => {
            const isActive = index === active;
            return (
              <div
                key={item.key}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}: ${pick(item.name, language)}`}
                aria-hidden={!isActive}
              >
                <img
                  src={`/items/${item.key}.jpg`}
                  alt={pick(item.name, language)}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`h-full w-full object-cover transition-transform duration-[5000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
                />
                {item.credit && (
                  <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/80">{item.credit}</span>
                )}
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10233f]/95 via-[#10233f]/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8 lg:p-10">
            <div key={current.key} className="animate-[showcaseIn_600ms_ease-out]">
              <span className="inline-flex rounded-full border border-[#ff9277]/40 bg-[#f46b4f]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb09e] backdrop-blur">
                {pick(CATEGORY_LABELS[current.category], language)}
              </span>
              <h3 className="mt-3 text-3xl font-black text-white sm:text-5xl">{pick(current.name, language)}</h3>
            </div>
            <a
              href="/register"
              className="self-start rounded-full bg-[#f46b4f] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#f46b4f]/25 transition-all hover:bg-[#ff8065] sm:self-auto"
            >
              {copy.registerThis} →
            </a>
          </div>

          <button
            type="button"
            onClick={() => go(active - 1)}
            className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
            aria-label={copy.previous}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
            aria-label={copy.next}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 sm:left-5 sm:top-5"
            aria-label={playing ? copy.pause : copy.play}
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Progress bar for the current slide */}
        <div className="h-1 w-full bg-white/10">
          <div
            key={`${active}-${playing && !hovered}`}
            className="h-full bg-[#f46b4f]"
            style={
              playing && !hovered
                ? { animation: `showcaseProgress ${INTERVAL_MS}ms linear forwards` }
                : { width: `${((active + 1) / count) * 100}%` }
            }
          />
        </div>
      </div>

      <div ref={thumbsRef} className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {ITEMS.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => go(index)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-28 ${
              index === active ? 'border-[#f46b4f] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            aria-label={`${copy.goTo} ${pick(item.name, language)}`}
            aria-current={index === active ? 'true' : undefined}
          >
            <img src={`/items/${item.key}.jpg`} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-3 text-left text-[11px] font-bold text-white">
              {pick(item.name, language)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
