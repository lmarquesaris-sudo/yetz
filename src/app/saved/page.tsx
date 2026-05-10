"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { events } from "@/lib/data";
import Link from "next/link";

const STORAGE_KEY = "yetzart_saved";

export default function SavedPage() {
  const [saved, setSaved] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSaved(JSON.parse(stored));
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

  if (!mounted) return null;

  const savedEvents = events.filter((e) => saved.includes(e.id));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <header className="max-w-[1200px] mx-auto px-8 pt-28 pb-4">
        <div className="animate-fade-up">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.2em]">
            Tu selección
          </p>
          <h1 className="text-[clamp(36px,5vw,56px)] font-extrabold text-neutral-900 mt-3 tracking-[-0.035em] leading-[1.05]">
            Guardados
          </h1>
          <p className="text-[16px] text-neutral-400 mt-4 font-light">
            Los eventos que quieres visitar.
          </p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 pb-24 pt-8">
        {savedEvents.length === 0 ? (
          <div className="text-center py-32 animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-neutral-400 font-light">
              Aún no has guardado ningún evento.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 px-7 py-3 bg-neutral-900 text-white text-[13px] font-medium rounded-full hover:bg-neutral-700 transition-all duration-300"
            >
              Explorar agenda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {savedEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                isSaved={true}
                onToggleSave={() => toggleSave(event.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
