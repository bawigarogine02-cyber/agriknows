"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Leaf, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";

const roles = ["Farmer", "Agronomist", "Researcher", "Agricultural Consultant"];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to create your account.");
      setIsSubmitting(false);
      return;
    }
    router.push("/dashboard");
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
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8B4513]">
                Your knowledge journey starts here
              </p>
              <h1
                id="auth-heading"
                className="text-3xl font-bold tracking-[-0.03em] text-[#1A201A] sm:text-4xl"
              >
                Create your account
              </h1>
              <p className="mt-3 text-base leading-6 text-[#5C635A]">
                Join a community cultivating better outcomes for agriculture.
              </p>
            </header>

            {error && <p role="alert" className="mb-5 rounded-lg border border-[#e8b9a5] bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="full-name" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                  <input
                    id="full-name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                    name="name"
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  />
                </div>
              </div>

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
                    name="email"
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1A201A]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Enter your password"
                    name="password"
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

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue=""
                    required
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white px-4 text-sm text-[#5C635A] outline-none focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                    <input
                      id="address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Enter your address"
                      name="address"
                      className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat your password"
                    name="confirmPassword"
                    className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#7B8578] hover:text-[#2D5A27]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm leading-5 text-[#5C635A]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-[#E2E8E1] accent-[#2D5A27]"
                />
                <span>
                  I agree to the{" "}
                  <a href="/legal" className="font-semibold text-[#2D5A27] hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/legal" className="font-semibold text-[#2D5A27] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-[#2D5A27] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3D1A] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:ring-offset-2"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#5C635A]">
              Already have an account?{" "}
              <a href="/login" className="font-bold text-[#2D5A27] hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
