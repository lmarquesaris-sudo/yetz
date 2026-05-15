"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSpaceBySlug, SPACES } from "@/lib/spaces-data";
import { MOCK_EVENTS } from "@/lib/mock-events";
import { useState, useEffect } from "react";

export default function MuseoDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const space = getSpaceBySlug(slug);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ice)" }}>
        <Navbar />
        <div className="text-center pt-[100px]">
          <h1 className="text-[24px] text-neutral-900 font-medium" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Museo no encontrado
          </h1>
          <Link href="/museos" className="text-[13px] text-neutral-400 hover:text-neutral-900 mt-4 inline-block">
            Volver a museos
          </Link>
        </div>
      </div>
    );
  }

  // Get events for this museum
  const museumEvents = MOCK_EVENTS.filter(
    (e) => e.venue.toLowerCase().includes(space.venueFilter.toLowerCase())
  );

  function formatDateRange(start: string, end: string) {
    const s = new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    const e = new Date(end).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return `${s} — ${e}`;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ice)" }}>
      <Navbar />

      {/* Hero with blurred background */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={space.image}
          alt={space.shortName}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[var(--ice)]" />

        <div
          className="relative z-10 max-w-[1100px] mx-auto px-8 h-full flex flex-col justify-end pb-12 transition-all duration-[1000ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Link href="/museos" className="text-[11px] text-white/60 hover:text-white/90 transition-colors duration-300">
              Museos
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-[11px] text-white/80">{space.shortName}</span>
          </div>

          <h1
            className="text-[clamp(36px,6vw,52px)] font-medium text-white tracking-[-0.03em] leading-[1.05]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {space.shortName}
          </h1>
          <p className="mt-3 text-[15px] text-white/60 font-light leading-relaxed max-w-lg">
            {space.description}
          </p>
        </div>
      </div>

      <main className="pb-24 -mt-2">
        <div className="max-w-[1100px] mx-auto px-8">
          {/* Info pills */}
          <div
            className="flex flex-wrap gap-3 mb-12 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "200ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[12px] text-neutral-500 font-light">{space.neighborhood}</span>
            </div>
            <div className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[12px] text-neutral-500 font-light">{space.address}</span>
            </div>
            <a
              href={space.website}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2 hover:border-neutral-300 transition-colors duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <span className="text-[12px] text-neutral-900 font-medium">Web oficial</span>
            </a>
          </div>

          {/* Exhibitions */}
          <div
            className="transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transitionDelay: "350ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-neutral-900" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
                Exposiciones ahora
              </span>
            </div>

            {museumEvents.length === 0 ? (
              <div className="glass-card rounded-[20px] p-12 text-center">
                <p className="text-[15px] text-neutral-400 font-light">
                  No hay exposiciones temporales en este momento.
                </p>
                <p className="text-[12px] text-neutral-300 mt-2">
                  Pronto actualizaremos con la programación real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {museumEvents.map((evt, idx) => (
                  <Link
                    key={evt.id}
                    href={`/evento/${evt.id}`}
                    className="group glass-card rounded-[20px] overflow-hidden transition-all duration-[1100ms]"
                    style={{
                      transitionDelay: `${400 + idx * 100}ms`,
                    }}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                      <img
                        src={evt.imageUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04]"
                        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5">
                      <h3
                        className="text-[18px] font-semibold text-neutral-900 leading-[1.3] tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                      >
                        {evt.title}
                      </h3>
                      <p className="text-[13px] text-neutral-400 font-light mt-2 line-clamp-2">
                        {evt.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[12px] text-neutral-400 font-light">
                          {formatDateRange(evt.startDate, evt.endDate)}
                        </span>
                        <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
                        <span className={`text-[12px] font-semibold ${evt.price === null ? "text-emerald-600" : "text-neutral-900"}`}>
                          {evt.price === null ? "Gratis" : `${evt.price} €`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
