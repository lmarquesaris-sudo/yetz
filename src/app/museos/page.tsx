"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { SPACES } from "@/lib/spaces-data";
import { useState, useEffect, useRef } from "react";

export default function MuseosPage() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--ice)" }}>
      <Navbar />

      <main className="pt-[100px] pb-24">
        {/* Hero */}
        <div
          className="max-w-[1100px] mx-auto px-8 mb-16 transition-all duration-[1000ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-px bg-neutral-900" />
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
              Museos de Barcelona
            </span>
          </div>
          <h1
            className="text-[clamp(36px,6vw,56px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.05]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Los grandes{" "}
            <span className="italic font-light">museos</span>
          </h1>
          <p className="mt-5 text-[16px] text-neutral-400 font-light leading-relaxed max-w-lg">
            Los 8 museos imprescindibles de Barcelona. Información, exposiciones
            temporales y todo lo que necesitas antes de tu visita.
          </p>
        </div>

        {/* Museum grid */}
        <div ref={gridRef} className="max-w-[1100px] mx-auto px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPACES.map((space, idx) => (
              <Link
                key={space.slug}
                href={`/museos/${space.slug}`}
                className="group relative rounded-[24px] overflow-hidden bg-neutral-100 aspect-[3/4] transition-all duration-[1100ms]"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(40px)",
                  transitionDelay: `${idx * 80}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Image */}
                <img
                  src={space.image}
                  alt={space.shortName}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div
                    className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.25em] mb-2"
                  >
                    {space.neighborhood}
                  </div>
                  <h2
                    className="text-[22px] font-medium text-white tracking-[-0.02em] leading-[1.2] mb-1"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {space.shortName}
                  </h2>
                  <p className="text-[12px] text-white/50 font-light leading-relaxed line-clamp-2 group-hover:text-white/70 transition-colors duration-500">
                    {space.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-[11px] text-white/80 font-medium">
                      Explorar
                    </span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="1.5" strokeOpacity="0.8"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Accent line at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: space.accent }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="max-w-[1100px] mx-auto px-8 mt-20 transition-all duration-[1000ms]"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "600ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="glass-card rounded-[24px] p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-[22px] font-medium text-neutral-900 tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                No sabes por dónde empezar?
              </h3>
              <p className="text-[14px] text-neutral-400 font-light mt-2">
                Cuéntanos qué te apetece y te proponemos un plan perfecto.
              </p>
            </div>
            <Link
              href="/sorprendeme"
              className="btn-primary whitespace-nowrap flex items-center gap-2"
            >
              Sorpréndeme
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-[1100px] mx-auto px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="group">
            <span
              className="text-[17px] text-neutral-900 tracking-[-0.02em] transition-opacity group-hover:opacity-60"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span className="italic font-medium">Yetz</span>
            </span>
          </Link>
          <p className="text-[11px] text-neutral-300 tracking-wide font-light">
            Tu portal cultural de Barcelona
          </p>
        </div>
      </footer>
    </div>
  );
}
