import Link from 'next/link';

const supportedServices = [
  {
    number: '01',
    title: 'Register important items',
    text: 'Create a secure digital record for phones, laptops, vehicles, bicycles, documents, and other supported belongings.',
    href: '/register',
    action: 'Create an account',
  },
  {
    number: '02',
    title: 'Report lost or stolen items',
    text: 'Keep your item record current by changing its status when a belonging goes missing in Kigali or elsewhere in Rwanda.',
    href: '/login',
    action: 'Open your dashboard',
  },
  {
    number: '03',
    title: 'Report a found item',
    text: 'Share details about an item you have found so that the platform can look for a registered owner and guide a safe recovery.',
    href: '/found',
    action: 'Report found item',
  },
  {
    number: '04',
    title: 'Search and verify ownership',
    text: 'Use identifiers or a verification code to check an item, review possible matches, and support an ownership claim without exposing private contact details.',
    href: '/verify',
    action: 'Verify an item',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#10233f]">
      <section className="bg-[#10233f] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#ffb09e]">About Lost & Found Rwanda</p>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Helping Rwanda protect what matters and recover what is missing.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300">
              Lost & Found is a digital ownership and recovery platform for people in Rwanda. It brings item records, found-item reports, verification, and potential matches into one trusted place.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-[#dce3df] bg-white p-6 shadow-sm sm:p-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#f46b4f]">What we support today</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">A practical recovery record for everyday life.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              Keep important details in one secure place, so you are ready to act quickly if something goes missing.
            </p>

            <div className="mt-8 space-y-4 border-t border-[#dce3df] pt-6">
              {[
                ['01', 'Record it', 'Save item details and identifiers.'],
                ['02', 'Report it', 'Update the status if it is lost or found.'],
                ['03', 'Recover it', 'Verify ownership and guide a safe return.'],
              ].map(([number, title, text]) => (
                <div key={number} className="group flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-xs font-black text-[#f46b4f] transition-transform duration-300 group-hover:scale-110">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-[#10233f]">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#f8f9f7] px-4 py-3 text-xs font-bold text-slate-600">
              <span className="relative flex h-3 w-3" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f46b4f] opacity-50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#f46b4f]" />
              </span>
              Ready when you need it most.
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {supportedServices.map((service) => (
              <article key={service.number} className="rounded-2xl border border-[#dce3df] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="text-sm font-black text-[#f46b4f]">{service.number}</span>
                <h3 className="mt-5 text-xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{service.text}</p>
                <Link href={service.href} className="mt-5 inline-flex text-sm font-bold text-[#f46b4f] hover:text-[#d9533d]">
                  {service.action} <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce3df] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#f46b4f]">Built for Rwanda</p>
            <h2 className="text-3xl font-black tracking-tight">Local context, safer recovery.</h2>
          </div>
          <div className="lg:col-span-2 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-black">For communities</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">Useful for recoveries around homes, schools, workplaces, markets, transport hubs, and public spaces.</p>
            </div>
            <div>
              <h3 className="font-black">For local identifiers</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">Records can include serial numbers, IMEI numbers, VINs, ID numbers, passport numbers, and license plates.</p>
            </div>
            <div>
              <h3 className="font-black">Privacy first</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">Verification and matching help people connect without publishing an owner&apos;s personal contact details.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to protect an item?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">Start with a secure item record, or help return something you have found.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register" className="rounded-full bg-[#f46b4f] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#f46b4f]/20 transition hover:bg-[#d9533d]">Register an item</Link>
          <Link href="/found" className="rounded-full border border-[#10233f] px-7 py-3 text-sm font-bold text-[#10233f] transition hover:bg-[#10233f] hover:text-white">Report a found item</Link>
        </div>
      </section>
    </main>
  );
}
