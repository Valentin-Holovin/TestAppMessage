import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { Button } from "../../components/ui/button";

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nickname: "", bio: "", website: "", email: "" });

  useEffect(() => {
    if (!id) return;
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${id}`);
        if (!res.ok) {
          setError("User not found");
          return;
        }
        const data = await res.json();
        setProfile(data);
        setForm({
          nickname: data.user.nickname,
          bio: "I own the one message on the internet.",
          website: "https://onemessage.example",
          email: data.user.email || "",
        });
      } catch {
        setError("Failed to load profile");
      }
      setLoading(false);
    }
    fetchProfile();
  }, [id]);

  const badgeColors = {
    longest_hold: "from-cyan-400 to-blue-500",
    highest_price: "from-amber-400 to-orange-500",
    most_purchases: "from-emerald-400 to-teal-500",
  };

  const badgeLabels = {
    longest_hold: "Longest Hold",
    highest_price: "Highest Price",
    most_purchases: "Most Purchases",
  };

  return (
    <>
      <Head>
        <title>{profile?.user?.nickname || "Profile"} — OneMessage</title>
      </Head>

      <main className="noise relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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

          {loading ? (
            <div className="mt-16 text-center text-white/30">Loading...</div>
          ) : error ? (
            <div className="mt-16 text-center text-white/30">{error}</div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
              {/* Sidebar */}
              <aside className="animate-fade-in-up-delay-1 space-y-5">
                <div className="glass-strong rounded-3xl p-8 text-center">
                  <div className="mx-auto mb-5 relative">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-4xl font-bold text-white shadow-[0_0_40px_rgba(129,140,248,0.3)]">
                      {profile.user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[#050a18] bg-emerald-400">
                      <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{profile.user.nickname}</h2>
                  <p className="mt-1 text-sm text-white/40">id: {profile.user.id}</p>

                  {profile.badges.length > 0 && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {profile.badges.map((badge) => (
                        <span
                          key={badge.key}
                          className={`inline-flex rounded-full bg-gradient-to-r ${badgeColors[badge.key] || "from-white/10 to-white/5"} px-3 py-1 text-xs font-bold text-white`}
                        >
                          {badgeLabels[badge.key] || badge.key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass rounded-3xl p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/30">About</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{form.bio}</p>
                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-xs text-white/30">Email</p>
                      <a href={`mailto:${form.email}`} className="mt-1 block text-sm font-medium text-indigo-400 hover:text-indigo-300 transition">
                        {form.email || "—"}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Joined</p>
                      <p className="mt-1 text-sm font-medium text-white">{profile.user.created_at}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xl font-bold text-white">${profile.stats.totalSpent}</p>
                    <p className="mt-1 text-[11px] text-white/30">Spent</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xl font-bold text-white">${profile.stats.earned}</p>
                    <p className="mt-1 text-[11px] text-white/30">Earned</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xl font-bold text-white">{profile.stats.longestHold}</p>
                    <p className="mt-1 text-[11px] text-white/30">Longest</p>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <section className="animate-fade-in-up-delay-2 space-y-6">
                <div className="glass rounded-3xl px-6 py-5 sm:px-8">
                  <h3 className="text-xl font-bold text-white">Messages owned</h3>
                  <p className="mt-1 text-sm text-white/40">
                    {profile.messages.length} messages in collection
                  </p>
                </div>

                {profile.messages.length === 0 ? (
                  <div className="glass rounded-3xl p-8 text-center text-white/30">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.messages.map((m) => (
                      <article
                        key={m.id}
                        className="glass group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:border-indigo-400/20 sm:p-7"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <p className="text-lg font-bold text-white">{m.text}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${Number(m.price).toFixed(2)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-xs text-white/40">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {m.hold}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
