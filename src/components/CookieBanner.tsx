"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("yetz_cookies")) setVisible(true);
    } catch {}
  }, []);

  function accept() {
    try { localStorage.setItem("yetz_cookies", "accepted"); } catch {}
    setVisible(false);
  }

  function reject() {
    try { localStorage.setItem("yetz_cookies", "rejected"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] bg-[var(--gallery-black)] text-white px-6 py-5 animate-fade-up">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-[13px] text-white/70 font-light flex-1 leading-relaxed">
          Utilitzem cookies per millorar la teva experiència.{" "}
          <Link href="/cookies" className="underline text-white/90 hover:text-white">
            Més informació
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={reject}
            className="px-5 py-2.5 text-[10px] font-medium tracking-[0.1em] uppercase border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
          >
            Rebutjar
          </button>
          <button
            onClick={accept}
            className="px-5 py-2.5 text-[10px] font-medium tracking-[0.1em] uppercase bg-white text-[var(--gallery-black)] hover:bg-white/90 transition-colors"
          >
            Acceptar
          </button>
        </div>
      </div>
    </div>
  );
}
