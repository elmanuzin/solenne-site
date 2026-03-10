"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function HeroBannerClickable() {
  return (
    <section
      className="group relative w-full min-h-[50vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-contain md:bg-cover bg-no-repeat bg-center transition-all duration-300 hover:brightness-[1.03]"
      style={{
        backgroundImage: "url('/bannersolenesite.jpeg')",
        backgroundPosition: "center",
      }}
    >
      <Link
        href="/catalogo"
        aria-label="Ver coleção Solenne"
        onClick={() => trackEvent("banner_click", { source: "home_hero" })}
        className="absolute inset-0 z-10 block cursor-pointer"
      />

      <div className="absolute left-[48%] top-[64%] -translate-x-1/2 z-20 pointer-events-none">
        <span className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-white text-sm font-medium shadow-lg transition">
          Ver coleção
        </span>
      </div>
    </section>
  );
}
