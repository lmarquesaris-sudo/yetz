"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { generatePlan, matchMood, detectZone } from "@/lib/plans-data";
import type { Plan } from "@/lib/plans-data";

const SUGGESTIONS = [
  "Un sábado cultural sin prisas",
  "Plan romántico para dos",
  "Algo divertido sin gastar mucho",
  "Noche de música en el Poblenou",
  "Tarde por Gràcia con vermut",
  "Plan cultural por el Raval",
  "Paseo y cena por el Born",
  "Sorpréndeme con lo que sea",
];

/** Build a Google Maps search URL for a venue in Barcelona */
function mapsUrl(name: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(name + " Barcelona")}`;
}

/** Renders **bold** (as map links), *italic*, and plain text */
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const name = part.slice(2, -2);
      return (
        <a
          key={i}
          href={mapsUrl(name)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-[3px] hover:decoration-neutral-800 transition-colors duration-300"
        >
          {name}
        </a>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-neutral-600">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function SorprendemePage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const planRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reveal paragraphs one by one
  useEffect(() => {
    if (!activePlan) return;
    setVisibleParagraphs(0);
    const total = activePlan.paragraphs.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setVisibleParagraphs(current);
      if (current >= total + 1) clearInterval(interval);
    }, 400);

    setTimeout(() => {
      planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    return () => clearInterval(interval);
  }, [activePlan]);

  const generate = (text: string) => {
    setIsGenerating(true);
    setActivePlan(null);

    setTimeout(() => {
      const mood = matchMood(text);
      const zone = detectZone(text);
      const plan = generatePlan(mood, zone);
      setActivePlan(plan);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    generate(input);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    generate(text);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--ice)" }}>
      <Navbar />

      <main className="pt-[100px] pb-24">
        {/* Hero */}
        <div
          className="max-w-[620px] mx-auto px-8 text-center mb-10 transition-all duration-[1000ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-neutral-900" />
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.35em]">
              Tu plan perfecto
            </span>
            <div className="w-8 h-px bg-neutral-900" />
          </div>
          <h1
            className="text-[clamp(32px,5vw,48px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.1]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Cuéntame qué te{" "}
            <span className="italic font-light">apetece</span>
          </h1>
          <p className="mt-4 text-[15px] text-neutral-400 font-light leading-relaxed max-w-md mx-auto">
            Dime cómo te sientes y te escribo un plan completo:
            paseo, cultura, dónde comer y dónde tomar algo.
          </p>
        </div>

        {/* Input area */}
        <div
          className="max-w-[620px] mx-auto px-8 transition-all duration-[1000ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "150ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="glass-card rounded-[20px] p-5">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ej: Quiero un sábado tranquilo con arte, un paseo por el Born y cenar sin gastarme mucho..."
                className="flex-1 bg-transparent resize-none text-[15px] text-neutral-900 placeholder:text-neutral-300 font-light leading-relaxed focus:outline-none min-h-[56px] max-h-[120px] py-2"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  input.trim() && !isGenerating
                    ? "bg-neutral-900 text-white shadow-md hover:shadow-lg hover:scale-105"
                    : "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                }`}
              >
                {isGenerating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          {!activePlan && !isGenerating && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="text-[12px] text-neutral-500 font-light px-3.5 py-2 rounded-full border border-neutral-200/60 bg-white/50 hover:bg-white hover:text-neutral-900 hover:border-neutral-300 transition-all duration-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="max-w-[620px] mx-auto px-8 mt-12">
            <div className="flex items-center gap-3 py-8 animate-fade-up justify-center">
              <div className="flex gap-1.5 items-center">
                <span
                  className="text-[13px] text-neutral-400 font-light italic mr-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Escribiendo tu plan
                </span>
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Generated plan — narrative prose */}
        {activePlan && (
          <div ref={planRef} className="max-w-[620px] mx-auto px-8 mt-14">
            {/* Title */}
            <div className="text-center mb-10 animate-fade-up" style={{ animationDuration: "0.6s" }}>
              <h2
                className="text-[clamp(28px,4.5vw,40px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.15] mb-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {activePlan.title}
              </h2>
              <p className="text-[13px] text-neutral-400 font-light italic">
                {activePlan.subtitle}
              </p>
              <div className="w-12 h-px bg-neutral-200 mx-auto mt-6" />
            </div>

            {/* Narrative paragraphs */}
            <div className="space-y-6">
              {activePlan.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-[15.5px] text-neutral-500 font-light leading-[1.9] transition-all duration-[1000ms]"
                  style={{
                    opacity: visibleParagraphs > idx ? 1 : 0,
                    transform: visibleParagraphs > idx ? "translateY(0)" : "translateY(12px)",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {renderText(paragraph)}
                </p>
              ))}
            </div>

            {/* End ornament + actions */}
            <div
              className="mt-12 transition-all duration-[1000ms]"
              style={{
                opacity: visibleParagraphs > activePlan.paragraphs.length - 1 ? 1 : 0,
                transform: visibleParagraphs > activePlan.paragraphs.length - 1 ? "translateY(0)" : "translateY(12px)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="flex items-center gap-4 justify-center mb-8">
                <div className="w-8 h-px bg-neutral-200" />
                <span className="text-[18px] text-neutral-200">✦</span>
                <div className="w-8 h-px bg-neutral-200" />
              </div>

              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() => {
                    // Re-generate with same input for a different plan
                    generate(input);
                  }}
                  className="text-[12px] text-neutral-500 hover:text-neutral-900 font-medium transition-colors duration-300 flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 4v6h6M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                  </svg>
                  Otra versión
                </button>
                <span className="h-3 w-px bg-neutral-200" />
                <button
                  onClick={() => {
                    setActivePlan(null);
                    setInput("");
                    setVisibleParagraphs(0);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-[12px] text-neutral-500 hover:text-neutral-900 font-medium transition-colors duration-300"
                >
                  Nuevo plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        {!activePlan && !isGenerating && (
          <div
            className="max-w-[620px] mx-auto px-8 mt-20 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "300ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex items-center gap-4 mb-8 justify-center">
              <div className="w-8 h-px bg-neutral-200" />
              <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-[0.35em]">
                Cómo funciona
              </span>
              <div className="w-8 h-px bg-neutral-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Cuéntame",
                  desc: "Describe qué te apetece: tranquilo, romántico, con presupuesto, fiestero...",
                },
                {
                  step: "02",
                  title: "Te escribo el plan",
                  desc: "Con sitios reales de Barcelona: restaurantes, bares, paseos y cultura del momento.",
                },
                {
                  step: "03",
                  title: "Sal a vivirlo",
                  desc: "Cada vez un plan distinto. Si no te convence, dale a «otra versión».",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <span className="text-[32px] font-extralight text-neutral-200 tabular-nums">
                    {item.step}
                  </span>
                  <h3
                    className="text-[15px] font-medium text-neutral-900 mt-2 mb-2"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-neutral-400 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100">
        <div className="max-w-[1100px] mx-auto px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="group">
            <span
              className="text-[17px] text-neutral-900 tracking-[-0.02em] transition-opacity group-hover:opacity-60"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              <span className="italic font-medium">Yetz</span>
            </span>
          </Link>
          <p className="text-[11px] text-neutral-300 tracking-wide font-light">
            Tu portal cultural de Barcelona
          </p>
        </div>
      </footer>
    </div>
  );
}
