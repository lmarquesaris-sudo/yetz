"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Event } from "@/lib/types";
import { events as fallbackEvents } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const categoryLabels: Record<string, string> = {
  exposición: "Exposición",
  museo: "Museo",
  galería: "Galería",
  taller: "Taller",
  teatro: "Teatro",
  música: "Música",
  danza: "Danza",
  cine: "Cine",
  festival: "Festival",
};

export default function EventoPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yetzart_saved");
      if (stored) {
        const ids = JSON.parse(stored);
        setSaved(ids.includes(id));
      }
    } catch {}

    Promise.all([
      fetch("/events.json").then((res) => res.json()).catch(() => []),
      fetch("/culturajove-events.json").then((res) => res.json()).catch(() => []),
      fetch("/premium-events.json").then((res) => res.json()).catch(() => []),
    ]).then(([ajuntament, culturajove, premium]) => {
      const all = [...premium, ...ajuntament, ...culturajove, ...fallbackEvents];
      const found = all.find((e: Event) => e.id === id || String(e.id) === String(id));
      setEvent(found || null);
    }).catch(() => {
      const found = fallbackEvents.find((e) => e.id === id);
      setEvent(found || null);
    }).finally(() => setLoading(false));
  }, [id]);

  function toggleSave() {
    const stored = localStorage.getItem("yetzart_saved");
    const ids: string[] = stored ? JSON.parse(stored) : [];
    const next = saved ? ids.filter((s) => s !== id) : [...ids, id as string];
    localStorage.setItem("yetzart_saved", JSON.stringify(next));
    setSaved(!saved);
  }

  if (loading) {
    return (
      <div className="min-h-screen grain">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-5 h-5 border-2 border-neutral-200 border-t-[var(--gallery-black)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen grain">
        <Navbar />
        <div className="max-w-[800px] mx-auto px-8 pt-40 text-center">
          <p className="text-neutral-300 text-[20px] font-light font-editorial italic">
            Evento no encontrado.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 text-[11px] uppercase tracking-[0.15em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors"
          >
            Volver a la agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grain">
      <Navbar />

      {/* ── CINEMATIC HERO IMAGE ────────────────────── */}
      <div className="relative w-full h-[65vh] min-h-[450px] max-h-[750px] overflow-hidden">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="object-cover animate-scale-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ice)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--gallery-black)]/30 via-transparent to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-24 left-8 group flex items-center gap-3 text-white/60 hover:text-white transition-all duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-[11px] uppercase tracking-[0.15em] font-medium opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Volver
          </span>
        </Link>
      </div>

      {/* ── EVENT CONTENT ───────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-8 -mt-24 relative z-10">
        <div className="animate-fade-up">
          {/* Category badge */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--accent)]">
              {categoryLabels[event.category] || event.category}
            </span>
            {event.neighborhood && (
              <>
                <span className="h-[3px] w-[3px] rounded-full bg-neutral-300" />
                <span className="text-[11px] text-neutral-400 tracking-wide">
                  {event.neighborhood}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[clamp(32px,6vw,56px)] font-normal text-[var(--gallery-black)] tracking-[-0.03em] leading-[1.1] font-editorial">
            {event.title}
          </h1>

          {/* Venue */}
          <p className="mt-5 text-[18px] text-neutral-400 font-light font-editorial italic">
            {event.venue}
          </p>
        </div>

        {/* ── Info grid ─────────────────────────────── */}
        <div className="animate-fade-up animation-delay-200 mt-14 grid grid-cols-2 sm:grid-cols-3 gap-8 py-10 border-y border-neutral-200/50">
          <div>
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-neutral-300 block mb-3">
              Fechas
            </span>
            <span className="text-[14px] text-[var(--gallery-black)] leading-relaxed">
              {event.endDate
                ? `${formatDate(event.startDate)}`
                : `Desde ${formatDate(event.startDate)}`}
            </span>
            {event.endDate && event.endDate !== event.startDate && (
              <span className="block text-[14px] text-[var(--gallery-black)] mt-1">
                — {formatDate(event.endDate)}
              </span>
            )}
          </div>
          <div>
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-neutral-300 block mb-3">
              Precio
            </span>
            <span className={`text-[14px] ${event.price === null ? "text-emerald-600" : "text-[var(--gallery-black)]"}`}>
              {event.price === null ? "Entrada gratuita" : `${event.price} €`}
            </span>
          </div>
          {event.address && (
            <div>
              <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-neutral-300 block mb-3">
                Dirección
              </span>
              <span className="text-[14px] text-[var(--gallery-black)]">
                {event.address}
              </span>
            </div>
          )}
        </div>

        {/* ── Description ───────────────────────────── */}
        {event.description && (
          <div className="animate-fade-up animation-delay-300 mt-12">
            <p className="text-[16px] text-neutral-500 leading-[2] font-light">
              {event.description}
            </p>
          </div>
        )}

        {/* ── Actions ───────────────────────────────── */}
        <div className="animate-fade-up animation-delay-400 mt-14 flex flex-wrap gap-4">
          {/* Primary CTA: Asistir (link to event page) */}
          {event.url && event.url !== "" && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-3"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              {event.price !== null ? "Comprar entradas" : "Más información"}
            </a>
          )}

          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(event.venue + ", Barcelona")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Cómo llegar
          </a>

          <button
            onClick={() => {
              const text = `${event.title} — ${event.venue}, Barcelona`;
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: event.title, text, url });
              } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
              }
            }}
            className="btn-ghost flex items-center gap-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
            Compartir
          </button>

          <button
            onClick={toggleSave}
            className={`flex items-center gap-3 px-9 py-4 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-500 ${
              saved
                ? "bg-[var(--gallery-black)] text-white"
                : "border border-neutral-200 text-neutral-500 hover:border-[var(--gallery-black)] hover:text-[var(--gallery-black)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {saved ? "Guardado" : "Guardar"}
          </button>
        </div>

        {/* ── Back link ─────────────────────────────── */}
        <div className="mt-24 mb-20 pt-10 border-t border-neutral-200/50">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.15em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors duration-300 flex items-center gap-3"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver a la agenda
          </Link>
        </div>
      </div>
    </div>
  );
}
