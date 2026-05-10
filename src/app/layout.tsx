import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YetzArt — Cultura en Barcelona",
  description:
    "Tu guía de exposiciones, museos, galerías y talleres artísticos en Barcelona. Descubre lo mejor de la cultura barcelonesa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white">{children}</body>
    </html>
  );
}
