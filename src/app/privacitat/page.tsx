import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = { title: "Política de privacitat — Yetz" };

export default function Privacitat() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="max-w-[700px] mx-auto px-8 pt-32 pb-20">
        <h1 className="text-[clamp(28px,4vw,40px)] font-normal text-[var(--gallery-black)] tracking-[-0.02em] leading-[1.1] font-editorial mb-10">
          Política de privacitat
        </h1>

        <div className="text-[15px] text-neutral-500 leading-[1.9] font-light space-y-6">
          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Responsable del tractament</h2>
            <p>
              Luis Marques<br />
              Correu: <a href="mailto:lmarquesaris@gmail.com" className="text-[var(--accent)] hover:text-[var(--gallery-black)] transition-colors">lmarquesaris@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Dades que recollim</h2>
            <p>
              Yetz no recull dades personals dels seus usuaris. No hi ha formularis de registre,
              subscripció ni compra. Les úniques dades emmagatzemades es guarden localment al teu
              navegador (localStorage) per recordar els teus esdeveniments desats i la preferència de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Cookies</h2>
            <p>
              Consulta la nostra <Link href="/cookies" className="text-[var(--accent)] hover:text-[var(--gallery-black)] transition-colors">política de cookies</Link> per
              conèixer quines cookies utilitza aquest lloc web.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Drets dels usuaris</h2>
            <p>
              D&apos;acord amb el Reglament General de Protecció de Dades (RGPD), tens dret a:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Accedir a les teves dades personals</li>
              <li>Rectificar dades inexactes</li>
              <li>Sol·licitar la supressió de les teves dades</li>
              <li>Oposar-te al tractament de les teves dades</li>
              <li>Sol·licitar la portabilitat de les teves dades</li>
            </ul>
            <p className="mt-3">
              Per exercir qualsevol d&apos;aquests drets, contacta&apos;ns a{" "}
              <a href="mailto:lmarquesaris@gmail.com" className="text-[var(--accent)] hover:text-[var(--gallery-black)] transition-colors">lmarquesaris@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[var(--gallery-black)] font-medium text-[16px] mb-2">Actualitzacions</h2>
            <p>
              Ens reservem el dret d&apos;actualitzar aquesta política de privacitat. Qualsevol canvi
              es publicarà en aquesta mateixa pàgina.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200/50 flex gap-6">
          <Link href="/avis-legal" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Avís legal</Link>
          <Link href="/cookies" className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 hover:text-[var(--gallery-black)] transition-colors">Cookies</Link>
        </div>
      </article>
    </div>
  );
}
