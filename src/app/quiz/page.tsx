"use client";

import { useState, useCallback } from "react";
import {
  QUESTIONS,
  PAINTERS,
  calculateResult,
  PainterProfile,
} from "@/lib/quiz-data";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Phase = "intro" | "quiz" | "result";
type EmailStatus = "idle" | "sending" | "sent" | "error";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [result, setResult] = useState<PainterProfile | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Email capture
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");

  const handleStart = useCallback(() => {
    setPhase("quiz");
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setResult(null);
    setShowResult(false);
    setEmail("");
    setEmailStatus("idle");
  }, []);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (transitioning) return;
      setSelectedOption(optionIndex);
      setTransitioning(true);

      const newAnswers = [...answers, optionIndex];

      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setAnswers(newAnswers);
          setCurrentQ((prev) => prev + 1);
          setSelectedOption(null);
          setTransitioning(false);
        } else {
          const painterResult = calculateResult(newAnswers);
          setAnswers(newAnswers);
          setResult(painterResult);
          setPhase("result");
          setTransitioning(false);
          setTimeout(() => setShowResult(true), 100);
        }
      }, 600);
    },
    [answers, currentQ, transitioning]
  );

  const handleSendEmail = useCallback(async () => {
    if (!email || !result || emailStatus === "sending") return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setEmailStatus("sending");
    try {
      const res = await fetch("/api/quiz-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, painterId: result.id }),
      });
      if (res.ok) {
        setEmailStatus("sent");
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  }, [email, result, emailStatus]);

  const progress =
    phase === "quiz" ? ((currentQ + 1) / QUESTIONS.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Intro ──────────────────────────────────── */}
      {phase === "intro" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-8">
          <div className="max-w-lg text-center animate-fade-up">
            {/* Decorative painter palette */}
            <div className="mb-10 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-neutral-400"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
                    <circle cx="7.5" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="10.5" cy="6.5" r="1.5" fill="currentColor" />
                    <circle cx="14.5" cy="6.5" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="10" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span className="absolute -bottom-1 -left-2 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse animation-delay-300" />
                <span className="absolute top-2 -left-3 w-2 h-2 rounded-full bg-red-500 animate-pulse animation-delay-500" />
              </div>
            </div>

            <h1 className="text-[clamp(32px,6vw,48px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.1]">
              ¿Qué pintor
              <br />
              <span className="italic">eres tú?</span>
            </h1>

            <p className="mt-6 text-[15px] text-neutral-400 font-light leading-[1.8] max-w-sm mx-auto">
              Responde 7 preguntas y descubre qué artista famoso comparte tu
              forma de ver el mundo.
            </p>

            <button
              onClick={handleStart}
              className="mt-10 px-10 py-4 bg-neutral-900 text-white text-[13px] font-medium tracking-wide rounded-full hover:bg-neutral-800 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              Comenzar el quiz
            </button>

            <div className="mt-16 flex items-center justify-center gap-3 flex-wrap">
              {PAINTERS.slice(0, 6).map((p) => (
                <span
                  key={p.id}
                  className="text-[11px] text-neutral-300 font-light"
                >
                  {p.name}
                </span>
              ))}
              <span className="text-[11px] text-neutral-200">+6 más</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Quiz Questions ─────────────────────────── */}
      {phase === "quiz" && (
        <div className="min-h-screen flex flex-col pt-[64px]">
          {/* Progress bar */}
          <div className="w-full h-[2px] bg-neutral-100">
            <div
              className="h-full bg-neutral-900 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question counter */}
          <div className="max-w-[640px] mx-auto w-full px-8 pt-10">
            <span className="text-[11px] font-medium text-neutral-300 tracking-[0.2em] uppercase">
              {currentQ + 1} / {QUESTIONS.length}
            </span>
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
            <div
              className="max-w-[640px] w-full"
              key={currentQ}
              style={{
                animation:
                  "fadeUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
              }}
            >
              <h2 className="text-[clamp(24px,4vw,36px)] font-light text-neutral-900 tracking-[-0.02em] leading-[1.25] mb-3">
                {QUESTIONS[currentQ].question}
              </h2>

              {QUESTIONS[currentQ].subtitle && (
                <p className="text-[14px] text-neutral-400 font-light mb-8">
                  {QUESTIONS[currentQ].subtitle}
                </p>
              )}

              <div className="mt-10 space-y-3">
                {QUESTIONS[currentQ].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={transitioning}
                    className={`w-full text-left px-7 py-5 rounded-2xl border transition-all duration-500 group ${
                      selectedOption === i
                        ? "border-neutral-900 bg-neutral-900 text-white scale-[0.98]"
                        : "border-neutral-150 hover:border-neutral-400 text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-medium transition-all duration-500 ${
                          selectedOption === i
                            ? "border-white/30 text-white"
                            : "border-neutral-200 text-neutral-300 group-hover:border-neutral-400 group-hover:text-neutral-500"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[15px] font-light leading-snug">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Back to intro */}
          <div className="max-w-[640px] mx-auto w-full px-8 pb-10">
            <button
              onClick={() => setPhase("intro")}
              className="text-[12px] text-neutral-300 hover:text-neutral-500 transition-colors duration-300"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      )}

      {/* ── Result ─────────────────────────────────── */}
      {phase === "result" && result && (
        <div className="min-h-screen pt-[64px]">
          <div className="max-w-[800px] mx-auto px-8 py-16">
            {/* Result header */}
            <div
              className="text-center mb-16"
              style={{
                opacity: showResult ? 1 : 0,
                transform: showResult ? "translateY(0)" : "translateY(20px)",
                transition:
                  "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-[0.3em]">
                Tu match artístico
              </span>
              <h1 className="mt-6 text-[clamp(40px,8vw,72px)] font-light text-neutral-900 tracking-[-0.04em] leading-[1]">
                Eres{" "}
                <span
                  className="italic font-normal"
                  style={{ color: result.color }}
                >
                  {result.name}
                </span>
              </h1>
            </div>

            {/* Painter card */}
            <div
              className="relative overflow-hidden rounded-3xl bg-neutral-50"
              style={{
                opacity: showResult ? 1 : 0,
                transform: showResult ? "translateY(0)" : "translateY(30px)",
                transition:
                  "all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s",
              }}
            >
              <div
                className="h-1 w-full"
                style={{ background: result.color }}
              />

              <div className="p-8 sm:p-12">
                {/* Name & movement */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-8 mb-10">
                  <div className="flex-1">
                    <h2 className="text-[28px] font-semibold text-neutral-900 tracking-[-0.02em]">
                      {result.fullName}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[13px] text-neutral-400 font-light">
                        {result.years}
                      </span>
                      <span className="h-3 w-px bg-neutral-200" />
                      <span className="text-[13px] text-neutral-400 font-light">
                        {result.movement}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="relative pl-6 py-4 mb-10 border-l-2 border-neutral-200">
                  <p className="text-[17px] text-neutral-600 italic font-light leading-[1.7]">
                    &ldquo;{result.quote}&rdquo;
                  </p>
                </blockquote>

                {/* Description */}
                <p className="text-[15px] text-neutral-500 leading-[1.9] font-light mb-10">
                  {result.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2">
                  {result.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-5 py-2.5 rounded-full text-[12px] font-medium tracking-wide border"
                      style={{
                        borderColor: result.color + "40",
                        color: result.color,
                        background: result.color + "08",
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Email capture ─────────────────────── */}
            <div
              className="mt-12 rounded-2xl border border-neutral-100 p-8 sm:p-10"
              style={{
                opacity: showResult ? 1 : 0,
                transform: showResult ? "translateY(0)" : "translateY(20px)",
                transition:
                  "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s",
              }}
            >
              {emailStatus === "sent" ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="text-[15px] text-neutral-900 font-medium">
                    Email enviado
                  </p>
                  <p className="text-[13px] text-neutral-400 font-light mt-1">
                    Revisa tu bandeja de entrada con tu perfil de{" "}
                    {result.name}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-[17px] font-medium text-neutral-900 tracking-[-0.01em]">
                      Recibe tu resultado por email
                    </h3>
                    <p className="text-[13px] text-neutral-400 font-light mt-1.5">
                      Te enviaremos la biografía de {result.name} con tu perfil
                      artístico completo
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                      placeholder="tu@email.com"
                      className="flex-1 px-5 py-3.5 rounded-full border border-neutral-200 text-[14px] text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400 transition-colors duration-300 font-light"
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={emailStatus === "sending" || !email}
                      className="px-7 py-3.5 bg-neutral-900 text-white text-[13px] font-medium rounded-full hover:bg-neutral-800 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {emailStatus === "sending" ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                  {emailStatus === "error" && (
                    <p className="text-[12px] text-red-500 font-light mt-3 text-center">
                      Hubo un error al enviar. Inténtalo de nuevo.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{
                opacity: showResult ? 1 : 0,
                transform: showResult ? "translateY(0)" : "translateY(20px)",
                transition:
                  "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s",
              }}
            >
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-neutral-900 text-white text-[13px] font-medium tracking-wide rounded-full hover:bg-neutral-800 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                Repetir el quiz
              </button>
              <Link
                href="/"
                className="px-8 py-4 text-[13px] font-medium text-neutral-400 border border-neutral-200 rounded-full hover:text-neutral-900 hover:border-neutral-400 transition-all duration-500"
              >
                Explorar la agenda
              </Link>
            </div>

            {/* Other painters grid */}
            <div
              className="mt-24 pt-12 border-t border-neutral-100"
              style={{
                opacity: showResult ? 1 : 0,
                transition: "opacity 1s ease 0.8s",
              }}
            >
              <h3 className="text-center text-[11px] font-semibold text-neutral-300 uppercase tracking-[0.25em] mb-10">
                Otros perfiles artísticos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {PAINTERS.filter((p) => p.id !== result.id).map((painter) => (
                  <div
                    key={painter.id}
                    className="text-center py-5 px-3 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors duration-300"
                  >
                    <span
                      className="block text-[15px] font-medium tracking-[-0.01em] mb-1"
                      style={{ color: painter.color }}
                    >
                      {painter.name}
                    </span>
                    <span className="text-[11px] text-neutral-300 font-light">
                      {painter.movement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
