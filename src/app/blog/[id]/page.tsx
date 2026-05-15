"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/lib/blog-data";
import Link from "next/link";

export default function BlogPostPage() {
  const params = useParams();
  const post = blogPosts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-[120px] text-center">
          <p className="text-neutral-400 text-lg font-light">
            Artículo no encontrado
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-block text-[13px] font-medium text-neutral-900 hover:text-neutral-500 transition-colors"
          >
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const dateFormatted = new Date(post.date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="pt-[100px] pb-24">
        {/* Header */}
        <header className="max-w-[720px] mx-auto px-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600 uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-[12px] text-neutral-400">{dateFormatted}</span>
            <span className="text-[12px] text-neutral-300">·</span>
            <span className="text-[12px] text-neutral-400">{post.readTime} de lectura</span>
          </div>
          <h1 className="text-[clamp(28px,5vw,42px)] font-semibold text-neutral-900 tracking-[-0.03em] leading-[1.15]">
            {post.title}
          </h1>
          <p className="mt-6 text-[17px] text-neutral-400 font-light leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Hero image */}
        <div className="max-w-[960px] mx-auto px-8 mb-12">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[720px] mx-auto px-8">
          <div className="prose prose-neutral prose-lg font-light">
            <p className="text-[16px] text-neutral-600 leading-[1.9] font-light">
              {post.content}
            </p>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-neutral-100">
            <Link
              href="/blog"
              className="text-[13px] font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-300 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al blog
            </Link>
          </div>
        </div>
      </article>

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
