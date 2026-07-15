import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        setHistory(data.history || []);
      } catch {}
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <>
      <Head>
        <title>History — OneMessage</title>
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
                Back to home</Button>
              </Link>
            </div>
          </header>

          <div className="animate-fade-in-up-delay-1 mt-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-indigo-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeline
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Message <span className="gradient-text">history</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/40">
              A timeline of the latest owners, prices, and hold durations.
            </p>
          </div>

          {loading ? (
            <div className="mt-16 text-center text-white/30">Loading...</div>
          ) : history.length === 0 ? (
            <div className="mt-16 text-center text-white/30">No history yet</div>
          ) : (
            <div className="animate-fade-in-up-delay-2 mt-12 space-y-4">
              {history.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/profile/${item.owner_id}`)}
                  className="glass group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:border-indigo-400/20 sm:p-8 cursor-pointer"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white/50">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-lg font-bold text-white">{item.text}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          {item.owner_nickname}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-white/30">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {item.purchased_at}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                      <p className="text-2xl font-bold text-white">${Number(item.price).toFixed(2)}</p>
                      <span className="text-xs text-white/30">paid</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
