import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = { title: "Avís legal — Yetz" };

export default function AvisLegal() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="max-w-[700px] mx-auto px-8 pt-32 pb-20">
        <h1 className="text-[clamp(28px,4vw,40px)] font-normal text-[var(--gallery-black)] tracking-[-0.02em] leading-[1.1] font-editorial mb-10">
          Avís legal
        </h1>

        <div className="text-[15px] text-neutral-500 leading-[1.9] font-light space-y-6">
          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Titular del lloc web</h2>
            <p>
              Yetz és un projecte personal de Luis Marques.<br />
              Correu electrònic de contacte: <a href="mailto:lmarquesaris@gmail.com" className="text-[var(--accent)] hover:text-[var(--gallery-black)] transition-colors">lmarquesaris@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Objecte</h2>
            <p>
              Aquest lloc web té com a finalitat oferir informació sobre esdeveniments culturals a Barcelona.
              Les dades dels esdeveniments provenen de fonts públiques, principalment l&apos;API Open Data de l&apos;Ajuntament de Barcelona.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Propietat intel·lectual</h2>
            <p>
              El disseny, codi font i continguts originals d&apos;aquest lloc web són propietat del seu titular.
              Les imatges i descripcions dels esdeveniments pertanyen als seus respectius organitzadors.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Limitació de responsabilitat</h2>
            <p>
              Yetz no es fa responsable de l&apos;exactitud, actualitat o exhaustivitat de la informació dels esdeveniments publicats.
              Es recomana verificar les dades directament amb l&apos;organitzador de cada esdeveniment.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Legislació aplicable</h2>
            <p>
              Aquest avís legal es regeix per la legislació espanyola. Per a qualsevol controvèrsia, les parts se sotmeten
              als jutjats i tribunals de Barcelona.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200/50 flex gap-6">
          <Link href="/privacitat" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Privacitat</Link>
          <Link href="/cookies" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Cookies</Link>
        </div>
      </article>
    </div>
  );
}
