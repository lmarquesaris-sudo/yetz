"use client";

import { Event } from "@/lib/types";
import { getFeaturedSpaces } from "@/lib/spaces-data";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

function formatDateRange(start: string, end: string) {
  if (!end) return "Permanente";
  const s = new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${s} — ${e}`;
}

interface MuseumExhibitionsProps {
  events: Event[];
}

export default function MuseumExhibitions({ events }: MuseumExhibitionsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
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

  const featuredSpaces = getFeaturedSpaces();

  const museumData = featuredSpaces.map((space) => {
    const museumEvents = events
      .filter((e) => e.venue.toLowerCase().includes(space.venueFilter))
      .slice(0, 4);
    return { ...space, events: museumEvents };
  }).filter((m) => m.events.length > 0);

  if (museumData.length === 0) return null;

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-[1100px] mx-auto px-8">
        {/* Section header */}
        <div
          className="mb-16 max-w-lg transition-all duration-[1000ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-neutral-900" />
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
              Ahora en cartel
            </span>
          </div>
          <h2
            className="text-[clamp(32px,5vw,48px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Grandes museos
          </h2>
          <p className="mt-5 text-[15px] text-neutral-400 font-light leading-relaxed">
            Las exposiciones que puedes visitar ahora mismo en los
            museos mas importantes de Barcelona.
          </p>
        </div>

        {/* Museum blocks */}
        <div className="space-y-20">
          {museumData.map((museum, mIdx) => {
            const mainEvent = museum.events[0];
            const sideEvents = museum.events.slice(1);

            return (
              <div
                key={museum.slug}
                className="transition-all duration-[1100ms]"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(40px)",
                  transitionDelay: `${200 + mIdx * 150}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Museum header with link */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span
                      className="text-[11px] font-semibold text-neutral-300 uppercase tracking-[0.3em]"
                    >
                      {museum.name}
                    </span>
                    <div className="flex-1 divider-fade hidden sm:block" style={{ minWidth: 60 }} />
                  </div>
                  <Link
                    href={`/espacios/${museum.slug}`}
                    className="text-[11px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-300 flex items-center gap-1.5 flex-shrink-0"
                  >
                    Ver todo
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Main event + side events */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Main exhibition */}
                  <Link
                    href={`/evento/${mainEvent.id}`}
                    className="group lg:col-span-7"
                  >
                    <div className="relative overflow-hidden rounded-[20px] aspect-[16/10] bg-neutral-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow duration-700 group-hover:shadow-[0_8px_48px_rgba(0,0,0,0.12)]">
                      <img
                        src={mainEvent.imageUrl}
                        alt={mainEvent.title}
                        className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04]"
                        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                    <div className="mt-4 px-1">
                      <h3
                        className="text-[20px] font-semibold text-neutral-900 leading-[1.25] tracking-[-0.02em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                      >
                        {mainEvent.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[12px] text-neutral-400 font-light">
                          {formatDateRange(mainEvent.startDate, mainEvent.endDate)}
                        </span>
                        <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
                        <span className={`text-[12px] font-semibold ${mainEvent.price === null ? "text-emerald-600" : "text-neutral-900"}`}>
                          {mainEvent.price === null ? "Gratis" : `${mainEvent.price} €`}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Side exhibitions */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    {sideEvents.map((evt) => (
                      <Link
                        href={`/evento/${evt.id}`}
                        key={evt.id}
                        className="group flex gap-4 items-start glass-card rounded-2xl p-4"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                          <img
                            src={evt.imageUrl}
                            alt={evt.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <h4
                            className="text-[14px] font-semibold text-neutral-900 leading-[1.3] tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2"
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                          >
                            {evt.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-neutral-400 font-light">
                              {formatDateRange(evt.startDate, evt.endDate)}
                            </span>
                            <span className={`text-[11px] font-semibold ${evt.price === null ? "text-emerald-600" : "text-neutral-500"}`}>
                              {evt.price === null ? "Gratis" : `${evt.price} €`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* If only 1 event, show ambient image with CTA */}
                    {sideEvents.length === 0 && (
                      <Link
                        href={`/espacios/${museum.slug}`}
                        className="group flex-1 rounded-[20px] overflow-hidden bg-neutral-100 min-h-[180px] relative"
                      >
                        <img
                          src={museum.image}
                          alt={museum.shortName}
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                        <div className="absolute bottom-5 left-6">
                          <span
                            className="text-[14px] font-medium text-neutral-500 italic group-hover:text-neutral-900 transition-colors duration-500"
                            style={{ fontFamily: "var(--font-playfair), serif" }}
                          >
                            Ver todo en {museum.shortName} →
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA to full directory */}
        <div
          className="mt-20 flex justify-center transition-all duration-[1000ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: `${200 + museumData.length * 150 + 200}ms`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <Link
            href="/espacios"
            className="btn-ghost group"
          >
            Ver todos los espacios
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="ml-2 inline-block group-hover:translate-x-1 transition-transform duration-300"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
