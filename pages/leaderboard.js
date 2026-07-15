import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

const badgeColors = {
  Diamond: "from-cyan-400 to-blue-500",
  Gold: "from-amber-400 to-orange-500",
  Bronze: "from-orange-400 to-amber-600",
  Silver: "from-slate-300 to-slate-500",
  Emerald: "from-emerald-400 to-teal-500",
  Member: "from-white/20 to-white/10",
};

export default function Leaderboard() {
  const router = useRouter();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        setLeaders(data.leaders || []);
      } catch {}
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <>
      <Head>
        <title>Leaderboard — OneMessage</title>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-1.538.756m0 0a6.003 6.003 0 01-1.538-.756m0 0a6.003 6.003 0 00-2.48-5.228m0 0c-1.514-1.238-2.48-3.118-2.48-5.228" />
              </svg>
              Rankings
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              Top message <span className="gradient-text">owners</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/40">
              Ranked by total value and number of messages owned.
            </p>
          </div>

          {loading ? (
            <div className="mt-16 text-center text-white/30">Loading...</div>
          ) : leaders.length === 0 ? (
            <div className="mt-16 text-center text-white/30">No data yet</div>
          ) : (
            <>
              {/* Top 3 podium */}
              <div className="animate-fade-in-up-delay-2 mt-12 grid grid-cols-3 gap-4">
                {top3.map((owner, i) => (
                  <div
                    key={owner.id}
                    onClick={() => router.push(`/profile/${owner.id}`)}
                    className={`glass group relative cursor-pointer rounded-3xl p-6 text-center transition-all duration-300 hover:border-indigo-400/20 ${
                      i === 0 ? "sm:-translate-y-4 sm:scale-105" : ""
                    }`}
                  >
                    {i === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1 text-xs font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                        #1
                      </div>
                    )}
                    <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${badgeColors[owner.badge]} text-2xl font-bold text-white shadow-lg`}>
                      {owner.nickname.charAt(0)}
                    </div>
                    <p className="text-base font-bold text-white">{owner.nickname}</p>
                    <p className="mt-1 text-xs text-white/40">#{owner.rank}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-xl font-bold text-white">{owner.total}</p>
                      <p className="text-xs text-white/30">{owner.messages} messages</p>
                    </div>
                    <div className="mt-4">
                      <span className={`inline-flex rounded-full bg-gradient-to-r ${badgeColors[owner.badge]} px-3 py-1 text-xs font-bold text-white`}>
                        {owner.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of list */}
              {rest.length > 0 && (
                <div className="animate-fade-in-up-delay-3 mt-8 glass rounded-3xl overflow-hidden">
                  <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.06] px-6 py-4 text-xs font-medium uppercase tracking-widest text-white/30">
                    <span>Rank</span>
                    <span>Owner</span>
                    <span>Badge</span>
                    <span>Total</span>
                    <span className="text-right">Messages</span>
                  </div>
                  <ul>
                    {rest.map((owner) => (
                      <li
                        key={owner.id}
                        onClick={() => router.push(`/profile/${owner.id}`)}
                        className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.03] px-6 py-5 transition-colors last:border-0 hover:bg-white/[0.02] sm:items-center cursor-pointer"
                      >
                        <span className="font-bold text-white/50">#{owner.rank}</span>
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-sm font-bold text-white">
                            {owner.nickname.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{owner.nickname}</span>
                        </div>
                        <span className={`inline-flex w-fit rounded-full bg-gradient-to-r ${badgeColors[owner.badge]} px-3 py-1 text-xs font-bold text-white`}>
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
