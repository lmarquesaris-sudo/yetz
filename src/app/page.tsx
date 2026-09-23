"use client";

import { useState, useEffect, useMemo } from "react";
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
  return `${monday.toLocaleDateString("es-ES", opts)} — ${sunday.toLocaleDateString("es-ES", opts)}`;
}

function formatDateRange(start: string, end: string) {
  if (!end) return "Permanente";
  const s = new Date(start);
  const e = new Date(end);
  const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  if (e > oneYear) return "Permanente";
  const sStr = s.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const eStr = e.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return sStr === eStr ? sStr : `${sStr} — ${eStr}`;
}

const categoryLabels: Record<string, string> = {
  exposición: "Exposición",
  museo: "Museo",
  galería: "Galería",
  taller: "Taller",
  teatro: "Teatro",
  música: "Música",
  danza: "Danza",
  cine: "Cine",
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

  const heroEvent = useMemo(() => {
    const hasApiImage = (e: Event) => e.imageUrl.includes("estatics");
    const isTemporal = (e: Event) => {
      if (!e.endDate) return false;
      const end = new Date(e.endDate);
      const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      return end < oneYear;
    };
    const best = weekEvents.find((e) => e.featured && isTemporal(e) && hasApiImage(e));
    if (best) return best;
    const good = weekEvents.find((e) => (e.tier === 1) && isTemporal(e) && hasApiImage(e));
    if (good) return good;
    const ok = weekEvents.find((e) => isTemporal(e) && hasApiImage(e));
    if (ok) return ok;
    return weekEvents.find((e) => e.featured) || weekEvents[0];
  }, [weekEvents]);

  // Top picks: prioritise exposiciones, museos y galerías
  const topPicks = useMemo(() => {
    const artCategories = ["exposición", "museo", "galería"];
    const pool = weekEvents.filter((e) => e.id !== heroEvent?.id);
    const art = pool.filter((e) => artCategories.includes(e.category));
    const rest = pool.filter((e) => !artCategories.includes(e.category));
    return [...art, ...rest].slice(0, 6);
  }, [weekEvents, heroEvent]);

  const freeCount = weekEvents.filter((e) => e.price === null).length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── CINEMATIC HERO ──────────────────────────── */}
      <header className="relative h-[100svh] min-h-[600px] overflow-hidden">
        {/* Static artistic Barcelona background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80&auto=format&fit=crop"
            alt="Barcelona"
            fill
            priority
            sizes="100vw"
            className="object-cover animate-scale-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--gallery-black)] via-[var(--gallery-black)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--gallery-black)]/60 via-transparent to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1400px] mx-auto w-full px-8 pb-16 md:pb-24">
            <div className="max-w-2xl">
              <div className="animate-fade-up">
                <span className="inline-block text-[10px] font-medium tracking-[0.3em] uppercase text-white/50 mb-6">
                  {formatWeekLabel()}
                </span>
              </div>

              <h1
                className="animate-fade-up animation-delay-100 text-[clamp(36px,8vw,80px)] font-normal text-white tracking-[-0.03em] leading-[1.0] font-editorial"
              >
                Lo que pasa
                <br />
                <span className="italic text-white/60">
                  esta semana
                </span>
              </h1>

              <p className="animate-fade-up animation-delay-200 mt-6 text-[15px] text-white/40 font-light leading-relaxed max-w-md">
                Exposiciones, teatro, música y planes culturales en Barcelona.
              </p>

              {/* Stats row */}
              <div className="animate-fade-up animation-delay-300 flex items-center gap-8 mt-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-[42px] font-normal text-white leading-none font-editorial">
                    {weekEvents.length}
                  </span>
                  <span className="text-[11px] text-white/30 tracking-[0.1em] uppercase">eventos</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-baseline gap-2">
                  <span className="text-[42px] font-normal text-white/70 leading-none font-editorial">
                    {freeCount}
                  </span>
                  <span className="text-[11px] text-white/30 tracking-[0.1em] uppercase">gratis</span>
                </div>
              </div>

              {/* Hero event tag */}
              {heroEvent && (
                <Link
                  href={`/evento/${heroEvent.id}`}
                  className="animate-fade-up animation-delay-400 group inline-flex items-center gap-4 mt-12 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-500"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Destacado</p>
                    <p className="text-[14px] text-white font-medium truncate">{heroEvent.title}</p>
                    <p className="text-[12px] text-white/40 mt-0.5">{heroEvent.venue}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </header>

      {/* ── SORPRÉNDEME CTA ─────────────────────────── */}
      <section className="bg-[var(--gallery-black)]">
        <Link
          href="/sorprendeme"
          className="group max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <span className="text-[24px] text-white/20 font-editorial italic">?</span>
            <div>
              <p className="text-[13px] font-medium text-white tracking-[0.02em]">No sabes qué hacer</p>
              <p className="text-[11px] text-white/30 font-light">Te montamos un plan cultural a medida</p>
            </div>
          </div>
          <span className="btn-ghost !border-white/20 !text-white/60 group-hover:!bg-white group-hover:!text-[var(--gallery-black)] !py-3 !px-6 text-[10px]">
            Sorpréndeme
          </span>
        </Link>
      </section>

      {/* ── EDITORIAL PICKS ─────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-8 pt-24 pb-16">
        <div className="animate-fade-up animation-delay-200">
          {/* Section header */}
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--accent)]">
                Exposiciones y pintura
              </span>
              <h2 className="text-[clamp(28px,4vw,48px)] font-normal text-[var(--gallery-black)] tracking-[-0.03em] leading-[1.1] mt-3 font-editorial">
                Lo imprescindible
              </h2>
            </div>
            <Link
              href="/calendario"
              className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-neutral-400 hover:text-[var(--gallery-black)] transition-colors duration-300 pb-2"
            >
              Ver calendario
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Editorial grid: 2 large + 4 small */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPicks.slice(0, 2).map((event, i) => (
              <Link
                href={`/evento/${event.id}`}
                key={event.id}
                className="gallery-card group lg:col-span-1 md:col-span-1 rounded-sm overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Overlay content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/50">
                      {categoryLabels[event.category] || event.category}
                    </span>
                    <h3 className="text-[20px] font-medium text-white leading-[1.3] mt-2 font-editorial">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] text-white/40">{event.venue}</span>
                      <span className="h-[3px] w-[3px] rounded-full bg-white/20" />
                      <span className={`text-[11px] font-medium ${event.price === null ? "text-emerald-400" : "text-white/60"}`}>
                        {event.price === null ? "Gratis" : `${event.price} €`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Right column: stacked smaller cards */}
            <div className="flex flex-col gap-6 lg:col-span-1 md:col-span-2 lg:row-span-1">
              {topPicks.slice(2, 6).map((event, i) => (
                <Link
                  href={`/evento/${event.id}`}
                  key={event.id}
                  className="gallery-card group flex gap-5 p-4 rounded-sm bg-[var(--gallery-white)]"
                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                >
                  <div className="relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 bg-neutral-100">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-[var(--accent)]">
                      {categoryLabels[event.category] || event.category}
                    </span>
                    <h3 className="text-[14px] font-medium text-[var(--gallery-black)] leading-[1.3] mt-1 truncate font-editorial group-hover:text-neutral-500 transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1">{event.venue}</p>
                  </div>
                  <span className={`self-center text-[12px] font-medium flex-shrink-0 ${event.price === null ? "text-emerald-600" : "text-neutral-400"}`}>
                    {event.price === null ? "Gratis" : `${event.price} €`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTERS + FULL LIST ────────────── */}
      <section className="bg-[var(--gallery-white)] border-t border-neutral-100/50">
        <div className="max-w-[1400px] mx-auto px-8 pt-20 pb-28">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--accent)]">
                Explorar
              </span>
              <h2 className="text-[clamp(24px,3.5vw,40px)] font-normal text-[var(--gallery-black)] tracking-[-0.02em] leading-[1.1] mt-3 font-editorial">
                Toda la agenda
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "todas", label: "Todo" },
                { value: "exposición", label: "Exposiciones" },
                { value: "teatro", label: "Teatro" },
                { value: "música", label: "Música" },
                { value: "gratis", label: "Gratis" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-4 py-2 text-[10px] font-medium tracking-[0.1em] uppercase transition-all duration-500 ${
                    activeFilter === f.value
                      ? "bg-[var(--gallery-black)] text-white"
                      : "text-neutral-400 hover:text-[var(--gallery-black)] bg-transparent border border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {f.label}
                  {f.value === "gratis" && (
                    <span className="ml-1.5 opacity-50">{freeCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-100 mb-2" />

          {/* Events list — editorial style */}
          <div>
            {filteredEvents
              .filter((e) => activeFilter !== "todas" || !topPicks.find(p => p.id === e.id))
              .map((event, i) => (
              <Link
                href={`/evento/${event.id}`}
                key={event.id}
                className="group block border-b border-neutral-100/80 last:border-0"
              >
                <div className="flex items-center gap-6 py-6 transition-all duration-500 hover:px-4 hover:bg-neutral-50/50"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden flex-shrink-0 bg-neutral-100">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--accent)]">
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
                    <h3 className="text-[16px] sm:text-[18px] font-medium text-[var(--gallery-black)] tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 truncate font-editorial">
                      {event.title}
                    </h3>
                    <p className="text-[12px] text-neutral-400 font-light mt-1 hidden sm:block">
                      {event.venue}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="hidden md:block flex-shrink-0 text-right">
                    <span className="text-[11px] text-neutral-300 tracking-wide">
                      {formatDateRange(event.startDate, event.endDate)}
                    </span>
                  </div>

                  {/* Price + Web + Save */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[12px] font-medium ${event.price === null ? "text-emerald-600" : "text-neutral-400"}`}>
                      {event.price === null ? "Gratis" : `${event.price} €`}
                    </span>
                    {event.url && event.url.startsWith("http") && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(event.url, "_blank", "noopener,noreferrer");
                        }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] uppercase bg-[var(--gallery-black)] text-white hover:bg-black transition-colors duration-300"
                      >
                        Asistir
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
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
                          : "text-neutral-300 hover:text-[var(--gallery-black)]"
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
            <div className="text-center py-24">
              <p className="text-neutral-300 text-lg font-light font-editorial italic">
                No hay eventos de esta categoría esta semana.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="bg-[var(--gallery-black)] text-white">
        <div className="max-w-[1400px] mx-auto px-8 py-20">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            <div>
              <Link href="/" className="group">
                <span className="text-[32px] tracking-[-0.04em] text-white font-editorial italic font-medium">
                  Yetz
                </span>
              </Link>
              <p className="text-[13px] text-white/30 font-light mt-4 max-w-xs leading-relaxed">
                Tu portal cultural de Barcelona.
                Exposiciones, teatro, música y los mejores planes de la ciudad.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/20 mb-4">Navegar</p>
                <div className="flex flex-col gap-3">
                  <Link href="/" className="text-[13px] text-white/50 hover:text-white transition-colors">Agenda</Link>
                  <Link href="/calendario" className="text-[13px] text-white/50 hover:text-white transition-colors">Calendario</Link>
                  <Link href="/sorprendeme" className="text-[13px] text-white/50 hover:text-white transition-colors">Sorpréndeme</Link>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/20 mb-4">Info</p>
                <div className="flex flex-col gap-3">
                  <Link href="/about" className="text-[13px] text-white/50 hover:text-white transition-colors">Sobre Yetz</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[10px] text-white/20 tracking-[0.1em]">
              2026 YETZ. HECHO EN BARCELONA.
            </p>
            <p className="text-[10px] text-white/20 tracking-[0.05em]">
              Datos: Ajuntament de Barcelona Open Data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
