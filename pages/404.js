import Head from "next/head";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — OneMessage</title>
      </Head>

      <main className="noise relative flex min-h-screen items-center justify-center px-4">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="animate-fade-in-up relative z-10 mx-auto w-full max-w-lg text-center">
          <div className="glass-strong rounded-3xl p-10 sm:p-12">
            <p className="text-8xl font-bold gradient-text">404</p>
            <h1 className="mt-6 text-2xl font-bold text-white">Page not found</h1>
            <p className="mt-3 text-sm text-white/40">
              This page doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(129,140,248,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(129,140,248,0.5)] hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
