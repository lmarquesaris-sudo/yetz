"use client";

import Navbar from "@/components/Navbar";
import { blogPosts } from "@/lib/blog-data";
import Link from "next/link";

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <header className="pt-[100px] pb-16 max-w-[1200px] mx-auto px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-neutral-900" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.3em]">
            Blog
          </span>
        </div>
        <h1 className="text-[clamp(36px,6vw,56px)] font-light text-neutral-900 tracking-[-0.03em] leading-[1.1]">
          Guías y artículos
          <br />
          <span className="italic text-neutral-400">sobre arte en Barcelona</span>
        </h1>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 pb-24">
        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.id}`} className="group block mb-16">
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-100">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-neutral-900 text-white uppercase tracking-wider">
                    {featured.category}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {featured.readTime} de lectura
                  </span>
                </div>
                <h2 className="text-[28px] font-semibold text-neutral-900 tracking-[-0.02em] leading-[1.2] group-hover:text-neutral-500 transition-colors duration-500">
                  {featured.title}
                </h2>
                <p className="mt-4 text-[15px] text-neutral-400 font-light leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-neutral-900 group-hover:gap-3 transition-all duration-300">
                  Leer artículo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-8 h-px bg-neutral-300" />
          <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.25em]">
            Más artículos
          </h2>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>

        {/* Rest of posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {rest.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group">
              <article>
                <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-neutral-100 mb-5">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
                    {post.category}
                  </span>
                  <span className="h-px flex-1 bg-neutral-100" />
                  <span className="text-[11px] text-neutral-300">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold text-neutral-900 leading-[1.3] tracking-[-0.015em] group-hover:text-neutral-500 transition-colors duration-500 line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-[13px] text-neutral-400 leading-[1.7] line-clamp-2 font-light">
                  {post.excerpt}
                </p>
              </article>
            </Link>
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
