"use client";

import { Event } from "@/lib/types";
import { useRef, useEffect, useState } from "react";

interface EventCardProps {
  event: Event;
  isSaved: boolean;
  onToggleSave: () => void;
  index?: number;
}

const categoryStyles: Record<string, string> = {
  exposición: "bg-neutral-900 text-white",
  museo: "bg-neutral-900 text-white",
  galería: "bg-neutral-700 text-white",
  taller: "bg-neutral-900 text-white",
  performance: "bg-neutral-900 text-white",
  fotografía: "bg-neutral-800 text-white",
  "street art": "bg-neutral-900 text-white",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}

function formatDateRange(start: string, end: string) {
  if (start === end) return formatDate(start);
  const s = new Date(start).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return `${s} — ${e}`;
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
      { threshold: 0.05, rootMargin: "0px 0px 100px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <article className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-[16px] bg-neutral-100 aspect-[4/3]">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-4 left-4">
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full ${
                categoryStyles[event.category] || "bg-neutral-900 text-white"
              }`}
            >
              {event.category}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              isSaved
                ? "bg-neutral-900 text-white scale-100"
                : "bg-white/90 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-neutral-900 hover:scale-110"
            }`}
          >
            {isSaved ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </button>

          {event.price === null && (
            <div className="absolute bottom-4 right-4 bg-white text-neutral-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Gratis
            </div>
          )}
        </div>

        <div className="mt-4 px-1">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium uppercase tracking-[0.1em]">
            <span>{event.venue}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-300" />
            <span>{event.neighborhood}</span>
          </div>

          <h3 className="text-[17px] font-semibold text-neutral-900 mt-2 leading-snug tracking-[-0.01em] group-hover:text-neutral-600 transition-colors duration-300">
            {event.title}
          </h3>

          <p className="text-[13px] text-neutral-400 mt-2 leading-relaxed line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
            <span className="text-[12px] text-neutral-400 tracking-wide">
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="text-[13px] font-semibold text-neutral-900">
              {event.price === null ? "Gratis" : `${event.price} €`}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
