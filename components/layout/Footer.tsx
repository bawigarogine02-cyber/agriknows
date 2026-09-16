"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Mail } from "lucide-react";

const SocialIcon = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href="#"
    className="rounded-full bg-gray-50 p-2 text-gray-400 transition-all hover:bg-green-50 hover:text-[#2D5A27]"
    aria-label={label}
    title={label}
  >
    <span className="flex h-5 w-5 items-center justify-center">{children}</span>
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/dashboard" || pathname === "/test") {
    return null;
  }

  return (
    <footer className="border-t border-gray-100 bg-white pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4 flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-[#2D5A27]" />
              <span className="text-xl font-bold text-[#2D5A27]">AgriKnow</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Empowering the agricultural community with data-driven insights and
              shared knowledge for a sustainable future.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#8B4513]">
              Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/science" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  Our Science
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#8B4513]">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/legal" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-gray-600 transition-colors hover:text-[#2D5A27]">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#8B4513]">
              Connect
            </h3>
            <div className="mb-6 flex space-x-4">
              <SocialIcon label="Facebook">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3h-3.1V7.5c0-.9.3-1.5 1.6-1.5H17V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.3v8h3.2Z" />
                </svg>
              </SocialIcon>

              <SocialIcon label="LinkedIn">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M6.94 8.5A1.56 1.56 0 1 1 6.9 5.4a1.56 1.56 0 0 1 .04 3.1ZM5.5 10h2.9v9H5.5v-9Zm5.1 0h2.8v1.2h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.46V19h-2.9v-17.5h2.9v-1.1c0-2.7-1.5-4.4-3.8-4.4-2.2 0-3.3 1.6-3.3 1.6l-.1.2v-1.3h-2.9v9Z" />
                </svg>
              </SocialIcon>

              <SocialIcon label="Instagram">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5-3.2a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
                </svg>
              </SocialIcon>
            </div>
            <a
              href="mailto:contact@agriknow.com"
              className="flex items-center space-x-2 text-sm text-gray-600 transition-colors hover:text-[#2D5A27]"
            >
              <Mail className="h-4 w-4" />
              <span>contact@agriknow.com</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between space-y-4 border-t border-gray-50 pt-8 md:flex-row md:space-y-0">
          <p className="text-center text-sm text-gray-400">
            &copy; {currentYear} AgriKnow. All rights reserved. Cultivating
            knowledge globally.
          </p>
          <div className="flex items-center space-x-2 text-xs font-medium italic text-gray-400">
            <span>Powered by AgriTech Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
