"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Agenda" },
  { href: "/calendario", label: "Calendari" },
  { href: "/sorprendeme", label: "Sorprèn-me" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div
        className={`transition-all duration-700 ${
          scrolled
            ? "bg-[var(--gallery-white)]/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="max-w-[1400px] mx-auto px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <span
              className="text-[28px] tracking-[-0.04em] text-[var(--gallery-black)] transition-all duration-500 group-hover:opacity-60 font-editorial"
            >
              <span className="italic font-medium">Yetz</span>
            </span>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-[var(--accent)] font-medium mt-1">
              Barcelona
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-all duration-500 ${
                    isActive
                      ? "text-[var(--gallery-black)]"
                      : "text-neutral-400 hover:text-[var(--gallery-black)]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-[var(--gallery-black)] animate-reveal" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-5 h-[1.5px] bg-[var(--gallery-black)] transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-[var(--gallery-black)] transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-[var(--gallery-black)] transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[72px] bg-[var(--gallery-white)]/98 backdrop-blur-2xl transition-all duration-500 ${
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="px-8 py-8 flex flex-col gap-1 border-t border-neutral-100/50">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-4 text-[13px] font-medium tracking-[0.08em] uppercase transition-all duration-300 border-b border-neutral-100/50 ${
                  isActive
                    ? "text-[var(--gallery-black)]"
                    : "text-neutral-400 hover:text-[var(--gallery-black)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
