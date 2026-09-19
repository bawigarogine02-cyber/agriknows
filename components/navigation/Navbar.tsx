"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, User, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Decision Support", href: "/decision-support" },
  { name: "About", href: "/about" },
  { name: "Privacy Policy", href: "/legal" },
  { name: "Terms & Conditions", href: "/legal#terms-acceptance" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/dashboard" || pathname === "/test") {
    return null;
  }

  const isLinkActive = (href: string) => {
    const target = href.split("#")[0];
    return pathname === target || (href === "/" && pathname === "/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2e4d3a] bg-[#0d2d20] text-white shadow-sm shadow-black/10">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-between">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="rounded-lg bg-[#1f4d37] p-2 transition-colors group-hover:bg-[#2e6044]">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                AgriKnow
              </span>
            </Link>
          </div>

          <div className="hidden items-center space-x-7 md:flex">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative pb-2 text-sm font-medium transition-colors hover:text-[#f7d13f] ${
                    active
                      ? "font-semibold text-[#f7d13f] after:absolute after:-bottom-[18px] after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#f7d13f]"
                      : "text-[#eaf5ea]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="mx-2 h-6 w-px bg-white/20" />
            <Link
              href="/auth"
              className="flex items-center space-x-1 text-sm font-medium text-[#eaf5ea] transition-colors hover:text-[#f7d13f]"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link
              href="/auth"
              className="rounded-full bg-[#f4d23d] px-5 py-2.5 text-sm font-semibold text-[#1b2f20] shadow-md transition-all hover:scale-[1.02] hover:bg-[#f6d84d]"
            >
              Get Started
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#f7d13f] focus:outline-none"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0d2d20] md:hidden animate-in slide-in-from-top duration-300">
          <div className="space-y-2 px-4 pb-6 pt-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block rounded-md border-l-2 px-3 py-3 text-base font-medium ${
                    active
                      ? "border-[#f7d13f] bg-white/5 text-[#f7d13f]"
                      : "border-transparent text-[#eaf5ea] hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="flex flex-col space-y-3 border-t border-white/10 pt-4">
              <Link
                href="/auth"
                className="block px-3 py-3 text-base font-medium text-[#eaf5ea] hover:text-[#f7d13f]"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="block w-full rounded-lg bg-[#f4d23d] px-6 py-3 text-center font-semibold text-[#1b2f20]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
