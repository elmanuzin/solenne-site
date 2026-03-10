import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Solenne — Elegância que marca presença",
  description:
    "Moda feminina sofisticada em Londrina. Vestidos, bodies, saias, croppeds e conjuntos exclusivos. Entrega via Uber.",
  keywords: [
    "moda feminina",
    "Solenne",
    "Londrina",
    "vestidos",
    "body",
    "saias",
    "croppeds",
    "conjuntos",
    "elegância",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-brand-bg text-brand-text`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFloating />
      </body>
    </html>
  );
}
