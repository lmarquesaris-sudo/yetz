"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { getSpaceBySlug, SPACES } from "@/lib/spaces-data";
import { events as fallbackEvents } from "@/lib/data";
import { Event } from "@/lib/types";
import Link from "next/link";

const STORAGE_KEY = "yetzart_saved";

export default function SpaceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const space = getSpaceBySlug(slug);

  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [saved, setSaved] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

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

  const spaceEvents = useMemo(() => {
    if (!space) return [];
    return events.filter((e) =>
      e.venue.toLowerCase().includes(space.venueFilter)
    );
  }, [events, space]);

  const now = new Date();
  const activeEvents = spaceEvents.filter((e) => {
    const end = e.endDate ? new Date(e.endDate) : new Date("2099-12-31");
    return end >= now;
  });
  const pastEvents = spaceEvents.filter((e) => {
    if (!e.endDate) return false;
    return new Date(e.endDate) < now;
  });

  const freeCount = activeEvents.filter((e) => e.price === null).length;

  if (!mounted) return null;

  if (!space) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl text-neutral-400 font-light">Espacio no encontrado</h1>
          <Link href="/espacios" className="btn-ghost mt-8 inline-block">
            Ver todos los espacios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <header className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={space.image}
            alt=""
            className="w-full h-full object-cover object-center scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ice)]/60 via-[var(--ice)]/80 to-[var(--ice)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ice)] via-[var(--ice)]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-8 pt-20 pb-16">
          <div className="animate-fade-up">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8">
              <Link href="/espacios" className="text-[11px] text-neutral-400 font-light hover:text-neutral-900 transition-colors duration-300">
                Espacios
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span className="text-[11px] text-neutral-900 font-medium">
                {space.shortName}
              </span>
            </div>

            <h1
              className="text-[clamp(36px,6vw,56px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.05]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {space.shortName}
            </h1>
            <p className="mt-4 text-[15px] text-neutral-400 font-light leading-relaxed max-w-lg">
              {space.description}
            </p>

            {/* Info pills */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md text-[12px] text-neutral-500 font-light shadow-sm">
                {space.neighborhood}
              </span>
              <span className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md text-[12px] text-neutral-500 font-light shadow-sm">
                {space.address}
              </span>
              {space.website && (
                <a
                  href={space.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-neutral-900 text-[12px] text-white font-medium shadow-sm hover:bg-neutral-700 transition-colors duration-300"
                >
                  Web oficial
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10">
              <div>
                <span
                  className="text-[36px] font-normal text-neutral-900 leading-none"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {activeEvents.length}
                </span>
                <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
                  {activeEvents.length === 1 ? "evento activo" : "eventos activos"}
                </p>
              </div>
              {freeCount > 0 && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Active exhibitions */}
      <main className="max-w-[1100px] mx-auto px-8 pt-8 pb-28">
        {activeEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-10 h-px bg-neutral-900" />
              <h2 className="text-[11px] font-semibold text-neutral-900 uppercase tracking-[0.3em]">
                Ahora en {space.shortName}
              </h2>
              <div className="flex-1 divider-fade" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                  isSaved={saved.includes(event.id)}
                  onToggleSave={() => toggleSave(event.id)}
                />
              ))}
            </div>
          </section>
        )}

        {activeEvents.length === 0 && (
          <div className="text-center py-24">
            <p className="text-neutral-300 text-lg font-light">
              No hay eventos activos en este espacio ahora mismo.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/40">
        <div className="max-w-[1100px] mx-auto px-8 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="group">
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
