import { ArrowRight, BarChart3, Sprout, Users } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import HeroSection from "@/components/ui/HeroSection";

const values = [
  {
    title: "Clarity",
    description: "We simplify complexity without losing nuance.",
    icon: Sprout,
  },
  {
    title: "Collaboration",
    description: "Good agriculture is a team effort across borders and disciplines.",
    icon: Users,
  },
  {
    title: "Evidence-based",
    description: "Every recommendation traces back to real, verifiable data.",
    icon: BarChart3,
  },
];

const team = [
  {
    initials: "AO",
    name: "Adaeze Obi",
    role: "Co-Founder & CEO",
    bio: "Connecting smallholder farmers to modern agronomic science.",
  },
  {
    initials: "JA",
    name: "Dr. James Adeyemi",
    role: "Chief Agronomist",
    bio: "Twenty years studying soil health across West Africa.",
  },
  {
    initials: "ML",
    name: "Mei Lin",
    role: "Head of Engineering",
    bio: "Building resilient systems for low-connectivity environments.",
  },
  {
    initials: "TB",
    name: "Tunde Bakare",
    role: "Community Lead",
    bio: "Bridging extension workers and the platform they rely on.",
  },
];

const stats = [
  { value: "12,000+", label: "Farmers reached" },
  { value: "8", label: "Countries" },
  { value: "340+", label: "Research papers indexed" },
  { value: "92%", label: "Decision satisfaction rate" },
];

export default function AboutPage() {
  return (
    <>
      <HeroSection
        headingSize="small"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
        badge="Our Story"
        title={
          <>
            We believe every farmer deserves better information.
          </>
        }
        subtitle="AgriKnow was built to close the gap between agricultural knowledge and the people who need it most."
        primaryCta={{ label: "Get Started", href: "/auth" }}
        secondaryCta={{ label: "Contact Us", href: "/contact" }}
        rightCardTitle="From seed to signal"
        rightCardItems={[
          { label: "Field insights", value: "24/7" },
          { label: "Decision support", value: "AI-driven" },
          { label: "Community learning", value: "Live" },
        ]}
      />

      <PageContainer className="!py-0">

      <section
        aria-labelledby="mission-heading"
        className="grid gap-10 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:py-32"
      >
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">
            Our Mission
          </p>
          <h2
            id="mission-heading"
            className="mt-4 max-w-md text-4xl leading-tight tracking-[-0.04em] sm:text-5xl"
          >
            <span>Making agricultural intelligence accessible to all.</span>
          </h2>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-[#5C635A]">
          <span>
            AgriKnow turns raw field data, scientific research, and environmental
            signals into clear, actionable guidance for every grower, researcher,
            and extension worker — no matter where they work.
          </span>
        </p>
      </section>

      <section aria-labelledby="values-heading" className="py-24 lg:py-32">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">
            What we stand for
          </p>
          <h2 id="values-heading" className="mt-3 text-4xl tracking-[-0.04em] sm:text-5xl">
            Our Values
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E2E8E1] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B8CFB4] hover:shadow-lg hover:shadow-[#2D5A27]/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3E7] text-[#2D5A27]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-8 text-2xl tracking-[-0.03em]">
                <span>{title}</span>
              </h3>
              <p className="mt-3 leading-7 text-[#5C635A]">
                <span>{description}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="team-heading" className="py-24 lg:py-32">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B4513]">
            Our Team
          </p>
          <h2 id="team-heading" className="mt-3 text-4xl tracking-[-0.04em] sm:text-5xl">
            The people behind AgriKnow
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map(({ initials, name, role, bio }) => (
            <article
              key={name}
              className="rounded-2xl border border-[#E2E8E1] bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B8CFB4] hover:shadow-lg hover:shadow-[#2D5A27]/10"
            >
              <div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3E7] font-semibold text-[#2D5A27]"
                aria-hidden="true"
              >
                <span>{initials}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.02em]">
                <span>{name}</span>
              </h3>
              <p className="mt-1 text-sm text-[#8B4513]">
                <span>{role}</span>
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5C635A]">
                <span>{bio}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="impact-heading" className="rounded-2xl bg-[#F0F7EE] px-6 py-20 sm:px-10 lg:px-16">
        <h2 id="impact-heading" className="sr-only">
          AgriKnow impact
        </h2>
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <dt className="text-4xl font-bold tracking-[-0.04em] text-[#2D5A27]">
                <span>{value}</span>
              </dt>
              <dd className="mt-1 text-sm text-[#5C635A]">
                <span>{label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="my-24 flex flex-col items-center rounded-2xl bg-[#2D5A27] px-6 py-24 text-center text-white lg:my-32"
      >
        <h2 id="cta-heading" className="text-4xl font-bold tracking-[-0.04em]">
          Join the community growing smarter.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[#A8C5A3]">
          Get started with AgriKnow today — free for the first season.
        </p>
        <a
          href="/auth"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FFD700] px-8 py-3 font-semibold text-[#1A201A] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#2D5A27]"
        >
          <span>Get Started</span>
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      </section>
      </PageContainer>
    </>
  );
}
