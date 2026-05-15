"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Event } from "@/lib/types";
import { events as fallbackEvents } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventoPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check saved state
    const stored = localStorage.getItem("yetzart_saved");
    if (stored) {
      const ids = JSON.parse(stored);
      setSaved(ids.includes(id));
    }

    // Find event
    fetch("/events.json")
      .then((res) => res.json())
      .then((data: Event[]) => {
        const found = data.find((e) => e.id === id);
        setEvent(found || null);
      })
      .catch(() => {
        const found = fallbackEvents.find((e) => e.id === id);
        setEvent(found || null);
      })
      .finally(() => setLoading(false));
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[800px] mx-auto px-8 pt-32 text-center">
          <p className="text-neutral-300 text-lg font-light">
            Evento no encontrado.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 text-[13px] text-neutral-900 underline underline-offset-4 hover:text-neutral-500 transition-colors"
          >
            Volver a la agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero image */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover animate-scale-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-24 left-8 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-110 transition-all duration-300 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-8 -mt-20 relative z-10">
        <div className="animate-fade-up">
          {/* Category + Neighborhood */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 bg-neutral-50 px-4 py-2 rounded-full">
              {event.category}
            </span>
            <span className="text-[11px] text-neutral-300">
              {event.neighborhood}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[clamp(28px,5vw,48px)] font-semibold text-neutral-900 tracking-[-0.03em] leading-[1.15]">
            {event.title}
          </h1>

          {/* Venue */}
          <p className="mt-4 text-[17px] text-neutral-500 font-light">
            {event.venue}
          </p>
        </div>

        {/* Info bar */}
        <div className="animate-fade-up animation-delay-200 mt-10 flex flex-wrap gap-8 py-8 border-y border-neutral-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-300 block mb-2">
              Fechas
            </span>
            <span className="text-[14px] text-neutral-900">
              {event.endDate
                ? `${formatDate(event.startDate)} — ${formatDate(event.endDate)}`
                : `Desde ${formatDate(event.startDate)} · Permanente`}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-300 block mb-2">
              Precio
            </span>
            <span className="text-[14px] text-neutral-900">
              {event.price === null ? "Entrada gratuita" : `${event.price} €`}
            </span>
          </div>
          {event.address && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-300 block mb-2">
                Dirección
              </span>
              <span className="text-[14px] text-neutral-900">
                {event.address}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="animate-fade-up animation-delay-300 mt-10">
          <p className="text-[16px] text-neutral-600 leading-[1.9] font-light">
            {event.description}
          </p>
        </div>

        {/* Actions */}
        <div className="animate-fade-up animation-delay-400 mt-12 flex flex-wrap gap-4">
          <button
            onClick={toggleSave}
            className={`flex items-center gap-3 px-7 py-3.5 rounded-full text-[13px] font-medium transition-all duration-500 ${
              saved
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
            }`}
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
                </svg>
                Guardado
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Guardar
              </>
            )}
          </button>
          {event.url && event.url !== "" && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-7 py-3.5 rounded-full text-[13px] font-medium border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-all duration-500"
            >
              Visitar web
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
        </div>

        {/* Back link */}
        <div className="mt-20 mb-16 pt-10 border-t border-neutral-100">
          <Link
            href="/"
            className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors duration-300 flex items-center gap-2"
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
