import MessageBoard from "../components/MessageBoard";
import { useAuth } from "../components/auth/AuthProvider";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    try {
      await logout();
      setShowLogoutConfirm(false);
      router.push("/");
    } catch { setLogoutError("Unable to sign out. Please try again."); }
  }

  useEffect(() => {
    const source = new EventSource("/api/events");
    const refresh = () => window.dispatchEvent(new Event("onemessage:board-update"));
    source.addEventListener("board_update", refresh);
    source.onopen = refresh;
    return () => source.close();
  }, []);

  return (
    <>
      <Head>
        <title>OneMessage — A place for your words</title>
        <meta name="description" content="A shared pixel board for your words. Publish a temporary or permanent message, explore other voices, and share a link. Demo placements are free to try." />
        <meta name="keywords" content="OneMessage, buy message, own message, internet message, public message, digital real estate" />
        <link rel="canonical" href="https://onemessage.io" />
      </Head>

      <main className="noise home-page relative min-h-screen">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="animate-fade-in-up glass rounded-none px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-none pixel-fill   text-lg font-bold text-white ">
                1M
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                One<span className="gradient-text">Message</span>
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-2">
              <Link href="/#boards"><Button variant="ghost" size="sm">Message boards</Button></Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">Leaderboard</Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${user.id}`}>
                    <Button variant="glow" size="sm">
                      <div className="grid h-5 w-5 place-items-center rounded-none pixel-fill   text-[10px] font-bold text-white">
                        {user.nickname.charAt(0)}
                      </div>
                      {user.nickname}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { setLogoutError(""); setShowLogoutConfirm(true); }}>Logout</Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="gradient" size="sm" disabled={authLoading}>{authLoading ? "Loading..." : "Sign in"}</Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

        {authError && <p role="status" className="mt-4 text-sm text-amber-300">{authError} <Link href="/login" className="underline">Sign in / finish profile</Link></p>}
          <section className="pixel-intro">
            <p className="eyebrow"><span className="status-square" /> MANY VOICES. ONE SHARED SPACE.</p>
            <h1>Small messages.<br /><span>Big internet energy.</span></h1>
            <div className="intro-bottom"><p>Claim a cell for a day, a month, or forever.<br />A shared corner of the internet, written by you.</p><span className="edition-tag">EST. 2026 <span>↙</span></span></div>
          </section>
          <div className="home-start-actions"><a href="#boards" className="pixel-button pixel-button-primary px-6 py-3">Explore the board ↘</a><span>Read freely · Try a demo · Share your words</span></div>
          <div className="first-steps" aria-label="How to participate"><p><b>01</b> Choose a free cell</p><p><b>02</b> Write your message</p><p><b>03</b> Publish & share its link</p></div>
          <MessageBoard />

        {/* Features */}
        <div className="section-heading"><span>THE INTERNET IS YOURS TO WRITE.</span><span>[ HOW IT WORKS ]</span></div>
        <section className="mt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                title: "A little room for your voice",
                desc: "Write a thought, tell a tiny story, or make someone smile. Choose a cell and leave your mark.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                title: "Choose how long to stay",
                desc: "A day, a month, or a lasting place. Choose the duration and review the listed rate before publishing.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                ),
                title: "Message archive & authors",
                desc: "Your messages stay readable after their placement ends. Discover the people behind the board.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className={`animate-fade-in-up-delay-${i + 1} glass group rounded-none p-7 transition-all duration-300 hover:border-lime-300 `}
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-none pixel-fill   text-lime-300 transition-colors  ">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 glass rounded-none px-6 py-6 sm:px-8 sm:py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-white/30">
              OneMessage &mdash; A place for your words.
            </p>
            <div className="flex gap-5">
              <Link href="/terms" className="text-sm text-white/30 transition hover:text-white/70">Terms</Link>
              <Link href="/privacy" className="text-sm text-white/30 transition hover:text-white/70">Privacy</Link>
              <Link href="/about" className="text-sm text-white/30 transition hover:text-white/70">About</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="animate-fade-in-up relative z-10 w-full max-w-sm glass-strong rounded-none p-8 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-none bg-red-400/10 text-red-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Sign out?</h2>
            <p className="mt-2 text-sm text-white/40">
              You&apos;ll need to sign in again to publish on the boards.
            </p>
            {logoutError && <p role="alert" className="mt-3 text-sm text-red-300">{logoutError}</p>}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
                Stay
              </Button>
              <Button variant="gradient" className="flex-1" onClick={handleLogout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
