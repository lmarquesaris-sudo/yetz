"use client";

import Navbar from "@/components/Navbar";
import { newsItems } from "@/lib/news-data";
import Link from "next/link";

const tagColors: Record<string, string> = {
  Inauguración: "bg-blue-50 text-blue-600",
  Gratis: "bg-emerald-50 text-emerald-600",
  Patrimonio: "bg-amber-50 text-amber-700",
  Evento: "bg-purple-50 text-purple-600",
  Datos: "bg-neutral-100 text-neutral-600",
  Renovación: "bg-orange-50 text-orange-600",
  Sector: "bg-rose-50 text-rose-600",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NoticiasPage() {
  const [featured, ...rest] = newsItems;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <header className="pt-[100px] pb-12 max-w-[1200px] mx-auto px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-neutral-900" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
            Actualidad
          </span>
        </div>
        <h1 className="text-[clamp(36px,6vw,56px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.1]">
          Noticias
          <br />
          <span className="italic text-neutral-400">del arte en Barcelona</span>
        </h1>
        <p className="mt-6 text-[15px] text-neutral-400 font-light leading-relaxed max-w-lg">
          Lo último del mundo del arte en la ciudad: inauguraciones, eventos,
          novedades de museos y galerías.
        </p>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 pb-24">
        {/* Featured news */}
        {featured && (
          <article className="group mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      tagColors[featured.tag] || "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {featured.tag}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {formatDate(featured.date)}
                  </span>
                </div>
                <h2 className="text-[28px] font-semibold text-neutral-900 tracking-[-0.02em] leading-[1.2]">
                  {featured.title}
                </h2>
                <p className="mt-4 text-[15px] text-neutral-400 font-light leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-px bg-neutral-300" />
          <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.25em]">
            Más noticias
          </h2>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>

        {/* News list */}
        <div className="space-y-0">
          {rest.map((item) => (
            <article
              key={item.id}
              className="group flex items-start gap-6 py-7 border-b border-neutral-100 hover:border-neutral-300 transition-colors duration-300"
            >
              {/* Image */}
              <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 hidden sm:block">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                      tagColors[item.tag] || "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-neutral-300">
                    {formatDate(item.date)}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold text-neutral-900 tracking-[-0.01em] leading-[1.35] group-hover:text-neutral-500 transition-colors duration-300 line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] text-neutral-400 font-light leading-[1.7] line-clamp-2">
                  {item.excerpt}
                </p>
              </div>
            </article>
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
