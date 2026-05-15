"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { SPACES } from "@/lib/spaces-data";
import { events as fallbackEvents } from "@/lib/data";
import { Event } from "@/lib/types";
import Link from "next/link";

export default function EspaciosPage() {
  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/events.json")
      .then((res) => res.json())
      .then((data: Event[]) => {
        if (data.length > 0) setEvents(data);
      })
      .catch(() => {});
  }, []);

  const spacesWithCounts = useMemo(() => {
    return SPACES.map((space) => {
      const count = events.filter((e) =>
        e.venue.toLowerCase().includes(space.venueFilter)
      ).length;
      return { ...space, count };
    }).sort((a, b) => b.count - a.count);
  }, [events]);

  if (!mounted) return null;

  const featured = spacesWithCounts.filter((s) => s.featured);
  const others = spacesWithCounts.filter((s) => !s.featured && s.count > 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-16">
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="max-w-xl animate-fade-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-px bg-neutral-900" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
                Directorio
              </span>
            </div>
            <h1
              className="text-[clamp(36px,6vw,56px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.05]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Espacios
              <br />
              <span className="italic text-neutral-400">y museos</span>
            </h1>
            <p className="mt-5 text-[15px] text-neutral-400 font-light leading-relaxed">
              Todos los museos, fundaciones y centros de arte de Barcelona.
              Consulta que exposiciones tienen activas ahora mismo.
            </p>
          </div>
        </div>
      </header>

      {/* Featured spaces — large cards */}
      <section className="max-w-[1100px] mx-auto px-8 pb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-px bg-neutral-900" />
          <h2 className="text-[11px] font-semibold text-neutral-900 uppercase tracking-[0.3em]">
            Grandes museos
          </h2>
          <div className="flex-1 divider-fade" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((space, i) => (
            <Link
              href={`/espacios/${space.slug}`}
              key={space.slug}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative overflow-hidden rounded-[20px] aspect-[3/2] bg-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-700 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                <img
                  src={space.image}
                  alt={space.shortName}
                  className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3
                    className="text-white text-[24px] font-semibold tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {space.shortName}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white/70 text-[12px] font-light">
                      {space.neighborhood}
                    </span>
                    <span className="h-[3px] w-[3px] rounded-full bg-white/40" />
                    <span className="text-white/90 text-[12px] font-semibold">
                      {space.count} {space.count === 1 ? "evento" : "eventos"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[12px] text-neutral-400 font-light leading-relaxed px-1 line-clamp-2">
                {space.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Other spaces — compact list */}
      {others.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-8 pb-28">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-px bg-neutral-300" />
            <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
              Otros espacios
            </h2>
            <div className="flex-1 divider-fade" />
          </div>

          <div className="space-y-2">
            {others.map((space, i) => (
              <Link
                href={`/espacios/${space.slug}`}
                key={space.slug}
                className="group flex items-center gap-6 py-5 px-5 rounded-2xl transition-all duration-500 hover:bg-white/70 hover:shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm">
                  <img
                    src={space.image}
                    alt={space.shortName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[16px] font-semibold text-neutral-900 tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {space.shortName}
                  </h3>
                  <p className="text-[12px] text-neutral-400 font-light mt-1">
                    {space.neighborhood}
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-neutral-900 flex-shrink-0">
                  {space.count} {space.count === 1 ? "evento" : "eventos"}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  className="text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200/40">
        <div className="max-w-[1100px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
              <span
                className="text-[20px] text-neutral-900 tracking-[-0.03em]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                <span className="italic font-medium">Yetz</span>
                <span className="font-normal">Art</span>
              </span>
            </Link>
            <p className="text-[11px] text-neutral-300 tracking-wider font-light">
              2026 YetzArt. Hecho en Barcelona.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
