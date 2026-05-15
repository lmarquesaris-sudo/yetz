"use client";

import { Event } from "@/lib/types";
import EventCard from "./EventCard";
import { useRef, useEffect, useState } from "react";

interface LastDaysProps {
  events: Event[];
  saved: string[];
  onToggleSave: (id: string) => void;
}

export default function LastDays({ events, saved, onToggleSave }: LastDaysProps) {
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

  // Events ending within next 7 days
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const closing = events.filter((e) => {
    if (!e.endDate) return false;
    const end = new Date(e.endDate);
    return end >= now && end <= in7Days;
  });

  if (closing.length === 0) return null;

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
            <div className="w-8 h-px bg-red-400" />
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-[0.3em]">
              No te lo pierdas
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,42px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.15]">
            Últimos días
            <br />
            <span className="italic font-light text-neutral-400">
              cierran esta semana
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {closing.slice(0, 6).map((event, i) => (
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
