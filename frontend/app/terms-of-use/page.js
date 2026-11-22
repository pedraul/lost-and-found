export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#10233f]">
      <section className="bg-[#10233f] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#ffb09e]">Legal</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Terms of Use</h1>
          <p className="mt-4 text-slate-300">The rules for using Lost &amp; Found Rwanda to register, report, search, and recover belongings.</p>
        </div>
      </section>
      <article className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <section><h2 className="text-2xl font-black">Using the platform</h2><p className="mt-3 leading-7 text-slate-600">You may use the platform to register your belongings, report items you have found, search item identifiers, verify ownership, review possible matches, and submit legitimate claims.</p></section>
        <section><h2 className="text-2xl font-black">Accurate information</h2><p className="mt-3 leading-7 text-slate-600">Provide information that is truthful and relevant to the item. Do not submit false reports, impersonate another person, upload material you do not have permission to share, or use the service to harass or expose someone&apos;s private information.</p></section>
        <section><h2 className="text-2xl font-black">Reports, matches, and claims</h2><p className="mt-3 leading-7 text-slate-600">A report or possible match is not proof of ownership. Claims may require additional evidence and review. The platform supports communication and recovery workflows but does not guarantee that an item will be found, matched, or returned.</p></section>
        <section><h2 className="text-2xl font-black">Photos and identifiers</h2><p className="mt-3 leading-7 text-slate-600">Only upload clear, lawful photos related to the report. Do not include passwords, payment details, or unnecessary sensitive personal information. Keep verification codes private and share them only when appropriate for a recovery.</p></section>
        <section><h2 className="text-2xl font-black">Suspension and support</h2><p className="mt-3 leading-7 text-slate-600">We may restrict access to reports or accounts that appear abusive, fraudulent, unsafe, or inconsistent with these terms. For questions about a report or account, contact support at:</p><a href="mailto:support@lostfound.ca" className="mt-4 inline-block font-bold text-[#f46b4f]">support@lostfound.ca</a></section>
      </article>
    </main>
  );
}