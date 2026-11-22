export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9f7] text-[#10233f]">
      <section className="bg-[#10233f] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#ffb09e]">Legal</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Privacy Policy</h1>
          <p className="mt-4 text-slate-300">How Lost &amp; Found Rwanda handles information used to protect and recover belongings.</p>
        </div>
      </section>
      <article className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <section><h2 className="text-2xl font-black">Information we collect</h2><p className="mt-3 leading-7 text-slate-600">We collect account details such as your name, email address, and optional phone number. Item records may include descriptions, identifiers, photos, location details, and recovery status. Visitors reporting a found item may provide their name and an email or phone number without creating an account.</p></section>
        <section><h2 className="text-2xl font-black">How we use information</h2><p className="mt-3 leading-7 text-slate-600">Information is used to create item records, display public found-item reports, search identifiers, support verification, identify possible matches, process claims, and provide support. We do not use this information to publish an owner&apos;s private contact details.</p></section>
        <section><h2 className="text-2xl font-black">Public and private information</h2><p className="mt-3 leading-7 text-slate-600">Found-item reports may be visible to visitors with limited item and location details. Account credentials, passwords, verification hashes, and private reporter contact details are kept out of public results. Please avoid placing sensitive personal numbers in descriptions or photos unless necessary for recovery.</p></section>
        <section><h2 className="text-2xl font-black">Security and retention</h2><p className="mt-3 leading-7 text-slate-600">Passwords are stored using secure hashing. We use access controls and security measures appropriate to the platform. Records may be retained while they support an active recovery, claim, audit, or legal obligation.</p></section>
        <section><h2 className="text-2xl font-black">Your choices</h2><p className="mt-3 leading-7 text-slate-600">You may update your account details through the platform or contact support about questions concerning your information or an item report.</p><a href="mailto:support@lostfound.ca" className="mt-4 inline-block font-bold text-[#f46b4f]">support@lostfound.ca</a></section>
      </article>
    </main>
  );
}