import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = { title: "Política de cookies — Yetz" };

export default function Cookies() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="max-w-[700px] mx-auto px-8 pt-32 pb-20">
        <h1 className="text-[clamp(28px,4vw,40px)] font-normal text-[var(--gallery-black)] tracking-[-0.02em] leading-[1.1] font-editorial mb-10">
          Política de cookies
        </h1>

        <div className="text-[15px] text-neutral-500 leading-[1.9] font-light space-y-6">
          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Què són les cookies?</h2>
            <p>
              Les cookies són petits fitxers de text que els llocs web emmagatzemen al teu navegador per
              recordar informació sobre la teva visita.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Cookies que utilitzem</h2>

            <div className="mt-4 border border-neutral-200/50">
              <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-neutral-50 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400">
                <span>Nom</span>
                <span>Finalitat</span>
                <span>Durada</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 border-t border-neutral-100 text-[13px]">
                <span className="font-mono text-[12px]">yetz_cookies</span>
                <span>Registrar la teva preferència sobre cookies</span>
                <span>Permanent</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 border-t border-neutral-100 text-[13px]">
                <span className="font-mono text-[12px]">yetzart_saved</span>
                <span>Guardar els teus esdeveniments preferits</span>
                <span>Permanent</span>
              </div>
            </div>

            <p className="mt-4">
              Totes les cookies anteriors són <strong>tècniques i estrictament necessàries</strong>.
              S&apos;emmagatzemen localment al teu navegador (localStorage) i no s&apos;envien a cap servidor.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Cookies de tercers</h2>
            <p>
              Actualment, Yetz no utilitza cookies de tercers ni serveis d&apos;analítica.
              Si en el futur s&apos;incorporen, aquesta política s&apos;actualitzarà i se&apos;t demanarà
              consentiment previ.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Com desactivar les cookies</h2>
            <p>
              Pots configurar el teu navegador per bloquejar o eliminar cookies. Tingues en compte que
              desactivar-les pot afectar algunes funcionalitats del lloc, com recordar els teus
              esdeveniments desats.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200/50 flex gap-6">
          <Link href="/avis-legal" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Avís legal</Link>
          <Link href="/privacitat" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Privacitat</Link>
        </div>
      </article>
    </div>
  );
}
