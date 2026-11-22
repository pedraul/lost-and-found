import Link from 'next/link';
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { getWhatsAppChatUrl } from '../../utils/whatsapp';
import SocialIcons from '../../components/SocialIcons';

const supportEmail = 'barflow01@gmail.com';
const supportPhone = '+250780497307';
const whatsappUrl = getWhatsAppChatUrl('Hello Lost & Found Rwanda, I need help with an item.');

const helpTopics = [
  'Account registration and login',
  'Registering a phone, laptop, vehicle, bicycle, or document',
  'Updating a lost, stolen, active, or returned item',
  'Reporting or claiming a found item',
  'Verification codes, identifiers, and possible matches',
];

const contactOptions = [
  {
    icon: MessageCircle,
    label: 'WhatsApp messages',
    title: 'Chat with support',
    text: 'Send us a message for quick help with an item, report, or verification.',
    href: whatsappUrl,
    action: 'Open WhatsApp',
    external: true,
    accent: 'bg-[#e9fbef] text-[#168a45]',
  },
  {
    icon: Phone,
    label: 'Phone support',
    title: 'Call our support desk',
    text: 'Speak to us directly when you need help moving a recovery forward.',
    href: `tel:${supportPhone}`,
    action: '+250 780 497 307',
    accent: 'bg-[#fff0eb] text-[#f46b4f]',
  },
  {
    icon: Mail,
    label: 'Email support',
    title: 'Send us the details',
    text: 'Best for questions that need screenshots, report references, or more context.',
    href: `mailto:${supportEmail}`,
    action: supportEmail,
    accent: 'bg-[#edf4ff] text-[#3478d4]',
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#10233f]">
      <section className="bg-[#10233f] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#ffb09e]">Contact Lost & Found Rwanda</p>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Let&apos;s help move a recovery forward.</h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">Tell us what is happening and our support team can point you to the right step for your item, report, or verification.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {contactOptions.map(({ icon: Icon, label, title, text, href, action, external, accent }) => (
            <article key={label} className="group rounded-2xl border border-[#dce3df] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}><Icon size={22} strokeWidth={2.4} /></span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <h2 className="mt-2 text-xl font-black tracking-tight">{title}</h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{text}</p>
              <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#f46b4f] transition group-hover:text-[#d9533d]">
                {action} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-[#10233f] p-6 text-white">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb09e]">Follow us</h2>
          <div className="mt-4"><SocialIcons /></div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-2xl bg-[#f46b4f] p-8 text-white shadow-xl shadow-[#f46b4f]/15 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">Support desk</p>
            <h2 className="mt-5 text-3xl font-black tracking-tight">Based in Rwanda. Here when recovery matters.</h2>
            <p className="mt-5 leading-7 text-white/85">Choose the contact method that works best for you. Include the item name and any report or verification reference so we can guide you faster.</p>
            <div className="mt-8 space-y-5 border-t border-white/20 pt-7">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Kigali, Rwanda</p><p className="mt-1 text-sm text-white/75">Serving communities across Rwanda</p></div></div>
              <div className="flex items-start gap-3"><Clock3 className="mt-0.5 shrink-0" size={19} /><div><p className="font-bold">Support availability</p><p className="mt-1 text-sm text-white/75">Message us anytime; we respond as soon as possible.</p></div></div>
            </div>
          </aside>

          <div className="rounded-2xl border border-[#dce3df] bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f46b4f]">What we can help with</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Choose the fastest path first.</h2>
          <div className="mt-8 space-y-4">
            {helpTopics.map((topic, index) => (
              <div key={topic} className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-sm font-black text-[#f46b4f]">{index + 1}</span>
                <p className="pt-1 text-sm font-semibold text-slate-700">{topic}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/help" className="rounded-full bg-[#10233f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#203449]">Read support guides</Link>
            <Link href="/search" className="rounded-full border border-[#10233f] px-6 py-3 text-sm font-bold text-[#10233f] transition hover:bg-[#10233f] hover:text-white">Search an item</Link>
          </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce3df] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl bg-[#f8f9f7] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-[#f46b4f]"><ShieldCheck size={22} /></span><div><h2 className="font-black">Keep your account and identity safe</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">We will never ask for your password, one-time code, or full private identifiers by email, call, or WhatsApp.</p></div></div>
          <a href={`mailto:${supportEmail}`} className="shrink-0 text-sm font-black text-[#f46b4f] hover:text-[#d9533d]">Report a concern</a>
        </div>
      </section>

      <section className="border-t border-[#dce3df] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">Have you found an item?</h2>
            <p className="mt-1 text-sm text-slate-600">Reporting it gives the registered owner a safer chance to recover it.</p>
          </div>
          <Link href="/found" className="inline-flex rounded-full bg-[#f46b4f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9533d]">Report found item</Link>
        </div>
      </section>
    </main>
  );
}
