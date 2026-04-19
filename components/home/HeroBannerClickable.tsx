"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { generateDefaultMessage } from "@/lib/whatsapp";

export default function HeroBannerClickable() {
  const whatsappLink = generateDefaultMessage();

  return (
    <section
      className="relative w-full min-h-[88vh] md:min-h-[92vh] flex items-end md:items-center overflow-hidden"
      style={{
        backgroundImage: "url('/bannersolenesite.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Gradient overlay — permite leitura do texto sem escurecer toda a foto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pb-16 pt-8 md:pb-0">
        <div className="max-w-lg">
          <p className="text-white/60 text-[10px] uppercase tracking-[0.35em] font-semibold mb-5">
            Londrina · Moda Feminina
          </p>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.06] mb-5">
            Feita pra você<br />
            <em className="font-normal not-italic opacity-90">se sentir incrível.</em>
          </h1>

          <p className="text-white/75 text-sm sm:text-base mb-9 leading-relaxed max-w-sm">
            Peças exclusivas com entrega rápida em Londrina.
            Atendimento direto pelo WhatsApp — sem complicação.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("hero_whatsapp_click", { source: "hero" })}
              className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-semibold px-7 py-4 rounded-full hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98] text-sm"
            >
              <MessageCircle size={18} />
              Falar no WhatsApp
            </a>

            <Link
              href="/catalogo"
              onClick={() => trackEvent("hero_catalog_click", { source: "hero" })}
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-7 py-4 rounded-full hover:bg-white/25 transition-all border border-white/25 text-sm"
            >
              Ver coleção
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
