"use client";

import { Event } from "@/lib/types";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

interface ThisWeekProps {
  events: Event[];
  saved: string[];
  onToggleSave: (id: string) => void;
}

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

export default function ThisWeek({ events, saved, onToggleSave }: ThisWeekProps) {
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

  const { monday, sunday } = getWeekRange();

  // Events active this week: started before sunday AND ends after monday
  const weekEvents = events
    .filter((e) => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : new Date("2099-12-31");
      return start <= sunday && end >= monday;
    })
    .filter((e) => !e.tier || e.tier <= 2)
    .slice(0, 5);

  if (weekEvents.length === 0) return null;

  return (
    <section ref={ref} className="py-28">
      <div className="max-w-[1100px] mx-auto px-8">
        <div
          className="mb-16 transition-all duration-[1000ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-px bg-neutral-900" />
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
              Selección semanal
            </span>
          </div>
          <h2
            className="text-[clamp(32px,5vw,48px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Esta semana
            <br />
            <span className="italic text-neutral-400">
              en Barcelona
            </span>
          </h2>
          <p className="mt-5 text-[14px] text-neutral-400 font-light tracking-wide">
            {formatWeekLabel()}
          </p>
        </div>

        <div className="space-y-3">
          {weekEvents.map((event, i) => (
            <Link
              href={`/evento/${event.id}`}
              key={event.id}
              className="group block transition-all duration-[1000ms]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${200 + i * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="flex items-center gap-7 py-6 px-6 rounded-2xl transition-all duration-500 hover:bg-white/70 hover:shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                {/* Number */}
                <span
                  className="text-[44px] font-normal text-neutral-200 leading-none w-14 text-right group-hover:text-neutral-400 transition-colors duration-500"
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
                  <h3
                    className="text-[17px] font-semibold text-neutral-900 tracking-[-0.01em] group-hover:text-neutral-500 transition-colors duration-500 truncate"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-[13px] text-neutral-400 font-light mt-1.5">
                    {event.venue}
                  </p>
                </div>

                {/* Price + Save */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-[13px] font-semibold hidden sm:block ${event.price === null ? "text-emerald-600" : "text-neutral-900"}`}>
                    {event.price === null ? "Gratis" : `${event.price} €`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleSave(event.id);
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
      </div>
    </section>
  );
}
