import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-8 pt-40 pb-20 text-center">
        <span className="text-[120px] font-normal text-neutral-100 leading-none font-editorial">
          404
        </span>
        <p className="text-[20px] text-neutral-400 font-light font-editorial italic mt-6">
          Aquesta pàgina no existeix.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 px-8 py-4 text-[11px] font-medium tracking-[0.15em] uppercase bg-[var(--gallery-black)] text-white hover:bg-black transition-colors duration-300"
        >
          Tornar a l&apos;agenda
        </Link>
      </div>
    </div>
  );
}
