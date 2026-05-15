"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--ice)" }}>
      <Navbar />

      <main className="pt-[100px] pb-24">
        <div className="max-w-[720px] mx-auto px-8">
          {/* Header */}
          <div
            className="mb-16 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-neutral-900" />
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
                Sobre nosotros
              </span>
            </div>
            <h1
              className="text-[clamp(36px,6vw,56px)] font-normal text-neutral-900 tracking-[-0.03em] leading-[1.05]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Sobre{" "}
              <span className="italic font-light">Yetz</span>
            </h1>
          </div>

          {/* Mission */}
          <section
            className="mb-20 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "150ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h2
              className="text-[28px] font-normal text-neutral-900 tracking-[-0.02em] mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              La cultura de Barcelona,{" "}
              <span className="italic font-light">centralizada</span>
            </h2>
            <p className="text-[17px] text-neutral-500 font-light leading-[1.9]">
              Barcelona es una de las ciudades con mayor densidad cultural del mundo.
              Cada semana se inauguran exposiciones, se estrenan obras de teatro,
              llegan conciertos y festivales que transforman la ciudad. Pero toda esa
              oferta está dispersa en cientos de webs, agendas municipales y redes sociales.
            </p>
            <p className="text-[17px] text-neutral-500 font-light leading-[1.9] mt-5">
              Yetz nace para ser tu portal cultural de Barcelona: arte, teatro, música
              y todo lo que pasa en la ciudad, en un solo lugar. Curado, actualizado y
              diseñado para que descubrir cultura sea tan fácil como abrir una página.
            </p>
          </section>

          {/* Community vision */}
          <section
            className="mb-20 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "300ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="glass-card rounded-[24px] p-10">
              <h2
                className="text-[24px] font-normal text-neutral-900 tracking-[-0.02em] mb-6"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Más que una agenda:{" "}
                <span className="italic font-light">una comunidad</span>
              </h2>
              <p className="text-[15px] text-neutral-500 font-light leading-[1.9]">
                Nuestro objetivo va más allá de listar eventos. Queremos construir
                una comunidad de personas que comparten la pasión por la cultura
                barcelonesa. Un lugar donde descubrir, compartir y vivir la ciudad
                de una forma más rica.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-neutral-100">
                <div>
                  <span className="text-[32px] font-extralight text-neutral-200 tabular-nums">01</span>
                  <h3 className="text-[14px] font-medium text-neutral-900 mt-1">Descubrir</h3>
                  <p className="text-[12px] text-neutral-400 font-light mt-1 leading-relaxed">
                    Encuentra eventos que no sabías que existían.
                  </p>
                </div>
                <div>
                  <span className="text-[32px] font-extralight text-neutral-200 tabular-nums">02</span>
                  <h3 className="text-[14px] font-medium text-neutral-900 mt-1">Compartir</h3>
                  <p className="text-[12px] text-neutral-400 font-light mt-1 leading-relaxed">
                    Comparte tus descubrimientos con la comunidad.
                  </p>
                </div>
                <div>
                  <span className="text-[32px] font-extralight text-neutral-200 tabular-nums">03</span>
                  <h3 className="text-[14px] font-medium text-neutral-900 mt-1">Vivir</h3>
                  <p className="text-[12px] text-neutral-400 font-light mt-1 leading-relaxed">
                    Vive Barcelona a través de su cultura.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section
            className="mb-20 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "450ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h2 className="text-[13px] font-semibold text-neutral-900 uppercase tracking-[0.15em] mb-8">
              Lo que nos mueve
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-medium text-neutral-900 mb-2">Curación</h3>
                <p className="text-[13px] text-neutral-400 font-light leading-relaxed">
                  No lo mostramos todo. Seleccionamos lo que merece la pena para que
                  no pierdas tiempo.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-medium text-neutral-900 mb-2">Diversidad</h3>
                <p className="text-[13px] text-neutral-400 font-light leading-relaxed">
                  Arte, teatro, música, danza, cine. Toda la cultura de Barcelona
                  en un solo lugar.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-medium text-neutral-900 mb-2">Local</h3>
                <p className="text-[13px] text-neutral-400 font-light leading-relaxed">
                  Hechos en Barcelona, para Barcelona. Conocemos la ciudad y su
                  escena cultural de primera mano.
                </p>
              </div>
            </div>
          </section>

          {/* Who */}
          <section
            className="mb-16 transition-all duration-[1000ms]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "600ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h2 className="text-[13px] font-semibold text-neutral-900 uppercase tracking-[0.15em] mb-4">
              Quién está detrás
            </h2>
            <p className="text-[17px] text-neutral-500 font-light leading-[1.9]">
              Yetz es un proyecto independiente creado por un amante de la cultura
              y la tecnología que vive en Barcelona. Nació de la frustración de tener
              que buscar en veinte sitios diferentes cada vez que quería planificar
              un fin de semana cultural.
            </p>
            <p className="text-[17px] text-neutral-500 font-light leading-[1.9] mt-4">
              Si quieres colaborar, sugerir un espacio o simplemente saludar,
              escríbenos.
            </p>
          </section>

          {/* Contact */}
          <section className="glass-card rounded-[24px] p-8">
            <h2
              className="text-[18px] font-medium text-neutral-900 mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Contacto
            </h2>
            <p className="text-[13px] text-neutral-400 font-light mb-4">
              Para colaboraciones, sugerencias o prensa.
            </p>
            <a
              href="mailto:hola@yetzart.com"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-900 hover:text-neutral-500 transition-colors duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              hola@yetzart.com
            </a>
          </section>
        </div>
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
