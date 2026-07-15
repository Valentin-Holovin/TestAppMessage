import Head from "next/head";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function Terms() {
  const sections = [
    { title: "1. Acceptance and Scope", desc: "By using OneMessage, you confirm that you have read, understood, and agree to these Terms. The service is provided as a platform for publishing a single community-owned message." },
    { title: "2. User Obligations", desc: "You must use the platform lawfully, honestly, and in good faith. You are responsible for any content you post, including any message that replaces the current public message." },
    { title: "3. Message Ownership and License", desc: "When you replace the message, you grant OneMessage a perpetual, worldwide, royalty-free license to display, reproduce, and distribute that message for the purposes of the service." },
    { title: "4. Pricing, Payment and Replacement", desc: "The current replacement price is displayed at the time of purchase. OneMessage may update the price, and any payment processed is final." },
    { title: "5. Disclaimers and Limitation of Liability", desc: 'To the fullest extent permitted by law, OneMessage provides the service "as is" and disclaims all warranties. OneMessage is not liable for lost profits, lost data, or any indirect damages.' },
    { title: "6. Modifications", desc: "OneMessage may modify these Terms at any time. Continued use after changes have been posted constitutes acceptance." },
  ];

  return (
    <>
      <Head>
        <title>Terms of Service — OneMessage</title>
      </Head>

      <main className="noise relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <header className="animate-fade-in-up glass rounded-3xl px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">1M</div>
                <span className="text-lg font-bold text-white">OneMessage</span>
              </Link>
              <Link href="/"><Button variant="ghost" size="sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back</Button>
              </Link>
            </div>
          </header>

          <div className="animate-fade-in-up-delay-1 mt-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2 text-sm font-medium text-indigo-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Terms of Service
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Governing <span className="gradient-text">terms</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/40">
              These Terms define how you may access the service, what rights you grant, and the legal framework for replacing the public message.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {sections.map((s, i) => (
              <div key={i} className={`animate-fade-in-up-delay-${Math.min(i + 2, 3)} glass group rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:border-indigo-400/20`}>
                <h2 className="text-lg font-bold text-white">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 glass rounded-3xl px-6 py-6 sm:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-white/30">Need more details?</p>
              <Link href="/privacy" className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300">View Privacy Policy</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
