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
  const [form, setForm] = useState({ nickname: "", bio: "" });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    const controller = new AbortController();
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!res.ok) {
          setError("User not found");
          return;
        }
        const data = await res.json();
        if (controller.signal.aborted) return;
        setProfile(data);
        setForm({
          nickname: data.user.nickname,
          bio: "A voice on the OneMessage board.",
        });
      } catch {
        if (controller.signal.aborted) return;
        setError("Failed to load profile");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchProfile();
    return () => controller.abort();
  }, [id]);

  return (
    <>
      <Head>
        <title>{`${profile?.user?.nickname || "Profile"} — OneMessage`}</title>
      </Head>

      <main className="noise relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
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

          {loading ? (
            <div className="mt-16 text-center text-white/30">Loading...</div>
          ) : error ? (
            <div className="mt-16 text-center text-white/30">{error}</div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
              {/* Sidebar */}
              <aside className="animate-fade-in-up-delay-1 space-y-5">
                <div className="glass-strong rounded-none p-8 text-center">
                  <div className="mx-auto mb-5 relative">
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-none pixel-fill    text-4xl font-bold text-white ">
                      {profile.user.nickname.charAt(0).toUpperCase()}
                    </div>

                  </div>
                  <h2 className="text-2xl font-bold text-white">{profile.user.nickname}</h2>
                  <p className="mt-1 text-sm text-white/40">id: {profile.user.id}</p>

                </div>

                <div className="glass rounded-none p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/30">About</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{form.bio}</p>
                  <div className="mt-5 space-y-3">
                    <div>
                      <p className="text-xs text-white/30">Joined</p>
                      <p className="mt-1 text-sm font-medium text-white">{profile.user.created_at}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-none p-4 text-center">
                    <p className="text-xl font-bold text-white">{profile.stats.boardCount}</p>
                    <p className="mt-1 text-[11px] text-white/30">Posts</p>
                  </div>
                  <div className="glass rounded-none p-4 text-center">
                    <p className="text-xl font-bold text-white">{profile.stats.activeCount}</p>
                    <p className="mt-1 text-[11px] text-white/30">Active</p>
                  </div>
                  <div className="glass rounded-none p-4 text-center">
                    <p className="text-xl font-bold text-white">{profile.stats.permanentCount}</p>
                    <p className="mt-1 text-[11px] text-white/30">Permanent</p>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <section className="animate-fade-in-up-delay-2 space-y-6">
                <div className="glass p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Board placements</h3>
                  <p className="mt-1 text-sm text-white/40">Latest placements · demo mode</p>
                  {profile.boardPlacements?.length ? <div className="mt-5 space-y-4">{profile.boardPlacements.map((item) => (
                    <article key={item.id} className="border border-white/10 p-4">
                      <div className="flex flex-wrap justify-between gap-2 text-xs text-white/50"><span>{item.mode === 'permanent' ? 'Permanent wall' : 'Live board'} · cell #{item.slot + 1}</span><span>{item.expired ? 'Archived' : 'Published'}</span></div>
                      <Link href={`/?message=${item.id}#boards`} className="mt-3 block whitespace-pre-wrap break-words hover:text-lime-300">{item.text} ↗</Link>
                      <p className="mt-3 text-xs text-white/40">{item.expires_at ? `Placement ends: ${new Date(item.expires_at).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC` : 'No expiry · lifetime of the service'}</p>
                    </article>
                  ))}</div> : <p className="mt-5 text-sm text-white/40">No board placements yet.</p>}
                  <Link href="/#boards" className="mt-5 inline-block text-sm text-lime-300">Explore the boards ↗</Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
