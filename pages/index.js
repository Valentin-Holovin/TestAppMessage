import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

function StatCounter({ value, label, delay }) {
  const [display, setDisplay] = useState("0");
  const safeValue = value ?? 0;
  const prefix = String(safeValue).startsWith("$") ? "$" : "";
  const suffix = String(safeValue).includes("k") ? "k" : String(safeValue).includes("M") ? "M" : "";
  const numStr = String(safeValue).replace(/[^0-9.]/g, "");
  const hasDecimal = numStr.includes(".");
  const target = parseFloat(numStr) || 0;
  const decimals = hasDecimal ? (numStr.split(".")[1] || "").length : 0;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString());
        if (progress >= 1) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay, decimals]);

  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white sm:text-4xl">
        {prefix}{display}{suffix}
      </p>
      <p className="mt-2 text-sm text-white/40">{label}</p>
    </div>
  );
}

function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [current, setCurrent] = useState({
    text: "Loading...",
    owner: null,
    price: "—",
    basePrice: 0,
    purchased_at: null,
    held: "—",
    countdown: null,
  });
  const [stats, setStats] = useState({ totalOwners: 0, totalVolume: "0", totalPurchases: 0 });
  const [activity, setActivity] = useState("low");
  const [records, setRecords] = useState({
    longestHold: { value: "—", holder: null },
    highestPrice: { value: "—", holder: null },
    mostPurchases: { value: "—", holder: null },
  });
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newText, setNewText] = useState("");
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutConfirm(false);
    router.push("/");
  }

  function handleReplaceClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowModal(true);
    setNewText("");
    setBuyError("");
  }

  async function handleBuy() {
    if (!newText.trim()) return;
    setBuying(true);
    setBuyError("");
    try {
      const res = await fetch("/api/messages/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText.trim(), nickname: user.nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBuyError(data.error || "Failed");
        return;
      }
      setShowModal(false);
      setCurrent({
        text: newText.trim(),
        owner: { nickname: user.nickname, id: user.id },
        price: current.price,
        purchased_at: new Date().toISOString(),
      });
      setStats((prev) => ({
        totalOwners: prev.totalOwners + 1,
        totalVolume: (parseFloat(prev.totalVolume) + parseFloat(current.price)).toFixed(2),
      }));
    } catch {
      setBuyError("Something went wrong");
    } finally {
      setBuying(false);
    }
  }

  useEffect(() => {
    async function fetchCurrent() {
      try {
        const res = await fetch("/api/messages/current");
        const data = await res.json();
        if (data.message) {
          setCurrent({
            text: data.message.text,
            owner: { nickname: data.message.owner_nickname, id: data.message.owner_id },
            price: String(data.message.price),
            basePrice: data.message.basePrice,
            purchased_at: data.message.purchased_at,
            held: data.message.held,
            heldSeconds: data.message.heldSeconds,
            countdown: data.message.countdown,
          });
          setStats(data.stats);
          setActivity(data.activity);
          setRecords(data.records);
        }
      } catch {}
    }
    fetchCurrent();

    // SSE for real-time updates
    const evtSource = new EventSource("/api/events");

    evtSource.addEventListener("message_update", (e) => {
      const data = JSON.parse(e.data);
      setCurrent((prev) => ({
        ...prev,
        text: data.text,
        owner: data.owner,
        price: data.price,
        basePrice: parseFloat(data.price),
        purchased_at: data.purchased_at,
        held: "0s",
        heldSeconds: 0,
      }));
      if (data.activity) setActivity(data.activity);
      // Refresh full data after message update
      fetchCurrent();
    });

    evtSource.onerror = () => {
      evtSource.close();
      // Reconnect after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    };

    return () => evtSource.close();
  }, []);

  // Client-side timer for held time and countdown (updates every second)
  const [heldDisplay, setHeldDisplay] = useState("—");
  const [countdownDisplay, setCountdownDisplay] = useState(null);

  useEffect(() => {
    if (!current.purchased_at) return;

    function formatHeld(seconds) {
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (d > 0) return `${d}d ${h}h ${m}m`;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    }

    function tick() {
      const heldSec = (Date.now() - new Date(current.purchased_at).getTime()) / 1000;
      setHeldDisplay(formatHeld(Math.max(0, heldSec)));

      // Calculate countdown client-side
      const hours = heldSec / 3600;
      if (hours < 6) {
        const secUntil = Math.max(0, Math.round((6 - hours) * 3600));
        setCountdownDisplay({ label: "Decrease starts in", seconds: secUntil });
      } else {
        const currentHour = Math.floor(hours);
        const secUntil = Math.max(0, Math.round((currentHour + 1) * 3600 - heldSec));
        setCountdownDisplay({ label: "Next decrease in", seconds: secUntil });
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [current.purchased_at]);

  const activityConfig = {
    low: { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Low", icon: "●" },
    medium: { color: "text-orange-400", bg: "bg-orange-400/10", label: "Medium", icon: "●●" },
    high: { color: "text-emerald-400", bg: "bg-emerald-400/10", label: "High", icon: "●●●" },
  };

  const act = activityConfig[activity] || activityConfig.low;

  return (
    <main className="noise relative min-h-screen">
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="animate-fade-in-up glass rounded-3xl px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                1M
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                One<span className="gradient-text">Message</span>
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-2">
              <Link href="/history">
                <Button variant="ghost" size="sm">History</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm">Leaderboard</Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${user.id}`}>
                    <Button variant="glow" size="sm">
                      <div className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
                        {user.nickname.charAt(0)}
                      </div>
                      {user.nickname}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setShowLogoutConfirm(true)}>Logout</Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="gradient" size="sm">Sign in</Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mt-12 sm:mt-16">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Main message card */}
            <div className="animate-fade-in-up-delay-1 space-y-8">
              <div className="gradient-border glass-strong p-8 sm:p-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-widest text-white/40">
                    Live now
                  </span>
                </div>
                <h2 className="text-3xl font-bold leading-snug text-white sm:text-4xl lg:text-[2.75rem]">
                  {current.text}
                </h2>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {current.owner && (
                    <button
                      type="button"
                      onClick={() => router.push(`/profile/${current.owner.id}`)}
                      className="group flex items-center gap-3 rounded-full border border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-5 py-3 transition-all duration-300 hover:border-indigo-400/30 hover:from-indigo-500/20 hover:to-purple-500/20 hover:shadow-[0_0_20px_rgba(129,140,248,0.15)] cursor-pointer"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                        {current.owner.nickname.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                        {current.owner.nickname}
                      </span>
                      <svg className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  )}
                  <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-white/70">{heldDisplay}</span>
                  </div>
                </div>
              </div>

              <p className="px-2 text-base leading-relaxed text-white/40">
                Be the next to own the internet&apos;s single message. Your words,
                visible to everyone, for as long as you hold the crown.
              </p>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Price card */}
              <div className="animate-fade-in-up-delay-2 glass-strong rounded-3xl p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                  Current price
                </p>
                <p className="mt-4 text-5xl font-bold text-white">
                  ${current.price}
                </p>

                {/* Countdown */}
                {countdownDisplay && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{countdownDisplay.label} {formatCountdown(countdownDisplay.seconds)}</span>
                  </div>
                )}

                {/* Activity */}
                <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${act.bg} ${act.color}`}>
                  <span className="animate-pulse">{act.icon}</span>
                  <span>{act.label} activity</span>
                </div>

                <Button variant="gradient" className="mt-6 w-full h-14 px-8 text-base" size="lg" onClick={handleReplaceClick}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Replace Message
                </Button>
              </div>

              {/* Stats */}
              <div className="animate-fade-in-up-delay-3 grid grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 text-center transition-all hover:border-white/15">
                  <StatCounter value={stats.totalOwners} label="Owners" delay={300} />
                </div>
                <div className="glass rounded-2xl p-5 text-center transition-all hover:border-white/15">
                  <StatCounter value={`$${stats.totalVolume}`} label="Volume" delay={500} />
                </div>
                <div className="glass rounded-2xl p-5 text-center transition-all hover:border-white/15">
                  <StatCounter value={stats.totalPurchases} label="Sales" delay={700} />
                </div>
              </div>

              {/* Records */}
              <div className="animate-fade-in-up-delay-3 glass rounded-3xl p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-white/30 mb-4">Records</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Longest hold
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{records.longestHold.value}</span>
                      {records.longestHold.holder && (
                        <span className="ml-2 text-xs text-white/30">by {records.longestHold.holder}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                      Highest price
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{records.highestPrice.value}</span>
                      {records.highestPrice.holder && (
                        <span className="ml-2 text-xs text-white/30">by {records.highestPrice.holder}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Most purchases
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{records.mostPurchases.value}</span>
                      {records.mostPurchases.holder && (
                        <span className="ml-2 text-xs text-white/30">by {records.mostPurchases.holder}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 sm:mt-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                title: "One message, entire internet",
                desc: "A single public message that anyone can see and replace. Simple, transparent, fair.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                title: "Secure & governed",
                desc: "Clear rules, transparent pricing, and fair ownership. Your purchase is your claim.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                ),
                title: "Full history & leaderboard",
                desc: "Every purchase is recorded. See who owned it, how long, and for how much.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className={`animate-fade-in-up-delay-${i + 1} glass group rounded-3xl p-7 transition-all duration-300 hover:border-indigo-400/20 hover:shadow-[0_0_40px_rgba(129,140,248,0.08)]`}
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 transition-colors group-hover:from-indigo-500/30 group-hover:to-purple-500/30">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 glass rounded-3xl px-6 py-6 sm:px-8 sm:py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-white/30">
              OneMessage &mdash; One message for the internet.
            </p>
            <div className="flex gap-5">
              <Link href="/terms" className="text-sm text-white/30 transition hover:text-white/70">Terms</Link>
              <Link href="/privacy" className="text-sm text-white/30 transition hover:text-white/70">Privacy</Link>
              <Link href="/about" className="text-sm text-white/30 transition hover:text-white/70">About</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Replace Message Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="animate-fade-in-up relative z-10 w-full max-w-lg glass-strong rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Replace Message</h2>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white transition">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
              <p className="text-xs text-white/40 mb-1">Current price</p>
              <p className="text-2xl font-bold text-white">${current.price}</p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-white/50">
                Your new message
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/20 resize-none"
              />
              <p className="mt-2 text-xs text-white/30">{newText.length} / 500</p>
            </div>

            {buyError && (
              <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {buyError}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="gradient" className="flex-1" onClick={handleBuy} disabled={buying || !newText.trim()}>
                {buying ? "Buying..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="animate-fade-in-up relative z-10 w-full max-w-sm glass-strong rounded-3xl p-8 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-400/10 text-red-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Sign out?</h2>
            <p className="mt-2 text-sm text-white/40">
              You&apos;ll need to sign in again to replace messages.
            </p>
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
  );
}
