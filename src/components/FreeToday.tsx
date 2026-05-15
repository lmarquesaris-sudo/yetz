"use client";

import { Event } from "@/lib/types";
import EventCard from "./EventCard";
import { useRef, useEffect, useState } from "react";

interface FreeTodayProps {
  events: Event[];
  saved: string[];
  onToggleSave: (id: string) => void;
}

export default function FreeToday({ events, saved, onToggleSave }: FreeTodayProps) {
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

  const now = new Date();
  const freeEvents = events.filter((e) => {
    if (e.price !== null) return false;
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : new Date("2099-12-31");
    return start <= now && end >= now;
  });

  if (freeEvents.length === 0) return null;

  return (
    <section ref={ref} className="py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <div
          className="mb-14 transition-all duration-[900ms] ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-[0.3em]">
              Entrada libre
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,42px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.15]">
            Gratis
            <br />
            <span className="italic font-light text-neutral-400">
              ahora mismo
            </span>
          </h2>
          <p className="mt-4 text-[13px] text-neutral-400 font-light">
            {freeEvents.length} eventos con entrada gratuita abiertos hoy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {freeEvents.slice(0, 6).map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              index={i}
              isSaved={saved.includes(event.id)}
              onToggleSave={() => onToggleSave(event.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
