"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "@/components/Navbar";
import { events as fallbackEvents } from "@/lib/data";
import { MOCK_EVENTS } from "@/lib/mock-events";
import { Event } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

const STORAGE_KEY = "yetzart_saved";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function formatWeekLabel() {
  const { monday, sunday } = getWeekRange();
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${monday.toLocaleDateString("ca-ES", opts)} — ${sunday.toLocaleDateString("ca-ES", opts)}`;
}

function formatDateRange(start: string, end: string) {
  if (!end) return "Permanent";
  const s = new Date(start);
  const e = new Date(end);
  const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  if (e > oneYear) return "Permanent";
  const sStr = s.toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
  const eStr = e.toLocaleDateString("ca-ES", { day: "numeric", month: "short" });
  return sStr === eStr ? sStr : `${sStr} — ${eStr}`;
}

const categoryLabels: Record<string, string> = {
  exposición: "Exposició",
  museo: "Museu",
  galería: "Galeria",
  taller: "Taller",
  teatro: "Teatre",
  música: "Música",
  danza: "Dansa",
  cine: "Cinema",
  festival: "Festival",
};

function mergeEvents(fetched: Event[], mocks: Event[]): Event[] {
  const titleSet = new Set(fetched.map(e => e.title.toLowerCase().trim()));
  const unique = mocks.filter(e => !titleSet.has(e.title.toLowerCase().trim()));
  return [...fetched, ...unique];
}


export default function EstaSemanaPage() {
  const [events, setEvents] = useState<Event[]>(() => mergeEvents(fallbackEvents, MOCK_EVENTS));
  const [saved, setSaved] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("todas");
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const listRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSaved(JSON.parse(stored));
    } catch {}

    Promise.all([
      fetch("/events.json").then(r => r.json()).catch(() => []),
      fetch("/culturajove-events.json").then(r => r.json()).catch(() => []),
      fetch("/premium-events.json").then(r => r.json()).catch(() => []),
    ]).then(([ajuntament, culturajove, premium]) => {
      const base = ajuntament.length > 0 ? ajuntament : fallbackEvents;
      const all = mergeEvents(mergeEvents(mergeEvents(premium, base), culturajove), MOCK_EVENTS);
      setEvents(all);
    });
  }, []);

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const { monday, sunday } = getWeekRange();

  const weekEvents = useMemo(() => {
    const now = new Date();
    const filtered = events.filter((e) => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : new Date("2099-12-31");
      return start <= sunday && end >= monday;
    });

    return filtered.sort((a, b) => {
      const aEnd = a.endDate ? new Date(a.endDate) : null;
      const bEnd = b.endDate ? new Date(b.endDate) : null;
      const aStart = new Date(a.startDate);
      const bStart = new Date(b.startDate);
      const now2 = now;

      const oneYear = new Date(now2.getTime() + 365 * 24 * 60 * 60 * 1000);
      const aPerm = !aEnd || aEnd > oneYear;
      const bPerm = !bEnd || bEnd > oneYear;
      if (aPerm !== bPerm) return aPerm ? 1 : -1;

      if (!aPerm && !bPerm && aEnd && bEnd) {
        const aDaysLeft = (aEnd.getTime() - now2.getTime()) / (1000 * 60 * 60 * 24);
        const bDaysLeft = (bEnd.getTime() - now2.getTime()) / (1000 * 60 * 60 * 24);
        const aUrgent = aDaysLeft <= 7 ? 0 : 1;
        const bUrgent = bDaysLeft <= 7 ? 0 : 1;
        if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      }

      const aNew = aStart >= monday ? 0 : 1;
      const bNew = bStart >= monday ? 0 : 1;
      if (aNew !== bNew) return aNew - bNew;

      const aTier = a.tier || 3;
      const bTier = b.tier || 3;
      if (aTier !== bTier) return aTier - bTier;

      const aImg = a.imageUrl.includes("estatics") ? 0 : 1;
      const bImg = b.imageUrl.includes("estatics") ? 0 : 1;
      if (aImg !== bImg) return aImg - bImg;

      return 0;
    });
  }, [events, monday, sunday]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "todas") return weekEvents;
    if (activeFilter === "gratis") return weekEvents.filter((e) => e.price === null);
    return weekEvents.filter((e) => e.category === activeFilter);
  }, [weekEvents, activeFilter]);

  const scoredEvents = useMemo(() => {
    const now = new Date();
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const artCategories = ["exposición", "museo", "galería"];

    return weekEvents.map((e) => {
      let score = 0;
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : null;
      const isPerm = !end || end > oneYear;

      // Permanent events get minimal score
      if (isPerm) return { event: e, score: -100 };

      // Ending this week = urgency ("últims dies!")
      if (end) {
        const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 3) score += 40;
        else if (daysLeft <= 7) score += 25;
        else if (daysLeft <= 14) score += 10;
      }

      // Opens this week = novelty
      if (start >= monday && start <= sunday) score += 30;

      // Short duration = more exclusive
      if (end) {
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (duration <= 1) score += 25;
        else if (duration <= 7) score += 15;
        else if (duration <= 30) score += 5;
      }

      // Art/expositions bonus
      if (artCategories.includes(e.category)) score += 20;

      // Premium venues (tier 1)
      const tier = e.tier || 3;
      if (tier === 1) score += 15;
      else if (tier === 2) score += 8;

      // Has real API image (better visual)
      if (e.imageUrl.includes("estatics")) score += 10;

      // Featured flag
      if (e.featured) score += 10;

      return { event: e, score };
    }).sort((a, b) => b.score - a.score);
  }, [weekEvents, monday, sunday]);

  const heroEvent = useMemo(() => {
    const best = scoredEvents.find((s) => s.event.imageUrl.includes("estatics") || s.event.imageUrl.includes("cloudfront"));
    return best?.event || scoredEvents[0]?.event || weekEvents[0];
  }, [scoredEvents, weekEvents]);

  const topPicks = useMemo(() => {
    return scoredEvents
      .filter((s) => s.event.id !== heroEvent?.id)
      .slice(0, 8)
      .map((s) => s.event);
  }, [scoredEvents, heroEvent]);

  const freeCount = weekEvents.filter((e) => e.price === null).length;

  function handleListMouseMove(e: React.MouseEvent) {
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen grain">
      <Navbar />

      {/* ── HERO — stripped, poetic ──────────────── */}
      <header className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80&auto=format&fit=crop"
            alt="Barcelona"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-scale-in"
          />
          <div className="absolute inset-0 bg-[var(--gallery-black)]/50" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1400px] mx-auto w-full px-8 pb-20 md:pb-28">
            <span className="animate-fade-up block text-[10px] font-medium tracking-[0.4em] uppercase text-white/40 mb-8">
              {formatWeekLabel()}
            </span>

            <h1 className="animate-fade-up animation-delay-100 text-[clamp(48px,10vw,120px)] font-normal text-white tracking-[-0.04em] leading-[0.9] font-editorial">
              Cultura
              <br />
              <span className="italic text-white/50">a Barcelona</span>
            </h1>

            <div className="animate-fade-up animation-delay-300 mt-12 flex items-center gap-6">
              <span className="text-[11px] text-white/30 tracking-[0.15em] uppercase">
                {weekEvents.length} esdeveniments
              </span>
              <span className="h-px w-8 bg-white/15" />
              <span className="text-[11px] text-white/30 tracking-[0.15em] uppercase">
                {freeCount} gratuïts
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
        </div>
      </header>

      {/* ── MARQUEE ──────────────────────────────── */}
      <div className="bg-[var(--gallery-black)] py-4 overflow-hidden">
        <div className="marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-[11px] tracking-[0.3em] uppercase text-white/20 whitespace-nowrap mx-8">
              Exposicions · Teatre · Música · Dansa · Cinema · Galeries · Festivals ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── EDITORIAL GRID — gallery feel ────────── */}
      <section className="max-w-[1400px] mx-auto px-8 pt-28 pb-20">
        <div className="flex items-end justify-between mb-20">
          <div>
            <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-[var(--accent)]">
              Selecció
            </span>
            <h2 className="text-[clamp(32px,5vw,64px)] font-normal text-[var(--gallery-black)] tracking-[-0.03em] leading-[1.0] mt-4 font-editorial">
              L&apos;imprescindible
            </h2>
          </div>
        </div>

        {/* Asymmetric masonry */}
        <div className="grid grid-cols-12 gap-4">
          {/* Large featured */}
          {topPicks[0] && (
            <Link
              href={`/evento/${topPicks[0].id}`}
              className="col-span-12 md:col-span-7 group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-neutral-100"
            >
              <Image
                src={topPicks[0].imageUrl}
                alt={topPicks[0].title}
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/40">
                  {categoryLabels[topPicks[0].category] || topPicks[0].category}
                </span>
                <h3 className="text-[clamp(20px,3vw,36px)] font-normal text-white leading-[1.15] mt-3 font-editorial max-w-lg">
                  {topPicks[0].title}
                </h3>
                <p className="text-[12px] text-white/40 mt-3">{topPicks[0].venue}</p>
              </div>
            </Link>
          )}

          {/* Right column: stacked */}
          <div className="col-span-12 md:col-span-5 grid grid-cols-1 gap-4">
            {topPicks.slice(1, 4).map((event) => (
              <Link
                href={`/evento/${event.id}`}
                key={event.id}
                className="group relative aspect-[16/9] overflow-hidden bg-neutral-100"
              >
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-white/40">
                    {categoryLabels[event.category] || event.category}
                  </span>
                  <h3 className="text-[16px] font-normal text-white leading-[1.3] mt-2 font-editorial">
                    {event.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row: 4 equal */}
          {topPicks.slice(4, 8).map((event) => (
            <Link
              href={`/evento/${event.id}`}
              key={event.id}
              className="col-span-6 md:col-span-3 group relative aspect-[3/4] overflow-hidden bg-neutral-100"
            >
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-white/50">
                  {categoryLabels[event.category] || event.category}
                </span>
                <h3 className="text-[14px] font-normal text-white leading-[1.3] mt-1 font-editorial">
                  {event.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED HIGHLIGHT ───────────────────── */}
      <section className="border-y border-neutral-200/50">
        <a
          href="https://audelahabitacionsonora.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group max-w-[1400px] mx-auto px-8 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 block"
        >
          <div>
            <span className="text-[9px] font-medium tracking-[0.4em] uppercase text-[var(--accent)]">Destacat</span>
            <p className="text-[clamp(20px,3vw,32px)] font-normal text-[var(--gallery-black)] leading-[1.2] mt-3 font-editorial">
              Aude La Habitación Sonora
            </p>
            <p className="text-[13px] text-neutral-400 font-light mt-2">
              Poblenou · Una experiència immersiva per escoltar música
            </p>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 group-hover:text-[var(--gallery-black)] transition-colors duration-500 flex items-center gap-3 flex-shrink-0">
            Descobrir
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="group-hover:translate-x-2 transition-transform duration-500">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </section>

      {/* ── FULL LIST — editorial with image reveal ─ */}
      <section className="bg-[var(--gallery-white)]">
        <div className="max-w-[1400px] mx-auto px-8 pt-28 pb-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 mb-16">
            <div>
              <span className="text-[10px] font-medium tracking-[0.4em] uppercase text-[var(--accent)]">
                Explorar
              </span>
              <h2 className="text-[clamp(28px,4vw,52px)] font-normal text-[var(--gallery-black)] tracking-[-0.03em] leading-[1.0] mt-4 font-editorial">
                Tota l&apos;agenda
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { value: "todas", label: "Tot" },
                { value: "exposición", label: "Exposicions" },
                { value: "teatro", label: "Teatre" },
                { value: "música", label: "Música" },
                { value: "gratis", label: "Gratuït" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-500 pb-1 ${
                    activeFilter === f.value
                      ? "text-[var(--gallery-black)] border-b border-[var(--gallery-black)]"
                      : "text-neutral-300 hover:text-[var(--gallery-black)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-neutral-200/50 mb-0" />

          <div
            ref={listRef}
            className="relative"
            onMouseMove={handleListMouseMove}
          >
            {/* Floating hover image */}
            {hoveredEvent && hoveredEvent.imageUrl.includes("estatics") && (
              <div
                className="hidden md:block fixed w-[280px] h-[360px] pointer-events-none z-30 overflow-hidden transition-opacity duration-300"
                style={{
                  left: mousePos.x + (listRef.current?.getBoundingClientRect().left || 0) + 24,
                  top: mousePos.y + (listRef.current?.getBoundingClientRect().top || 0) - 180,
                  opacity: hoveredEvent ? 1 : 0,
                }}
              >
                <Image
                  src={hoveredEvent.imageUrl}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            )}

            {filteredEvents
              .filter((e) => activeFilter !== "todas" || !topPicks.find(p => p.id === e.id))
              .map((event) => (
              <Link
                href={`/evento/${event.id}`}
                key={event.id}
                className="group block border-b border-neutral-100/80 last:border-0"
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                <div className="flex items-center gap-6 py-7 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                        {categoryLabels[event.category] || event.category}
                      </span>
                      {event.neighborhood && (
                        <>
                          <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
                          <span className="text-[10px] text-neutral-300 tracking-wide">
                            {event.neighborhood}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-[clamp(16px,2vw,22px)] font-normal text-[var(--gallery-black)] tracking-[-0.01em] group-hover:text-neutral-400 transition-colors duration-700 font-editorial truncate">
                      {event.title}
                    </h3>
                    <p className="text-[12px] text-neutral-300 font-light mt-1 hidden sm:block">
                      {event.venue}
                    </p>
                  </div>

                  <div className="hidden md:block flex-shrink-0 text-right">
                    <span className="text-[11px] text-neutral-300 tracking-wide">
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[12px] font-medium ${event.price === null ? "text-emerald-600" : "text-neutral-300"}`}>
                      {event.price === null ? "Gratis" : `${event.price} €`}
                    </span>
                    {event.url && event.url.startsWith("http") && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(event.url, "_blank", "noopener,noreferrer");
                        }}
                        className="hidden sm:block text-[9px] tracking-[0.15em] uppercase text-neutral-300 hover:text-[var(--gallery-black)] transition-colors duration-300"
                      >
                        Web →
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSave(event.id);
                      }}
                      className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${
                        saved.includes(event.id)
                          ? "text-[var(--gallery-black)]"
                          : "text-neutral-200 hover:text-[var(--gallery-black)]"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={saved.includes(event.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-32">
              <p className="text-neutral-300 text-[20px] font-light font-editorial italic">
                No hi ha esdeveniments d&apos;aquesta categoria aquesta setmana.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER — minimal ───────────────────── */}
      <footer className="bg-[var(--gallery-black)] text-white">
        <div className="max-w-[1400px] mx-auto px-8 py-24">
          <div className="flex flex-col md:flex-row items-start justify-between gap-16">
            <div>
              <span className="text-[clamp(40px,6vw,72px)] tracking-[-0.04em] text-white font-editorial italic font-medium leading-none">
                Yetz
              </span>
              <p className="text-[13px] text-white/25 font-light mt-6 max-w-xs leading-relaxed">
                Cultura a Barcelona, cada setmana.
              </p>
            </div>

            <div className="flex gap-20">
              <div>
                <p className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/15 mb-5">Navegar</p>
                <div className="flex flex-col gap-4">
                  <Link href="/" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Agenda</Link>
                  <Link href="/calendario" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Calendari</Link>
                  <Link href="/sorprendeme" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Sorprèn-me</Link>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/15 mb-5">Legal</p>
                <div className="flex flex-col gap-4">
                  <Link href="/avis-legal" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Avís legal</Link>
                  <Link href="/privacitat" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Privacitat</Link>
                  <Link href="/cookies" className="text-[13px] text-white/40 hover:text-white transition-colors duration-500">Cookies</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-6 border-t border-white/5">
            <p className="text-[9px] text-white/15 tracking-[0.2em] uppercase">
              © 2026 Yetz · Dades: Ajuntament de Barcelona Open Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
