"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Status = "idle" | "sending" | "sent" | "error";

export default function SugerirPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState("galería");
  const [neighborhood, setNeighborhood] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!venueName) return;

    // For now, just simulate a submission
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-[100px] pb-24">
        <div className="max-w-[600px] mx-auto px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-neutral-900" />
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
              Comunidad
            </span>
          </div>
          <h1 className="text-[clamp(36px,6vw,56px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.1] mb-4">
            Sugiere un espacio
          </h1>
          <p className="text-[15px] text-neutral-400 font-light leading-relaxed mb-12">
            ¿Conoces una galería, taller o espacio artístico que debería estar
            en YetzArt? Cuéntanos y lo revisaremos.
          </p>

          {status === "sent" ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-[22px] font-semibold text-neutral-900 mb-2">
                Sugerencia enviada
              </h2>
              <p className="text-[14px] text-neutral-400 font-light max-w-sm mx-auto">
                Revisaremos tu sugerencia y si encaja con nuestra línea editorial,
                lo añadiremos a la agenda. Gracias por contribuir.
              </p>
              <Link
                href="/"
                className="inline-block mt-8 px-6 py-3 text-[13px] font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors duration-300"
              >
                Volver a la agenda
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Venue name */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                  Nombre del espacio *
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Ej: Galería Cosmo"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                  Tipo de espacio
                </label>
                <div className="flex flex-wrap gap-2">
                  {["galería", "museo", "taller", "espacio alternativo", "otro"].map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVenueType(type)}
                        className={`px-4 py-2.5 rounded-full text-[12px] font-medium transition-all duration-300 ${
                          venueType === type
                            ? "bg-neutral-900 text-white"
                            : "border border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-900"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Neighborhood */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                  Barrio
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ej: El Raval, Gràcia, Poblenou..."
                  className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                  Web o Instagram
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://... o @cuenta"
                  className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                  ¿Por qué lo recomiendas?
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos qué hace especial a este espacio..."
                  rows={4}
                  className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light resize-none"
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-100" />

              {/* Contact info */}
              <p className="text-[12px] text-neutral-400 font-light">
                Opcional: déjanos tu contacto por si necesitamos más info
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-neutral-900 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-5 py-3.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!venueName || status === "sending"}
                className="w-full py-4 bg-neutral-900 text-white text-[14px] font-medium rounded-full hover:bg-neutral-800 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "sending" ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar sugerencia
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="text-[12px] text-red-500 font-light text-center">
                  Error al enviar. Inténtalo de nuevo.
                </p>
              )}
            </form>
          )}
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
