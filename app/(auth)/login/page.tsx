"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Leaf, LockKeyhole, Mail } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";

export const dynamic = "force-dynamic";

function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const googleError = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const response = await fetch("/api/auth/google");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Google sign-in is not configured.");
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Unable to connect to sign-in provider.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({ error: "Server error (500). Please check database connection on Hostinger." }));
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        setIsSubmitting(false);
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="!min-h-0 bg-[#FDFDFB]">
      <section
        aria-labelledby="auth-heading"
        className="mx-auto max-w-6xl py-6 md:py-10 lg:py-12"
      >
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-[0_20px_70px_rgba(45,90,39,0.12)] ring-1 ring-[#E2E8E1] lg:grid-cols-[0.92fr_1.08fr]">
          <figure className="relative hidden min-h-[680px] overflow-hidden bg-[#2D5A27] lg:block">
            <img
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80"
              alt="Sprouting seedling"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[#163817]/55" />
            <figcaption className="absolute inset-x-0 bottom-0 p-12 text-white">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFD700] text-[#1A201A]">
                <Leaf className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">
                Welcome to AgriKnow
              </p>
              <h2 className="max-w-md text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-white">
                Empowering Agriculture Through Knowledge
              </h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-white/80">
                Connect with practical insights, research, and a growing community
                shaping a more sustainable future.
              </p>
            </figcaption>
          </figure>

          <div className="p-6 sm:p-10 lg:px-14 lg:py-12">
            <header className="mb-8">
              <div className="mb-7 flex items-center gap-2 text-[#2D5A27] lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D5A27] text-white">
                  <Leaf className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xl font-bold">AgriKnow</span>
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8B4513]">
                Your knowledge journey starts here
              </p>
              <h1
                id="auth-heading"
                className="text-3xl font-bold tracking-[-0.03em] text-[#1A201A] sm:text-4xl"
              >
                Welcome back
              </h1>
              <p className="mt-3 text-base leading-6 text-[#5C635A]">
                Sign in to continue growing with AgriKnow.
              </p>
            </header>

            {(error || googleError) && (
              <p role="alert" className="mb-5 rounded-lg border border-[#e8b9a5] bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]">
                {error || (googleError === "google_cancelled" ? "Google sign-in was cancelled." : "Google sign-in failed. Please try again or use your email and password.")}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1A201A]">
                    Password
                  </label>
                  <a href="#forgot-password" className="text-xs font-semibold text-[#2D5A27] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#7B8578] hover:text-[#2D5A27]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-[#2D5A27] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3D1A] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:ring-offset-2"
              >
                {isSubmitting ? "Signing in..." : "Log In"}
              </button>
            </form>

            <div className="mt-7">
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-[#E2E8E1]" />
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#7B8578]">
                  or continue with
                </span>
                <span className="h-px flex-1 bg-[#E2E8E1]" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2E8E1] bg-white text-sm font-semibold text-[#1A201A] transition hover:border-[#2D5A27] hover:bg-[#F8FAF7]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">
                  G
                </span>
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-[#5C635A]">
              New to AgriKnow?{" "}
              <a href="/register" className="font-bold text-[#2D5A27] hover:underline">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FDFDFB]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2D5A27] border-t-transparent" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
