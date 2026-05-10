"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Agenda" },
  { href: "/saved", label: "Guardados" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-8 h-[64px] flex items-center justify-between">
        <Link href="/" className="group">
          <span className="text-[18px] tracking-[-0.02em] text-neutral-900 transition-opacity group-hover:opacity-60">
            <span className="font-light italic">Yetz</span><span className="font-extralight">Art</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-1.5 text-[12px] font-medium tracking-wide transition-all duration-300 rounded-full ${
                pathname === link.href
                  ? "text-white bg-neutral-900"
                  : "text-neutral-400 hover:text-neutral-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
