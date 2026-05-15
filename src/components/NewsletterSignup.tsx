"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-[14px] text-neutral-900 font-medium">
          ¡Suscrito!
        </p>
        <p className="text-[12px] text-neutral-400 font-light mt-1">
          Recibirás el boletín mensual con lo mejor del arte en Barcelona
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-[15px] font-medium text-neutral-900 tracking-[-0.01em]">
          Boletín mensual
        </h3>
        <p className="text-[12px] text-neutral-400 font-light mt-1.5 leading-relaxed">
          Recibe cada mes las exposiciones y eventos de pintura
          más destacados de Barcelona
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 px-5 py-3 rounded-full border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light bg-white"
        />
        <button
          type="submit"
          disabled={status === "sending" || !email}
          className="px-6 py-3 bg-neutral-900 text-white text-[12px] font-medium rounded-full hover:bg-neutral-800 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {status === "sending" ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Suscribirme"
          )}
        </button>
      </form>

      {status === "error" && (
        <p className="text-[11px] text-red-500 font-light mt-2 text-center">
          Error al suscribir. Inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
