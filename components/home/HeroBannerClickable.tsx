"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { generateDefaultMessage } from "@/lib/whatsapp";

export default function HeroBannerClickable() {
  const whatsappLink = generateDefaultMessage();

  return (
    <section className="relative w-full min-h-[88vh] md:min-h-[92vh] flex items-end md:items-center overflow-hidden">
      {/* Imagem com focal point responsivo — mobile ancora no topo, desktop centraliza */}
      <Image
        src="/bannersolenesite.jpeg"
        alt="Solenne — Moda Feminina em Londrina"
        fill
        priority
        className="object-cover object-top md:object-center"
        sizes="100vw"
      />

      {/* Overlay — gradiente mais intenso na base para legibilidade mobile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-black/5 pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10 pb-12 pt-8 md:pb-0">
        <div className="max-w-[290px] sm:max-w-lg">
          <p className="text-white/55 text-[9px] sm:text-[10px] uppercase tracking-[0.35em] font-semibold mb-3 sm:mb-5">
            Londrina · Moda Feminina
          </p>

          <h1 className="font-heading text-[2rem] sm:text-5xl md:text-6xl font-bold text-white leading-[1.06] mb-3 sm:mb-5">
            Feita pra você<br />
            <em className="font-normal not-italic opacity-90">se sentir incrível.</em>
          </h1>

          <p className="text-white/70 text-xs sm:text-base mb-6 sm:mb-9 leading-relaxed max-w-[240px] sm:max-w-sm">
            Peças exclusivas com entrega rápida em Londrina.
            Atendimento direto pelo WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("hero_whatsapp_click", { source: "hero" })}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98] text-sm"
            >
              <MessageCircle size={17} />
              Falar no WhatsApp
            </a>

            <Link
              href="/catalogo"
              onClick={() => trackEvent("hero_catalog_click", { source: "hero" })}
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-medium px-6 py-3.5 rounded-full hover:bg-white/25 transition-all border border-white/25 text-sm"
            >
              Ver coleção
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
