import Head from "next/head";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function About() {
  const sections = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      ),
      title: "Our mission",
      desc: "We exist to provide a straightforward platform where one visible message can be claimed, updated, and governed with integrity.",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
      title: "How it works",
      desc: "Each visitor sees a single public message. When a user chooses to replace it, the platform applies the current price and updates the message for everyone.",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Trust and compliance",
      desc: "OneMessage is built with compliance in mind. We respect user privacy, limit liability, and provide legal certainty through our Terms and Privacy Policy.",
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
      title: "Contact and governance",
      desc: "Questions or concerns? Review the Terms and Privacy Policy. OneMessage reserves the right to modify these documents at any time.",
    },
  ];

  return (
    <>
      <Head>
        <title>About — OneMessage</title>
      </Head>

      <main className="noise relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <header className="animate-fade-in-up glass rounded-3xl px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                    1M
                  </div>
                  <span className="text-lg font-bold text-white">OneMessage</span>
                </Link>
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to home
                </Button>
              </Link>
            </div>
          </header>

          {/* Hero */}
          <div className="animate-fade-in-up-delay-1 mt-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2 text-sm font-medium text-indigo-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              About OneMessage
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Clear purpose, <span className="gradient-text">simple governance</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/40">
              OneMessage is a compact public messaging platform designed for
              transparent access, legal clarity, and safe ownership.
            </p>
          </div>

          {/* Sections */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {sections.map((section, i) => (
              <div
                key={i}
                className={`animate-fade-in-up-delay-${Math.min(i + 2, 3)} glass group rounded-3xl p-7 transition-all duration-300 hover:border-indigo-400/20 hover:shadow-[0_0_40px_rgba(129,140,248,0.08)]`}
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 transition-colors group-hover:from-indigo-500/30 group-hover:to-purple-500/30">
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{section.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-14 glass rounded-3xl px-6 py-6 sm:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-white/30">Want to read the legal details?</p>
              <div className="flex gap-5">
                <Link href="/terms" className="text-sm text-white/30 transition hover:text-white/70">Terms</Link>
                <Link href="/privacy" className="text-sm text-white/30 transition hover:text-white/70">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
