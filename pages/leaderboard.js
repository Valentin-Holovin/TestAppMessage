import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

const badgeColors = {
  Diamond: "badge-ice",
  Gold: "badge-gold",
  Bronze: "badge-gold",
  Silver: " ",
  Emerald: "badge-lime",
  Member: " ",
};

export default function Leaderboard() {
  const router = useRouter();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    async function load() {
      try {
        const res = await fetch("/api/leaderboard", { signal: controller.signal });
        if (!res.ok) throw new Error("Unable to load leaderboard. Please try again.");
        const data = await res.json();
        if (!controller.signal.aborted) setLeaders(data.leaders || []);
      } catch (err) { if (!controller.signal.aborted) setError(err.message || "Connection failed."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [retry]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <>
      <Head>
        <title>Leaderboard — OneMessage</title>
        <meta name="description" content="See the top message owners on OneMessage. Ranked by messages published on the message boards. Values are demo totals." />
        <link rel="canonical" href="https://onemessage.io/leaderboard" />

        <meta property="og:title" content="Leaderboard — OneMessage" />
        <meta property="og:description" content="See the top message owners on OneMessage. Ranked by messages published on the message boards. Values are demo totals." />
        <meta property="og:url" content="https://onemessage.io/leaderboard" />
      </Head>

      <main className="noise relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <header className="animate-fade-in-up glass rounded-none px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-none pixel-fill   text-sm font-bold text-white ">1M</div>
                <span className="text-lg font-bold text-white">OneMessage</span>
              </Link>
              <Link href="/"><Button variant="ghost" size="sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back to home</Button>
              </Link>
            </div>
          </header>

          <div className="animate-fade-in-up-delay-1 mt-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white/[0.06] px-4 py-2 text-sm font-medium text-lime-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-1.538.756m0 0a6.003 6.003 0 01-1.538-.756m0 0a6.003 6.003 0 00-2.48-5.228m0 0c-1.514-1.238-2.48-3.118-2.48-5.228" />
              </svg>
              Rankings
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Top message <span className="gradient-text">owners</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/40">
              Ranked by messages published on the message boards. Values are demo totals.
            </p>
          </div>

          {loading ? (
            <div className="mt-16 text-center text-white/30">Loading...</div>
          ) : error ? (
            <div role="alert" className="mt-12 glass p-8 text-center"><p>{error}</p><Button className="mt-4" variant="outline" onClick={() => setRetry((value) => value + 1)}>Try again</Button></div>
          ) : leaders.length === 0 ? (
            <div className="mt-16 text-center text-white/30">No authors yet. <Link href="/#boards" className="text-lime-300 underline">Be the first ↗</Link></div>
          ) : (
            <>
              {/* Top 3 podium */}
              <div className="animate-fade-in-up-delay-2 mt-12 grid grid-cols-3 gap-4">
                {top3.map((owner, i) => (
                  <div
                    key={owner.id}
                    role="link" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") router.push(`/profile/${owner.id}`); }}
                    onClick={() => router.push(`/profile/${owner.id}`)}
                    className={`glass group relative cursor-pointer rounded-none p-6 text-center transition-all duration-300 hover:border-lime-300 ${
                      i === 0 ? "sm:-translate-y-4 sm:scale-105" : ""
                    }`}
                  >
                    {i === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-none pixel-fill   px-4 py-1 text-xs font-bold text-black ">
                        #1
                      </div>
                    )}
                    <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-none pixel-fill ${badgeColors[owner.badge]} text-2xl font-bold text-white shadow-lg`}>
                      {owner.nickname.charAt(0)}
                    </div>
                    <p className="text-base font-bold text-white">{owner.nickname}</p>
                    <p className="mt-1 text-xs text-white/40">#{owner.rank}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xl font-bold text-white">{owner.total}</p>
                      <p className="text-xs text-white/30">{owner.messages} messages</p>
                    </div>
                    <div className="mt-4">
                      <span className={`inline-flex rounded-none pixel-fill ${badgeColors[owner.badge]} px-3 py-1 text-xs font-bold text-white`}>
                        {owner.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of list */}
              {rest.length > 0 && (
                <div className="animate-fade-in-up-delay-3 mt-8 glass rounded-none overflow-hidden">
                  <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.06] px-6 py-4 text-xs font-medium uppercase tracking-widest text-white/30">
                    <span>Rank</span>
                    <span>Owner</span>
                    <span>Badge</span>
                    <span>Demo value</span>
                    <span className="text-right">Messages</span>
                  </div>
                  <ul>
                    {rest.map((owner) => (
                      <li
                        key={owner.id}
                        role="link" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") router.push(`/profile/${owner.id}`); }}
                    onClick={() => router.push(`/profile/${owner.id}`)}
                        className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.03] px-6 py-5 transition-colors last:border-0 hover:bg-white/[0.02] sm:items-center cursor-pointer"
                      >
                        <span className="font-bold text-white/50">#{owner.rank}</span>
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-none pixel-fill   text-sm font-bold text-white">
                            {owner.nickname.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{owner.nickname}</span>
                        </div>
                        <span className={`inline-flex w-fit rounded-none pixel-fill ${badgeColors[owner.badge]} px-3 py-1 text-xs font-bold text-white`}>
                          {owner.badge}
                        </span>
                        <span className="font-semibold text-white">{owner.total}</span>
                        <span className="text-right text-white/50">{owner.messages}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
