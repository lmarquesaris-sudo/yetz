import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Yetz — Cultura a Barcelona",
  description:
    "El teu portal cultural de Barcelona: exposicions, teatre, música i esdeveniments. Descobreix què fer cada dia a la ciutat.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Yetz — Cultura a Barcelona",
    description: "Exposicions, teatre, música i els millors plans culturals de Barcelona. Cada setmana.",
    url: "https://artmatch-gamma.vercel.app",
    siteName: "Yetz",
    locale: "ca_ES",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=630&q=80&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Barcelona — Yetz Cultura",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yetz — Cultura a Barcelona",
    description: "Exposicions, teatre, música i els millors plans culturals de Barcelona.",
    images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=630&q=80&auto=format&fit=crop"],
  },
  metadataBase: new URL("https://artmatch-gamma.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ca" className={`${geist.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
