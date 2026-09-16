import { ArrowRight, Check } from "lucide-react";

export type HeroItem = {
  label: string;
  value: string;
};

export type HeroSectionProps = {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  features?: string[];
  rightCardTitle?: string;
  rightCardItems?: HeroItem[];
  height?: "short" | "tall";
  headingSize?: "large" | "small";
  breadcrumbs?: { label: string; href?: string }[];
};

export default function HeroSection({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  features = [],
  rightCardTitle,
  rightCardItems = [],
  height = "short",
  headingSize = "large",
  breadcrumbs,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#17351B] text-white shadow-xl shadow-[#2D5A27]/10"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1600&q=80')",
          backgroundPosition: "center center",
        }}
      />
      <div className="absolute inset-0 bg-[#123b2a]/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_50%)]" />

      <div
        className={`relative mx-auto grid w-full max-w-[1360px] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 ${
          height === "tall" ? "min-h-[760px] lg:py-12" : "min-h-[520px] lg:py-8"
        }`}
      >
        <div className="max-w-[700px] pt-2">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#DDEBD6]">
              {breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {crumb.href ? (
                    <a href={crumb.href} className="transition hover:text-white">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span aria-hidden="true">/</span>}
                </div>
              ))}
            </nav>
          )}

          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17351B]/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E4F1D9] backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#FFD700]" aria-hidden="true" />
            {badge}
          </p>

          <h1
            id="hero-heading"
            className={`max-w-[620px] font-bold leading-[0.82] tracking-[-0.06em] text-white ${
              headingSize === "small"
                ? "text-[2.3rem] sm:text-[3.1rem] lg:text-[4.2rem]"
                : "text-[3.2rem] sm:text-[4.3rem] lg:text-[6.2rem]"
            }`}
          >
            {title}
          </h1>

          <p className="mt-6 max-w-[560px] text-base leading-7 text-[#D7E5D6] sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={primaryCta.href}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#f4d23d] px-5 py-3 font-semibold text-[#17351B] shadow-lg shadow-black/15 transition hover:bg-[#f8de5d] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:ring-offset-[#17351B]"
            >
              <span>{primaryCta.label}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/5 px-5 py-3 font-semibold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:ring-offset-[#17351B]"
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>

          {features.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#E4F1D9]">
              {features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#FFD700]" aria-hidden="true" />
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {rightCardTitle || rightCardItems.length > 0 ? (
          <div className="relative hidden lg:flex lg:justify-end">
            <div className="w-full max-w-[420px] rounded-[18px] border border-white/15 bg-[#17351B]/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              {rightCardTitle && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FFD700]">
                  {rightCardTitle}
                </p>
              )}

              {rightCardItems.length > 0 ? (
                <>
                  <p className="mt-4 text-[1.15rem] font-bold leading-tight text-white">
                    Knowledge that grows with you.
                  </p>
                  <div className="mt-5 space-y-3 text-sm text-[#D7E5D6]">
                    {rightCardItems.map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                      >
                        <span>{label}</span>
                        <span className="font-semibold text-[#FFD700]">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
