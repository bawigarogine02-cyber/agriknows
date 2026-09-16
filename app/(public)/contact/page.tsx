import PageContainer from "@/components/layout/PageContainer";
import HeroSection from "@/components/ui/HeroSection";

export default function ContactPage() {
  return (
    <>
      <HeroSection
        headingSize="small"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
        badge="Contact"
        title={
          <>
            Grow with a team that understands your field.
          </>
        }
        subtitle="Speak with our agricultural specialists about onboarding, field workflows, research partnerships, and practical support for your growing operation."
        primaryCta={{ label: "Get Started", href: "/auth" }}
        secondaryCta={{ label: "Learn More", href: "/about" }}
        rightCardTitle="Talk to the team"
        rightCardItems={[
          { label: "Response time", value: "< 24h" },
          { label: "Support", value: "Live" },
          { label: "Partnering", value: "Global" },
        ]}
      />

      <PageContainer className="!py-0">
        <section className="grid gap-6 px-6 py-16 lg:grid-cols-3 lg:px-10">
          <div className="rounded-2xl border border-[#E2E8E1] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1A201A]">General inquiries</h2>
            <p className="mt-3 text-[#5C635A]">hello@agriknow.com</p>
          </div>
          <div className="rounded-2xl border border-[#E2E8E1] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1A201A]">Partnerships</h2>
            <p className="mt-3 text-[#5C635A]">partners@agriknow.com</p>
          </div>
          <div className="rounded-2xl border border-[#E2E8E1] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1A201A]">Support</h2>
            <p className="mt-3 text-[#5C635A]">support@agriknow.com</p>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
