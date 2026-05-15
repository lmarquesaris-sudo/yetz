"use client";

import { Event } from "@/lib/types";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

interface EventCardProps {
  event: Event;
  isSaved: boolean;
  onToggleSave: () => void;
  index?: number;
}

const categoryLabels: Record<string, string> = {
  exposición: "Exposición",
  museo: "Museo",
  galería: "Galería",
  taller: "Taller",
};

function formatDateRange(start: string, end: string) {
  if (!end || end === "") {
    return "Permanente";
  }
  if (start === end) {
    return new Date(start).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
    });
  }
  const s = new Date(start).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  const e = new Date(end).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  return `${s} — ${e}`;
}

function daysUntilEnd(endDate: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

export default function EventCard({
  event,
  isSaved,
  onToggleSave,
  index = 0,
}: EventCardProps) {
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
      { threshold: 0.05, rootMargin: "0px 0px 80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const remaining = daysUntilEnd(event.endDate);
  const isClosingSoon = remaining !== null && remaining <= 7;

  return (
    <div
      ref={ref}
      className="transition-all duration-[1100ms]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${(index % 3) * 150}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Link href={`/evento/${event.id}`}>
        <article className="group cursor-pointer">
          {/* Image */}
          <div className="relative overflow-hidden rounded-[20px] bg-neutral-100 aspect-[3/2] shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow duration-700 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-all duration-[1400ms] group-hover:scale-[1.06]"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Closing soon badge */}
            {isClosingSoon && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-semibold text-red-500 shadow-sm">
                {remaining === 0 ? "Último día" : `${remaining} días`}
              </div>
            )}

            {/* Bookmark */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave();
              }}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isSaved
                  ? "bg-neutral-900 text-white scale-100 shadow-md"
                  : "bg-white/80 backdrop-blur-md text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-900 hover:scale-110 shadow-sm"
              }`}
            >
              {isSaved ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="mt-5 space-y-2.5 px-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {categoryLabels[event.category] || event.category}
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-neutral-200" />
              <span className="text-[11px] text-neutral-300 tracking-wide">
                {event.neighborhood}
              </span>
            </div>

            <h3
              className="text-[18px] font-semibold text-neutral-900 leading-[1.3] tracking-[-0.02em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {event.title}
            </h3>

            <p className="text-[13px] text-neutral-400 leading-[1.6] font-light">
              {event.venue}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-neutral-300 tracking-wide">
                {formatDateRange(event.startDate, event.endDate)}
              </span>
              <span className={`text-[13px] font-semibold ${
                event.price === null ? "text-emerald-600" : "text-neutral-900"
              }`}>
                {event.price === null ? "Gratis" : `${event.price} €`}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
