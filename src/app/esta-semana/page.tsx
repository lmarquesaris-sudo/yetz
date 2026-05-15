"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { events as fallbackEvents } from "@/lib/data";
import { Event } from "@/lib/types";
import Link from "next/link";

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
  const s = new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${s} — ${e}`;
}

const categoryLabels: Record<string, string> = {
  exposición: "Exposición",
  museo: "Museo",
  galería: "Galería",
  taller: "Taller",
};

export default function EstaSemanaPage() {
  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [saved, setSaved] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("todas");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSaved(JSON.parse(stored));

    fetch("/events.json")
      .then((res) => res.json())
      .then((data: Event[]) => {
        if (data.length > 0) setEvents(data);
      })
      .catch(() => {});
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
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : new Date("2099-12-31");
      return start <= sunday && end >= monday;
    });
  }, [events, monday, sunday]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "todas") return weekEvents;
    if (activeFilter === "gratis") return weekEvents.filter((e) => e.price === null);
    return weekEvents.filter((e) => e.category === activeFilter);
  }, [weekEvents, activeFilter]);

  // Pick a hero event (featured or first tier-1 event)
  const heroEvent = weekEvents.find((e) => e.featured) || weekEvents.find((e) => e.tier === 1) || weekEvents[0];
  const freeCount = weekEvents.filter((e) => e.price === null).length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <header className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroEvent && (
            <img
              src={heroEvent.imageUrl}
              alt=""
              className="w-full h-full object-cover object-center scale-105 blur-[2px]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ice)]/70 via-[var(--ice)]/85 to-[var(--ice)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ice)] via-[var(--ice)]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-8 pt-24 pb-20">
          <div className="max-w-xl animate-fade-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-px bg-neutral-900" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
                Seleccion semanal
              </span>
            </div>
            <h1
              className="text-[clamp(40px,7vw,64px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.05]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Esta semana
              <br />
              <span className="italic text-neutral-400">
                en Barcelona
              </span>
            </h1>
            <p className="mt-6 text-[15px] text-neutral-400 font-light leading-relaxed">
              {formatWeekLabel()}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10">
              <div>
                <span
                  className="text-[36px] font-normal text-neutral-900 leading-none"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {weekEvents.length}
                </span>
                <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">eventos activos</p>
              </div>
              <div className="h-10 w-px bg-neutral-200" />
              <div>
                <span
                  className="text-[36px] font-normal text-emerald-600 leading-none"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {freeCount}
                </span>
                <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">gratuitos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="flex flex-wrap items-center gap-2 py-6">
          {[
            { value: "todas", label: "Todos" },
            { value: "exposición", label: "Exposiciones" },
            { value: "museo", label: "Museos" },
            { value: "galería", label: "Galerías" },
            { value: "taller", label: "Talleres" },
            { value: "gratis", label: "Gratis" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-5 py-2.5 rounded-full text-[12px] font-medium transition-all duration-500 ${
                activeFilter === f.value
                  ? f.value === "gratis"
                    ? "bg-emerald-600 text-white shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
                    : "bg-neutral-900 text-white shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
                  : "text-neutral-400 hover:text-neutral-900 bg-white/60 hover:bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {f.label}
              {f.value === "gratis" && (
                <span className="ml-1.5 opacity-60">{freeCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Featured event — large card */}
      {heroEvent && activeFilter === "todas" && (
        <section className="max-w-[1100px] mx-auto px-8 pt-8 pb-16">
          <Link href={`/evento/${heroEvent.id}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative overflow-hidden rounded-[24px] aspect-[4/3] bg-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow duration-700 group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.14)]">
                <img
                  src={heroEvent.imageUrl}
                  alt={heroEvent.title}
                  className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="py-4 lg:pl-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    {categoryLabels[heroEvent.category] || heroEvent.category}
                  </span>
                  <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
                  <span className="text-[11px] text-neutral-300 tracking-wide">
                    {heroEvent.neighborhood}
                  </span>
                </div>
                <h2
                  className="text-[clamp(24px,4vw,36px)] font-semibold text-neutral-900 leading-[1.2] tracking-[-0.02em] group-hover:text-neutral-500 transition-colors duration-500"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {heroEvent.title}
                </h2>
                <p className="mt-4 text-[14px] text-neutral-400 font-light leading-[1.7] line-clamp-3">
                  {heroEvent.description}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-[13px] text-neutral-300">
                    {heroEvent.venue}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-[12px] text-neutral-300 tracking-wide">
                    {formatDateRange(heroEvent.startDate, heroEvent.endDate)}
                  </span>
                  <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
                  <span className={`text-[13px] font-semibold ${heroEvent.price === null ? "text-emerald-600" : "text-neutral-900"}`}>
                    {heroEvent.price === null ? "Gratis" : `${heroEvent.price} €`}
                  </span>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <span className="btn-ghost text-[12px] group-hover:bg-neutral-900 group-hover:text-white transition-all duration-500">
                    Ver exposicion
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-2 inline-block">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Events list */}
      <main className="max-w-[1100px] mx-auto px-8 pb-28">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-px bg-neutral-300" />
          <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
            {activeFilter === "todas" ? "Todos los eventos de la semana" : activeFilter === "gratis" ? "Eventos gratuitos" : categoryLabels[activeFilter] || activeFilter}
            <span className="ml-3 text-neutral-300 font-normal">{filteredEvents.length}</span>
          </h2>
          <div className="flex-1 divider-fade" />
        </div>

        <div className="space-y-2">
          {filteredEvents
            .filter((e) => activeFilter !== "todas" || e.id !== heroEvent?.id)
            .map((event, i) => (
            <Link
              href={`/evento/${event.id}`}
              key={event.id}
              className="group block animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-6 py-5 px-5 rounded-2xl transition-all duration-500 hover:bg-white/70 hover:shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                {/* Number */}
                <span
                  className="text-[36px] font-normal text-neutral-200 leading-none w-12 text-right group-hover:text-neutral-400 transition-colors duration-500 hidden sm:block"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Image */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-100 shadow-sm">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-110"
                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-300">
                      {categoryLabels[event.category] || event.category}
                    </span>
                    <span className="text-[10px] text-neutral-300">
                      {event.neighborhood}
                    </span>
                  </div>
                  <h3
                    className="text-[16px] font-semibold text-neutral-900 tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 truncate"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-[12px] text-neutral-400 font-light mt-1">
                    {event.venue}
                  </p>
                </div>

                {/* Date */}
                <div className="hidden md:block flex-shrink-0 text-right">
                  <span className="text-[12px] text-neutral-300 tracking-wide">
                    {formatDateRange(event.startDate, event.endDate)}
                  </span>
                </div>

                {/* Price + Save */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[13px] font-semibold ${event.price === null ? "text-emerald-600" : "text-neutral-900"}`}>
                    {event.price === null ? "Gratis" : `${event.price} €`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSave(event.id);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      saved.includes(event.id)
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-300 hover:text-neutral-900"
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

                  {/* Arrow */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all duration-300 hidden sm:block"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-24">
            <p className="text-neutral-300 text-lg font-light">
              No hay eventos de esta categoria esta semana.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/40">
        <div className="max-w-[1100px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2">
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
