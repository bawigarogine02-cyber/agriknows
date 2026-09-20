"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, MapPin, UserCheck, Sprout, Microscope } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";

export default function CompleteProfilePage() {
  const [selectedRole, setSelectedRole] = useState<"Farmer" | "Researcher">("Farmer");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Failed to save profile details.");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="!min-h-0 bg-[#FDFDFB]">
      <section aria-labelledby="complete-profile-heading" className="mx-auto max-w-4xl py-8 md:py-14">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_70px_rgba(45,90,39,0.12)] ring-1 ring-[#E2E8E1]">
          <div className="bg-[#2D5A27] px-6 py-8 text-white sm:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD700] text-[#1A201A]">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFD700]">AgriKnow Setup</span>
            </div>
            <h1 id="complete-profile-heading" className="mt-4 text-2xl font-bold tracking-[-0.02em] sm:text-3xl text-white">
              Complete Your Account Profile
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Welcome! Please select your role and enter your address to finish setting up your dashboard access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 sm:p-10">
            {error && (
              <div role="alert" className="rounded-lg border border-[#e8b9a5] bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]">
                {error}
              </div>
            )}

            <div>
              <label className="mb-3 block text-sm font-bold text-[#1A201A]">Select Your Primary Role</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("Farmer")}
                  className={`flex flex-col items-start p-5 rounded-xl border text-left transition ${
                    selectedRole === "Farmer"
                      ? "border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]"
                      : "border-[#E2E8E1] bg-white hover:border-[#2D5A27]/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D5A27] text-white">
                      <Sprout className="h-5 w-5" />
                    </div>
                    {selectedRole === "Farmer" && <UserCheck className="h-5 w-5 text-[#2D5A27]" />}
                  </div>
                  <span className="font-bold text-[#1A201A]">Farmer</span>
                  <span className="mt-1 text-xs text-[#5C635A]">
                    Access crop suitability, AI land analysis, and personalized farming recommendations.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("Researcher")}
                  className={`flex flex-col items-start p-5 rounded-xl border text-left transition ${
                    selectedRole === "Researcher"
                      ? "border-[#2D5A27] bg-[#2D5A27]/5 ring-2 ring-[#2D5A27]"
                      : "border-[#E2E8E1] bg-white hover:border-[#2D5A27]/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B4513] text-white">
                      <Microscope className="h-5 w-5" />
                    </div>
                    {selectedRole === "Researcher" && <UserCheck className="h-5 w-5 text-[#2D5A27]" />}
                  </div>
                  <span className="font-bold text-[#1A201A]">Researcher</span>
                  <span className="mt-1 text-xs text-[#5C635A]">
                    Publish agricultural papers, review farmer inquiries, and contribute agronomic data.
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="address-input" className="mb-2 block text-sm font-semibold text-[#1A201A]">
                Location / Farm Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7B8578]" aria-hidden="true" />
                <input
                  id="address-input"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Central Valley, Sector 4, Region IX"
                  className="h-12 w-full rounded-lg border border-[#E2E8E1] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/15"
                />
              </div>
              <p className="mt-1.5 text-xs text-[#5C635A]">
                Your location helps tailor climate and soil data for crop recommendations.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-lg bg-[#2D5A27] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3D1A] focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? "Saving details..." : "Complete Setup & Proceed to Dashboard"}
            </button>
          </form>
        </div>
      </section>
    </PageContainer>
  );
}
