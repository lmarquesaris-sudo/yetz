"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { events } from "@/lib/data";
import { Category } from "@/lib/types";

const STORAGE_KEY = "yetzart_saved";

const categories: { value: Category | "todas"; label: string }[] = [
  { value: "todas", label: "Todo" },
  { value: "exposición", label: "Exposiciones" },
  { value: "museo", label: "Museos" },
  { value: "galería", label: "Galerías" },
  { value: "taller", label: "Talleres" },
  { value: "performance", label: "Performance" },
  { value: "fotografía", label: "Foto" },
  { value: "street art", label: "Street Art" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | "todas">("todas");
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

  const filtered = useMemo(() => {
    if (activeCategory === "todas") return events;
    return events.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  const featured = filtered.filter((e) => e.featured);
  const rest = filtered.filter((e) => !e.featured);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <header className="relative pt-16 overflow-hidden">
        {/* Imagen de fondo sorollesca */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Joaqu%C3%ADn_Sorolla_y_Bastida_-_Strolling_along_the_Seashore_-_Google_Art_Project.jpg/1280px-Joaqu%C3%ADn_Sorolla_y_Bastida_-_Strolling_along_the_Seashore_-_Google_Art_Project.jpg"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-8 pt-16 pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="animate-fade-up">
              <h1 className="text-[clamp(52px,9vw,88px)] leading-[0.95] tracking-[-0.04em] text-neutral-900">
                <span className="font-light italic">Yetz</span><span className="font-extralight">Art</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="h-px w-8 bg-neutral-300/60" />
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
                  Barcelona
                </span>
                <span className="h-px w-8 bg-neutral-300/60" />
              </div>
            </div>

            <div className="animate-fade-up animation-delay-100 mt-8">
              <p className="text-[15px] text-neutral-600 leading-[1.7] font-light max-w-lg mx-auto">
                Tu guía de cultura en Barcelona. Reunimos las mejores exposiciones,
                museos, galerías y talleres artísticos en un solo lugar para que
                no te pierdas nada.
              </p>
            </div>

            <div className="animate-fade-up animation-delay-200 mt-8 mb-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-300 ${
                      activeCategory === cat.value
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-500 bg-white/70 backdrop-blur-sm hover:text-neutral-900 border border-neutral-200/80 hover:border-neutral-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-[1200px] mx-auto px-8 py-12">
        {featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-5 h-px bg-neutral-900" />
              <h2 className="text-[11px] font-semibold text-neutral-900 uppercase tracking-[0.2em]">
                Destacados
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((event, i) => (
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

        <section>
          {rest.length > 0 && (
            <div className="flex items-center gap-3 mb-8">
              <div className="w-5 h-px bg-neutral-300" />
              <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.2em]">
                Todos los eventos
                <span className="ml-2 text-neutral-300">{rest.length}</span>
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {rest.map((event, i) => (
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

        {filtered.length === 0 && (
          <div className="text-center py-32">
            <p className="text-neutral-300 text-lg font-light">
              No hay eventos de esta categoría.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[15px] text-neutral-900 tracking-[-0.02em]">
              <span className="font-light italic">Yetz</span><span className="font-extralight">Art</span>
            </span>
            <span className="h-3 w-px bg-neutral-200" />
            <span className="text-[10px] text-neutral-300 font-medium uppercase tracking-[0.15em]">
              Barcelona
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 tracking-wide">
            Tu agenda cultural, actualizada
          </p>
        </div>
      </footer>
    </div>
  );
}
