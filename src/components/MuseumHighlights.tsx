"use client";

import { useRef, useEffect, useState } from "react";

interface Museum {
  name: string;
  shortName: string;
  image: string;
  description: string;
  venueFilter: string;
}

const MUSEUMS: Museum[] = [
  {
    name: "MACBA",
    shortName: "MACBA",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&h=600&fit=crop",
    description: "Museu d'Art Contemporani de Barcelona",
    venueFilter: "museu d'art contemporani",
  },
  {
    name: "Fundació Joan Miró",
    shortName: "Miró",
    image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=900&h=600&fit=crop",
    description: "El universo de Joan Miró en Montjuïc",
    venueFilter: "fundació joan miró",
  },
  {
    name: "Museu Picasso",
    shortName: "Picasso",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&h=600&fit=crop",
    description: "La colección más completa de su etapa formativa",
    venueFilter: "museu picasso",
  },
  {
    name: "MNAC",
    shortName: "MNAC",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&h=600&fit=crop",
    description: "Museu Nacional d'Art de Catalunya",
    venueFilter: "museu nacional",
  },
  {
    name: "CaixaForum",
    shortName: "CaixaForum",
    image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&h=600&fit=crop",
    description: "Centro cultural en la antigua fábrica Casaramona",
    venueFilter: "caixaforum",
  },
];

interface MuseumHighlightsProps {
  onSelectMuseum: (venueFilter: string) => void;
  activeMuseum: string | null;
}

export default function MuseumHighlights({ onSelectMuseum, activeMuseum }: MuseumHighlightsProps) {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-[1100px] mx-auto px-8">
        {/* Section header */}
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
              Descubre
            </span>
          </div>
          <h2
            className="text-[clamp(32px,5vw,48px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Los grandes museos
            <br />
            <span className="italic text-neutral-400">de Barcelona</span>
          </h2>
        </div>

        {/* Museum cards */}
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible">
          {MUSEUMS.map((museum, i) => (
            <button
              key={museum.name}
              onClick={() =>
                onSelectMuseum(
                  activeMuseum === museum.venueFilter ? "" : museum.venueFilter
                )
              }
              className="flex-shrink-0 w-[200px] lg:w-auto group text-left transition-all duration-[800ms]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(36px)",
                transitionDelay: `${200 + i * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                className={`relative overflow-hidden rounded-[20px] aspect-[3/4] transition-all duration-700 shadow-[0_2px_12px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] ${
                  activeMuseum === museum.venueFilter
                    ? "ring-2 ring-neutral-900 ring-offset-4"
                    : ""
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <img
                  src={museum.image}
                  alt={museum.name}
                  className="w-full h-full object-cover transition-all duration-[1400ms] group-hover:scale-[1.06]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3
                    className="text-white text-[22px] font-semibold tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {museum.shortName}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-[12px] text-neutral-400 font-light leading-relaxed line-clamp-2 px-1">
                {museum.description}
              </p>
            </button>
          ))}
        </div>

        {activeMuseum && (
          <div className="mt-10 flex justify-center animate-fade-up">
            <button
              onClick={() => onSelectMuseum("")}
              className="btn-ghost text-[12px] flex items-center gap-2"
            >
              <span>×</span>
              Ver todos los eventos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
