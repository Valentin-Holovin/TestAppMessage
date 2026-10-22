import { safeReturnTo } from "../lib/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getClientAuth, authError } from "../lib/firebase/client";
import { useAuth } from "../components/auth/AuthProvider";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";

export default function Login() {
  const router = useRouter();
  const { syncProfile } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", nickname: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(getClientAuth(), form.email.trim(), form.password);
      await syncProfile(form.nickname.trim() || undefined);
      router.push(safeReturnTo(router.query.next));
    } catch (err) {
      setError(authError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign in — OneMessage</title>
        <meta name="description" content="Sign in to your OneMessage account to publish messages on the boards." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://onemessage.io/login" />
      </Head>

      <main className="noise relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />

        <div className="animate-fade-in-up relative z-10 mx-auto w-full max-w-lg">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>

          <div className="glass-strong rounded-none p-8 sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-none pixel-fill   text-xl font-bold text-white ">
                1M
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-white/40">
                Sign in to claim or manage messages.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-6 rounded-none border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/50">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-none border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-lime-300 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/50">
                  Password
                </label>
                <input
                  id="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-none border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-lime-300 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
              <details className="text-sm text-white/50">
                <summary className="cursor-pointer">Finish an incomplete registration</summary>
                <label htmlFor="nickname" className="mt-3 block">Nickname (only for a new profile)</label>
                <input id="nickname" autoComplete="nickname" minLength={2} maxLength={20}
                  value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  placeholder="Choose your nickname" className="mt-2 w-full px-4 py-3 text-white" />
              </details>
              <Button type="submit" variant="gradient" className="mt-2 w-full h-14 px-8 text-base" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-xs font-medium text-white/25">or</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <p className="text-center text-sm text-white/40">
              Don&apos;t have an account?{" "}
              <Link href={{ pathname: "/register", query: { next: safeReturnTo(router.query.next) } }} className="font-medium text-lime-300 transition hover:text-lime-300">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
