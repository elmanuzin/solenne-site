import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import ClubPopup from "@/components/ui/ClubPopup";
import CartButton from "@/components/cart/CartButton";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FFF6DA",
};

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
        className={`${playfair.variable} ${inter.variable} antialiased bg-brand-bg text-brand-text overflow-x-hidden`}
      >
        <CartProvider>
          <Header />
          <main className="min-h-screen overflow-x-hidden pb-mobile-nav md:pb-0">{children}</main>
          <Footer />
          <WhatsAppFloating />
          <CartButton />
          <CartDrawer />
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
          <Suspense fallback={null}>
            <ClubPopup />
          </Suspense>
        </CartProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');` }} />
          </>
        )}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script dangerouslySetInnerHTML={{ __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");` }} />
        )}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');` }} />
        )}
      </body>
    </html>
  );
}
