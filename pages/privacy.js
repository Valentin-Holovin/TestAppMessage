import Head from "next/head";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function Privacy() {
  const sections = [
    { title: "1. Information We Collect", desc: "We collect information you provide directly, including account identifiers, email addresses, and any message content you submit. We also collect technical data such as device details and usage patterns." },
    { title: "2. Purpose of Processing", desc: "Personal data is processed to provide the platform, maintain account security, analyze service performance, respond to requests, and comply with legal obligations. We do not sell personal data." },
    { title: "3. Security and Retention", desc: "We use industry-standard measures to protect data from unauthorized access. Data is retained only as long as necessary to support the service and comply with legal requirements." },
    { title: "4. Third-Party Services", desc: "OneMessage may use third-party providers to support hosting, analytics, and infrastructure. Those providers are authorized only to process data under our instruction." },
    { title: "5. Children and Minors", desc: "The service is not intended for children under 13. If we become aware that a child has provided personal data, we will take steps to delete it." },
    { title: "6. Updates to This Policy", desc: "We may update this Privacy Policy to reflect changes in our practices or legal obligations. Continued use after changes are posted signifies your acceptance." },
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy — OneMessage</title>
        <meta name="description" content="Read the Privacy Policy for OneMessage. How we collect, use, and protect your data." />
        <link rel="canonical" href="https://onemessage.io/privacy" />
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              Privacy Policy
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              How we protect <span className="gradient-text">your data</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/40">
              This Privacy Policy explains what data we collect, why, and the safeguards in place to protect your privacy.
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
              <p className="text-sm text-white/30">For more information about service terms?</p>
              <Link href="/terms" className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300">View Terms of Service</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
