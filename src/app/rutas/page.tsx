"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { artRoutes, ArtRoute } from "@/lib/routes-data";
import Link from "next/link";

export default function RutasPage() {
  const [selected, setSelected] = useState<ArtRoute | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <header className="pt-[100px] pb-16 max-w-[1200px] mx-auto px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-neutral-900" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
            Explora
          </span>
        </div>
        <h1 className="text-[clamp(36px,6vw,56px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.1]">
          Rutas artísticas
          <br />
          <span className="italic text-neutral-400">por Barcelona</span>
        </h1>
        <p className="mt-6 text-[15px] text-neutral-400 font-light leading-relaxed max-w-lg">
          Recorridos curados para descubrir el arte de la ciudad a tu ritmo.
          Cada ruta combina museos, galerías y rincones especiales.
        </p>
      </header>

      {/* Routes grid */}
      <main className="max-w-[1200px] mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {artRoutes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelected(selected?.id === route.id ? null : route)}
              className="group text-left"
            >
              <article
                className={`rounded-2xl overflow-hidden border transition-all duration-500 ${
                  selected?.id === route.id
                    ? "border-neutral-900 shadow-lg"
                    : "border-neutral-100 hover:border-neutral-300 hover:shadow-md"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={route.imageUrl}
                    alt={route.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-white text-[22px] font-semibold tracking-[-0.02em]">
                      {route.title}
                    </h2>
                    <p className="text-white/70 text-[13px] font-light mt-1">
                      {route.subtitle}
                    </p>
                  </div>
                </div>

                {/* Info bar */}
                <div className="px-6 py-4 flex items-center gap-4">
                  <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {route.duration}
                  </span>
                  <span className="h-3 w-px bg-neutral-200" />
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {route.stops} paradas
                  </span>
                  <span className="h-3 w-px bg-neutral-200" />
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {route.neighborhood}
                  </span>
                  <div className="flex-1" />
                  <div className="flex gap-1.5">
                    {route.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === route.id && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-[14px] text-neutral-500 font-light leading-relaxed mb-6">
                        {route.description}
                      </p>
                      <div className="space-y-4">
                        {route.venues.map((venue, i) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[12px] font-medium flex-shrink-0">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-neutral-900">
                                {venue.name}
                              </p>
                              <p className="text-[12px] text-neutral-400 font-light mt-0.5">
                                {venue.tip}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="group">
            <span className="text-[17px] text-neutral-900 tracking-[-0.02em] transition-opacity group-hover:opacity-60">
              <span className="font-light italic">Yetz</span>
              <span className="font-extralight">Art</span>
            </span>
          </Link>
          <p className="text-[11px] text-neutral-300 tracking-wide font-light">
            Tu guía de pintura y arte, actualizada
          </p>
        </div>
      </footer>
    </div>
  );
}
