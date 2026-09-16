"use client";

import { useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import HeroSection from "@/components/ui/HeroSection";

type DocumentKey = "privacy" | "terms";

type Section = {
  id: string;
  title: string;
  content: string[];
  bullets?: string[];
};

const documents: Record<
  DocumentKey,
  {
    label: string;
    eyebrow: string;
    title: string;
    intro: string;
    sections: Section[];
  }
> = {
  privacy: {
    label: "Privacy Policy",
    eyebrow: "Your trust matters",
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how AgriKnow collects, uses, and protects information when you use our agricultural intelligence platform.",
    sections: [
      {
        id: "privacy-introduction",
        title: "1. Introduction & Scope",
        content: [
          "This policy applies to AgriKnow websites, applications, and services that link to this document. By using AgriKnow, you acknowledge the practices described here. We design our services to help agricultural communities make informed decisions while respecting the people and farms behind the data.",
        ],
      },
      {
        id: "privacy-information",
        title: "2. Information We Collect",
        content: [
          "We collect only the information needed to provide, secure, and improve our services. Depending on how you use AgriKnow, this may include:",
        ],
        bullets: [
          "Personal data such as your name, email address, organization, role, and account credentials.",
          "Farm data such as field boundaries, crop details, soil observations, weather notes, and yield information that you choose to provide.",
          "Usage analytics including device information, feature interactions, diagnostic logs, and approximate location used to improve reliability.",
        ],
      },
      {
        id: "privacy-use",
        title: "3. How We Use Your Information",
        content: [
          "AgriKnow uses information to provide practical, responsible decision support and to operate a dependable service. We may use it to:",
        ],
        bullets: [
          "Personalize agronomic recommendations and surface relevant field insights.",
          "Maintain, troubleshoot, and improve platform performance, accessibility, and security.",
          "Develop aggregated research and benchmarks that do not identify individual people or farms.",
        ],
      },
      {
        id: "privacy-sharing",
        title: "4. Data Sharing & Third Parties",
        content: [
          "We do not sell personal information or identifiable farm records. We may share limited information with trusted service providers who host, secure, analyze, or support AgriKnow under confidentiality obligations. We may also disclose information when required by law, to protect safety and rights, or as part of a merger or acquisition.",
        ],
      },
      {
        id: "privacy-security",
        title: "5. Data Security & Agricultural Data Protection",
        content: [
          "We use access controls, encryption in transit, monitoring, and regular security reviews to protect your information. Access to agricultural data is limited to authorized personnel and services that need it for an agreed purpose. No online service can guarantee absolute security, so please choose strong credentials and tell us promptly about suspected unauthorized access.",
        ],
      },
      {
        id: "privacy-rights",
        title: "6. Your Rights",
        content: [
          "Subject to applicable law, you may request access to, correction of, deletion of, or a portable copy of your personal information. You may also withdraw consent where processing is based on consent. We may need to verify your identity before fulfilling a request; contact us and we will respond within the period required by law.",
        ],
      },
      {
        id: "privacy-cookies",
        title: "7. Cookies & Tracking",
        content: [
          "AgriKnow uses essential cookies to keep you signed in and remember preferences. With your permission, we may use analytics technologies to understand feature usage and improve the experience. You can manage non-essential cookies through your browser settings, though some features may not work as intended.",
        ],
      },
      {
        id: "privacy-contact",
        title: "8. Contact Us",
        content: [
          "Questions, requests, or concerns about privacy can be sent to privacy@agriknow.com. Please include enough detail for us to understand and respond to your request.",
        ],
      },
    ],
  },
  terms: {
    label: "Terms & Conditions",
    eyebrow: "Clear expectations",
    title: "Terms & Conditions",
    intro:
      "These terms set out the agreement between you and AgriKnow when you access or use our platform, tools, and agricultural insights.",
    sections: [
      {
        id: "terms-acceptance",
        title: "1. Acceptance of Terms",
        content: [
          "By creating an account or using AgriKnow, you agree to these Terms & Conditions and our Privacy Policy. If you use the service on behalf of an organization, you confirm that you have authority to bind that organization.",
        ],
      },
      {
        id: "terms-service",
        title: "2. Description of Service",
        content: [
          "AgriKnow provides a digital platform for organizing agricultural information, exploring environmental signals, and receiving decision-support insights. Our tools support professional judgment; they do not replace independent agronomic, legal, financial, or safety advice.",
        ],
      },
      {
        id: "terms-accounts",
        title: "3. User Accounts & Eligibility",
        content: [
          "AgriKnow is intended for farmers, researchers, agronomists, and other agricultural professionals who can form a binding agreement. You are responsible for accurate account details, protecting your sign-in credentials, and activity conducted through your account.",
        ],
      },
      {
        id: "terms-use",
        title: "4. Acceptable Use Policy",
        content: [
          "You may not misuse the platform or compromise the experience for others. Prohibited activity includes:",
        ],
        bullets: [
          "Attempting to access another person’s account, private farm records, or non-public systems.",
          "Uploading malicious code, unlawful content, or information you do not have permission to share.",
          "Using automated extraction, reverse engineering, or the service to build a competing database without written permission.",
        ],
      },
      {
        id: "terms-ip",
        title: "5. Intellectual Property",
        content: [
          "AgriKnow and its software, visual design, trademarks, documentation, and original content belong to AgriKnow or its licensors. We grant you a limited, non-exclusive right to use the service for its intended purpose while your account is active.",
        ],
      },
      {
        id: "terms-ownership",
        title: "6. Agricultural Data Ownership",
        content: [
          "You retain ownership of farm information you submit. You grant AgriKnow the limited license needed to host, process, display, and secure that information for the service. We may use aggregated, de-identified insights to improve agricultural knowledge without identifying you or your farm.",
        ],
      },
      {
        id: "terms-liability",
        title: "7. Limitation of Liability",
        content: [
          "To the maximum extent permitted by law, AgriKnow is not responsible for indirect, incidental, or consequential loss arising from use of the service, including decisions made from platform insights. Our total liability for claims relating to the service will not exceed amounts paid to AgriKnow in the preceding twelve months.",
        ],
      },
      {
        id: "terms-law",
        title: "8. Governing Law",
        content: [
          "These terms are governed by the laws applicable in the jurisdiction where AgriKnow is established, without regard to conflict-of-law principles. Courts in that jurisdiction will have authority over disputes unless applicable law provides otherwise.",
        ],
      },
      {
        id: "terms-modifications",
        title: "9. Modifications to Terms",
        content: [
          "We may update these terms as our services, laws, or agricultural practices evolve. We will post the revised version and update the date below. Material changes will be communicated through the platform or by email where appropriate.",
        ],
      },
      {
        id: "terms-contact",
        title: "10. Contact Information",
        content: [
          "For questions about these terms, please contact legal@agriknow.com. We are happy to clarify how these expectations apply to your use of AgriKnow.",
        ],
      },
    ],
  },
};

export default function LegalPage() {
  const [activeDocument, setActiveDocument] = useState<DocumentKey>("privacy");
  const document = documents[activeDocument];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const body = document.sections
      .map(
        (section) =>
          `${section.title}\n${section.content.join("\n")}\n${
            section.bullets?.map((bullet) => `• ${bullet}`).join("\n") ?? ""
          }`,
      )
      .join("\n\n");

    const blob = new Blob(
      [
        `${document.title}\nLast updated: June 12, 2024\n\n${document.intro}\n\n${body}`,
      ],
      {
        type: "text/plain",
      },
    );

    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download =
      activeDocument === "privacy"
        ? "agriknow-privacy-policy.txt"
        : "agriknow-terms-and-conditions.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <HeroSection
        headingSize="small"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Legal" },
        ]}
        badge="Legal"
        title={
          <>
            Clear policy, trusted decisions.
          </>
        }
        subtitle="Review the policies that guide our platform, protect your data, and support responsible agricultural innovation."
        primaryCta={{ label: "Get Started", href: "/auth" }}
        secondaryCta={{ label: "Learn More", href: "/about" }}
        rightCardTitle="Responsible data use"
        rightCardItems={[
          { label: "Privacy", value: "Protected" },
          { label: "Security", value: "Secure" },
          { label: "Access", value: "Verified" },
        ]}
      />

      <PageContainer className="!py-0">
        <div className="px-6 py-16 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <aside
              className="lg:sticky lg:top-28 lg:self-start"
              aria-label="Legal document navigation"
            >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8B4513]">
              Documents
            </p>
            <div
              className="flex gap-2 overflow-x-auto border-b border-[#E2E8E1] pb-2 lg:block lg:space-y-2 lg:border-b-0 lg:pb-0"
              role="tablist"
              aria-label="Legal documents"
            >
              {(Object.keys(documents) as DocumentKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeDocument === key}
                  onClick={() => setActiveDocument(key)}
                  className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors lg:block lg:w-full ${
                    activeDocument === key
                      ? "bg-[#E7F0E4] text-[#2D5A27]"
                      : "text-[#5C635A] hover:bg-[#F1F4EF] hover:text-[#2D5A27]"
                  }`}
                >
                  <span>{documents[key].label}</span>
                </button>
              ))}
            </div>

            <nav
              className="mt-8 hidden border-l border-[#D6E2D2] pl-4 lg:block"
              aria-label={`${document.label} sections`}
            >
              <ol className="space-y-3">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      className="text-sm leading-5 text-[#687166] transition-colors hover:text-[#2D5A27]"
                      href={`#${section.id}`}
                    >
                      {section.title.replace(/^\d+\. /, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            </aside>

            <article
              className="min-w-0 rounded-2xl border border-[#E2E8E1] bg-white px-6 py-8 shadow-[0_8px_30px_rgba(45,90,39,0.05)] md:px-12 md:py-12"
              aria-live="polite"
            >
            <div className="flex flex-col gap-6 border-b border-[#E2E8E1] pb-8 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#8B4513]">
                  {document.eyebrow}
                </p>
                <h2 className="text-3xl font-bold text-[#1A201A] md:text-4xl">
                  {document.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#5C635A]">
                  {document.intro}
                </p>
                <p className="mt-5 text-sm font-medium text-[#687166]">
                  Last updated: <time dateTime="2024-06-12">June 12, 2024</time>
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D6E2D2] px-3 py-2 text-sm font-semibold text-[#2D5A27] transition-colors hover:bg-[#F1F4EF]"
                  aria-label="Print document"
                >
                  <Printer aria-hidden="true" className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2D5A27] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1E3D1A]"
                  aria-label="Download document"
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

              <div className="pt-8">
                {document.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 border-b border-[#EEF1EC] py-7 first:pt-0 last:border-b-0"
                  >
                    <h3 className="text-xl font-bold text-[#2D5A27] md:text-2xl">
                      {section.title}
                    </h3>

                    {section.content.map((paragraph) => (
                      <p
                        key={`${section.id}-${paragraph}`}
                        className="mt-4 text-base leading-8 text-[#3F473E]"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && (
                      <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-7 text-[#3F473E]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </article>
          </div>

          <div className="mb-12 flex items-center justify-center gap-3 rounded-2xl border border-[#E2E8E1] bg-[#F4F9F2] px-6 py-4 text-sm text-[#425143]">
            <FileText className="h-4 w-4 text-[#2D5A27]" aria-hidden="true" />
            <span>AgriKnow legal documents are reviewed regularly and updated as needed.</span>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
