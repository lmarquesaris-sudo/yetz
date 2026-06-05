"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { MOCK_EVENTS } from "@/lib/mock-events";
import { CategoryFilter, CATEGORY_FILTERS, getCategoryFilter } from "@/lib/types";
import type { Event } from "@/lib/types";

/** Merge fetched events with mock events, deduplicate by title */
function mergeEvents(fetched: Event[], mocks: Event[]): Event[] {
  const titleSet = new Set(fetched.map(e => e.title.toLowerCase().trim()));
  const unique = mocks.filter(e => !titleSet.has(e.title.toLowerCase().trim()));
  return [...fetched, ...unique];
}

/** Relevance score for an event on a specific date (higher = more relevant) */
function getRelevanceScore(e: Event, dateStr: string): number {
  let score = 0;
  const end = e.endDate ? new Date(e.endDate) : null;
  const start = new Date(e.startDate);
  const ref = new Date(dateStr);
  const oneYear = new Date(ref.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Permanent = lowest priority
  const isPerm = !end || end > oneYear;
  if (isPerm) return 0;

  // Base: temporal event
  score += 50;

  // Single-day event (concert, recital) = most unique to this day
  if (e.startDate === e.endDate) score += 40;

  // Starts TODAY = premiere/opening
  if (e.startDate === dateStr) score += 30;

  // Ending within 3 days = "últimos días!"
  if (end) {
    const daysLeft = (end.getTime() - ref.getTime()) / 86400000;
    if (daysLeft <= 3) score += 25;
    else if (daysLeft <= 7) score += 15;
    else if (daysLeft <= 14) score += 5;
  }

  // Short duration (< 7 days) = more special
  if (end) {
    const duration = (end.getTime() - start.getTime()) / 86400000;
    if (duration <= 1) score += 20;
    else if (duration <= 7) score += 10;
    else if (duration <= 30) score += 5;
  }

  // Tier bonus
  const tier = e.tier || 3;
  if (tier === 1) score += 10;
  else if (tier === 2) score += 5;

  // Has real API image
  if (e.imageUrl.includes("estatics")) score += 5;

  return score;
}

/** Get events active on a specific date, sorted by relevance */
function getEventsForDate(allEvents: Event[], date: Date): Event[] {
  const dateStr = date.toISOString().split("T")[0];

  const dayEvents = allEvents.filter((e) => {
    const end = e.endDate || "2099-12-31";
    return dateStr >= e.startDate && dateStr <= end;
  });

  // Sort by relevance score (descending)
  return dayEvents.sort((a, b) => {
    const aScore = getRelevanceScore(a, dateStr);
    const bScore = getRelevanceScore(b, dateStr);
    if (aScore !== bScore) return bScore - aScore;
    // Tiebreaker: tier then image
    const aTier = a.tier || 3;
    const bTier = b.tier || 3;
    if (aTier !== bTier) return aTier - bTier;
    const aImg = a.imageUrl.includes("estatics") ? 0 : 1;
    const bImg = b.imageUrl.includes("estatics") ? 0 : 1;
    return aImg - bImg;
  });
}

/** Get event date counts for calendar dots */
function getEventDatesForMonth(allEvents: Event[], year: number, month: number): Map<string, { total: number; arte: number; musica: number; teatro: number }> {
  const counts = new Map<string, { total: number; arte: number; musica: number; teatro: number }>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    const eventsForDay = allEvents.filter(
      (e) => {
        const end = e.endDate || "2099-12-31";
        return dateStr >= e.startDate && dateStr <= end;
      }
    );
    if (eventsForDay.length > 0) {
      let arte = 0, musica = 0, teatro = 0;
      for (const e of eventsForDay) {
        const cat = e.category;
        if (cat === "exposición" || cat === "museo" || cat === "galería" || cat === "taller") arte++;
        else if (cat === "música" || cat === "festival") musica++;
        else teatro++;
      }
      counts.set(dateStr, { total: eventsForDay.length, arte, musica, teatro });
    }
  }
  return counts;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS_ES = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_FULL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getCategoryBadgeStyle(filter: CategoryFilter): string {
  switch (filter) {
    case "arte": return "bg-amber-50 text-amber-700 border-amber-200";
    case "música": return "bg-violet-50 text-violet-700 border-violet-200";
    case "teatro": return "bg-rose-50 text-rose-700 border-rose-200";
    case "talleres": return "bg-teal-50 text-teal-700 border-teal-200";
    default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
  }
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(5); // June
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("todos");
  const [mounted, setMounted] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>(MOCK_EVENTS);
  const [showAll, setShowAll] = useState(false);
  const MAX_PER_CATEGORY = 2;
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load fresh events from events.json
    fetch("/events.json")
      .then((res) => res.json())
      .then((data: Event[]) => {
        if (data.length > 0) {
          setAllEvents(mergeEvents(data, MOCK_EVENTS));
        }
      })
      .catch(() => {
        // Keep mock events as fallback
      });
  }, []);

  const eventDates = useMemo(
    () => getEventDatesForMonth(allEvents, currentYear, currentMonth),
    [allEvents, currentYear, currentMonth]
  );

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const events = getEventsForDate(allEvents, selectedDate);
    if (activeFilter === "todos") return events;
    return events.filter((e) => getCategoryFilter(e.category) === activeFilter);
  }, [allEvents, selectedDate, activeFilter]);

  // Calendar grid math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let startDow = new Date(currentYear, currentMonth, 1).getDay() - 1;
  if (startDow < 0) startDow = 6;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
    setActiveFilter("todos");
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
    setActiveFilter("todos");
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setActiveFilter("todos");
    setShowAll(false);
    // Scroll to detail on mobile
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const [today, setToday] = useState<{ day: number; month: number; year: number } | null>(null);
  useEffect(() => {
    const t = new Date();
    setToday({ day: t.getDate(), month: t.getMonth(), year: t.getFullYear() });
  }, []);

  const isToday = (day: number) => {
    if (!today) return false;
    return today.day === day && today.month === currentMonth && today.year === currentYear;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
  };


  return (
    <div className="min-h-screen" style={{ background: "var(--ice)" }}>
      <Navbar />
      {!mounted ? <div className="pt-[80px]" /> : (<>

      {/* ── HERO: Full-width calendar ─────────────── */}
      <main className="pt-[80px]">
        <div
          className="max-w-[1200px] mx-auto px-6 sm:px-8 transition-all duration-[1200ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header + description */}
          <div className="pt-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-px bg-neutral-900" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
                Agenda cultural Barcelona
              </span>
            </div>
            <h1
              className="text-[clamp(28px,5vw,44px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.1]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Qué hacer en Barcelona
            </h1>
            <p className="mt-3 text-[15px] text-neutral-400 font-light leading-relaxed max-w-lg">
              Exposiciones, teatro, conciertos, talleres y festivales. Elige un día
              y descubre todo lo que pasa en la ciudad.
            </p>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-white/80 transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h2
              className="text-[clamp(22px,3vw,32px)] font-normal text-neutral-900 tracking-[-0.02em] min-w-[220px] text-center"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {MONTHS_ES[currentMonth]}{" "}
              <span className="font-light text-neutral-300">{currentYear}</span>
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-white/80 transition-all duration-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* ── Calendar Grid (full width) ────────── */}
          <div className="glass-card rounded-[28px] p-4 sm:p-6 mb-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS_FULL.map((d, i) => (
                <div key={d} className="text-center text-[11px] font-semibold text-neutral-300 uppercase tracking-[0.12em] py-2 hidden sm:block">
                  {d}
                </div>
              ))}
              {DAYS_ES.map((d) => (
                <div key={`m-${d}`} className="text-center text-[11px] font-semibold text-neutral-300 uppercase tracking-[0.12em] py-2 sm:hidden">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-[3px] sm:gap-1">
              {/* Offset */}
              {Array.from({ length: startDow }).map((_, i) => (
                <div key={`e-${i}`} className="aspect-[1.4] sm:aspect-[2]" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const info = eventDates.get(dateStr);
                const hasEvents = !!info;
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`relative rounded-2xl sm:rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 aspect-[1.4] sm:aspect-[2] group ${
                      selected
                        ? "bg-neutral-900 text-white shadow-xl scale-[1.02] z-10"
                        : today
                        ? "bg-white text-neutral-900 shadow-md ring-2 ring-neutral-900/10"
                        : hasEvents
                        ? "bg-white/60 text-neutral-900 hover:bg-white hover:shadow-md"
                        : "text-neutral-300 hover:bg-white/30"
                    }`}
                  >
                    <span className={`text-[15px] sm:text-[18px] transition-all ${selected ? "font-semibold" : today ? "font-semibold" : "font-normal"}`}>
                      {day}
                    </span>

                    {/* Activity indicator */}
                    {hasEvents && info && (
                      <div className="flex items-center gap-[2px]">
                        {Array.from({ length: Math.min(info.total, 4) }).map((_, di) => (
                          <span
                            key={di}
                            className={`w-[4px] h-[4px] rounded-full transition-colors ${
                              selected ? "bg-white/50" : "bg-neutral-900/25"
                            }`}
                          />
                        ))}
                        {info.total > 4 && (
                          <span className={`text-[8px] font-semibold ml-0.5 ${selected ? "text-white/50" : "text-neutral-400"}`}>+</span>
                        )}
                      </div>
                    )}

                    {/* Event count tooltip on hover */}
                    {hasEvents && info && !selected && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        <div className="bg-neutral-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                          {info.total} eventos
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Day Detail Panel ────────────────────── */}
        <div ref={detailRef} className="max-w-[1200px] mx-auto px-6 sm:px-8 pb-24">
          {!selectedDate ? (
            /* No date selected — show prompt */
            <div
              className="flex flex-col items-center justify-center py-20 text-center transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transitionDelay: "400ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p
                className="text-[20px] text-neutral-300 font-light"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Selecciona un día para explorar
              </p>
            </div>
          ) : (
            /* Date selected — show events */
            <div className="animate-fade-up" style={{ animationDuration: "0.6s" }}>
              {/* Date header + filters */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pt-4">
                <div>
                  <h2
                    className="text-[clamp(24px,4vw,36px)] font-normal text-neutral-900 tracking-[-0.02em] leading-[1.1] capitalize"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {selectedDate.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h2>
                  <p className="text-[13px] text-neutral-400 font-light mt-1.5">
                    {selectedDate ? getEventsForDate(allEvents, selectedDate).length : 0} eventos culturales
                  </p>
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-2">
                  {CATEGORY_FILTERS.map((f) => {
                    const dayEvents = selectedDate ? getEventsForDate(allEvents, selectedDate) : [];
                    const count = f.key === "todos"
                      ? dayEvents.length
                      : dayEvents.filter(e => getCategoryFilter(e.category) === f.key).length;
                    return (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-400 ${
                          activeFilter === f.key
                            ? "bg-neutral-900 text-white shadow-md"
                            : "bg-white/70 text-neutral-500 hover:text-neutral-900 hover:bg-white border border-neutral-100"
                        }`}
                      >
                        <span className="text-[10px]">{f.icon}</span>
                        {f.label}
                        <span className={`text-[10px] ml-0.5 ${activeFilter === f.key ? "text-white/60" : "text-neutral-300"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Events grid */}
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-[15px] text-neutral-400 font-light">
                    No hay eventos de {activeFilter} este día
                  </p>
                  <button
                    onClick={() => setActiveFilter("todos")}
                    className="text-[12px] text-neutral-900 font-medium mt-3 underline underline-offset-4 decoration-neutral-200 hover:decoration-neutral-900 transition-colors"
                  >
                    Ver todos los eventos
                  </button>
                </div>
              ) : (
                (() => {
                  // When not filtering by category and not showing all: limit to MAX_PER_CATEGORY per category
                  let visibleEvents = selectedEvents;
                  if (!showAll && activeFilter === "todos") {
                    const catCounts: Record<string, number> = {};
                    visibleEvents = selectedEvents.filter((e) => {
                      const cat = e.category;
                      catCounts[cat] = (catCounts[cat] || 0) + 1;
                      return catCounts[cat] <= MAX_PER_CATEGORY;
                    });
                  }
                  const hiddenCount = selectedEvents.length - visibleEvents.length;

                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleEvents.map((evt, idx) => (
                          <EventCard key={evt.id} event={evt} index={idx} dateStr={selectedDate?.toISOString().split("T")[0] || ""} />
                        ))}
                      </div>
                      {!showAll && hiddenCount > 0 && (
                        <div className="flex justify-center mt-8">
                          <button
                            onClick={() => setShowAll(true)}
                            className="px-8 py-3 rounded-full text-[13px] font-medium text-neutral-900 bg-white shadow-sm hover:shadow-md border border-neutral-100 transition-all duration-300"
                          >
                            Explorar {hiddenCount} eventos más
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>
          )}
        </div>
      </main>

      </>)}
      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
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

/* ── Event Card Component ─────────────────────── */
function EventCard({ event, index, dateStr }: { event: Event; index: number; dateStr: string }) {
  const filter = getCategoryFilter(event.category);

  // Relevance badges
  const isSingleDay = event.startDate === event.endDate;
  const isOpening = event.startDate === dateStr;
  const isLastDays = event.endDate ? (() => {
    const daysLeft = (new Date(event.endDate).getTime() - new Date(dateStr).getTime()) / 86400000;
    return daysLeft <= 3 && daysLeft >= 0;
  })() : false;

  const formatDate = (start: string, end: string) => {
    if (start === end) {
      return new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
    const s = new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    const e = new Date(end).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${s} — ${e}`;
  };

  return (
    <Link
      href={`/evento/${event.id}`}
      className="group glass-card rounded-[20px] overflow-hidden transition-all duration-500"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Image */}
      <div className="aspect-[16/9] overflow-hidden bg-neutral-100 relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.05]"
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border backdrop-blur-sm ${getCategoryBadgeStyle(filter)}`}>
            {event.category}
          </span>
        </div>
        {/* Relevance badge */}
        {(isSingleDay || isOpening || isLastDays) && (
          <div className="absolute bottom-3 left-3">
            <span className={`text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full backdrop-blur-sm ${
              isLastDays
                ? "bg-red-500/90 text-white"
                : isOpening
                ? "bg-blue-500/90 text-white"
                : "bg-neutral-900/80 text-white"
            }`}>
              {isLastDays ? "Últimos días" : isOpening ? "Estreno" : "Solo hoy"}
            </span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            event.price === null
              ? "bg-emerald-50/90 text-emerald-700 border border-emerald-200"
              : "bg-white/90 text-neutral-900 border border-white/60"
          }`}>
            {event.price === null ? "Gratis" : `${event.price} €`}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-[15px] font-semibold text-neutral-900 leading-[1.3] tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {event.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[11px] text-neutral-400 font-light truncate">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-[11px] text-neutral-400 font-light">
            {formatDate(event.startDate, event.endDate)}
          </span>
        </div>
      </div>
    </Link>
  );
}
