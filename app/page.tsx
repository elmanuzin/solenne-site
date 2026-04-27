import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import TrustBar from "@/components/ui/TrustBar";
import ProductGrid from "@/components/catalog/ProductGrid";
import HeroBannerClickable from "@/components/home/HeroBannerClickable";
import { categories } from "@/lib/data";
import {
  listBestSellerProducts,
  listFeaturedProducts,
  listNewArrivals,
} from "@/lib/catalog";
import { generateDefaultMessage } from "@/lib/whatsapp";

export const revalidate = 60;

// ─── Cabeçalho de seção editorial ─────────────────────
function SectionHeader({
  label,
  title,
  href,
}: {
  label?: string;
  title: string;
  href: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <div>
        {label && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-semibold mb-2">
            {label}
          </p>
        )}
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text tracking-tight">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-[0.2em]"
      >
        Ver todos
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ─── Cores editoriais por categoria ───────────────────
const categoryStyle: Record<string, { bg: string; accent: string }> = {
  conjuntos: { bg: "#F5E6E8", accent: "#8B3A52" },
  body:      { bg: "#EDE7F6", accent: "#5E35B1" },
  vestidos:  { bg: "#FFF3E0", accent: "#BF7B3A" },
  saias:     { bg: "#FCE4EC", accent: "#C2185B" },
  croppeds:  { bg: "#E8F5E9", accent: "#2E7D32" },
  shorts:    { bg: "#E3F2FD", accent: "#1565C0" },
};

export default async function Home() {
  const [destaques, novidades, maisVendidos] = await Promise.all([
    listFeaturedProducts(8),
    listNewArrivals(8),
    listBestSellerProducts(8),
  ]);

  const whatsappLink = generateDefaultMessage();

  return (
    <div>
      {/* ── Hero editorial ─────────────────────────────── */}
      <HeroBannerClickable />

      {/* ── Chips de categoria — mobile only, logo abaixo do hero ── */}
      <div className="md:hidden overflow-x-auto scrollbar-hide bg-brand-bg border-b border-brand-border/40">
        <div className="flex gap-2 px-4 py-3 w-max">
          {[
            { label: "Vestidos", href: "/catalogo?categoria=vestidos" },
            { label: "Conjuntos", href: "/catalogo?categoria=conjuntos" },
            { label: "Bodies", href: "/catalogo?categoria=body" },
            { label: "Novidades", href: "/catalogo?novidades=true" },
            { label: "Saias", href: "/catalogo?categoria=saias" },
            { label: "Croppeds", href: "/catalogo?categoria=croppeds" },
          ].map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className="inline-flex items-center whitespace-nowrap rounded-full border border-brand-border bg-white px-4 py-1.5 text-xs font-medium text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trust strip fino ───────────────────────────── */}
      <TrustBar />

      {/* ── Destaques da coleção ───────────────────────── */}
      <section className="py-12 sm:py-20 container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-semibold mb-2">
              Seleção
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text tracking-tight">
              Destaques da coleção
            </h2>
            <p className="text-sm text-brand-muted mt-1.5">
              Descubra as peças que estão conquistando todo mundo 💖
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-[0.2em]"
          >
            Ver todos
            <ArrowRight size={12} />
          </Link>
        </div>
        <ProductGrid products={destaques} />
      </section>

      {/* ── Identidade da marca ────────────────────────── */}
      <section className="py-12 sm:py-20 border-t border-brand-border/50">
        <div className="container-custom">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-semibold mb-5">
              Sobre a Solenne
            </p>
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-light text-brand-text leading-[1.35] mb-6">
              "Cada peça, escolhida<br />
              com cuidado para<br />
              a mulher real."
            </p>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-8 max-w-md">
              Somos de Londrina, como você. Sabemos que o corpo real não é de
              revista — e é exatamente por isso que cada peça da Solenne é
              pensada pra você usar de verdade: no trabalho, no happy hour,
              no rolê de sábado.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:text-brand-accent transition-colors"
            >
              Falar com a gente
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Novidades ──────────────────────────────────── */}
      <section className="py-12 sm:py-20 container-custom border-t border-brand-border/50">
        <SectionHeader label="Chegadas recentes" title="Novidades" href="/catalogo" />
        <ProductGrid products={novidades} />
      </section>

      {/* ── Categorias editoriais ──────────────────────── */}
      <section className="py-12 sm:py-20 border-t border-brand-border/50 bg-white/40">
        <div className="container-custom">
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent font-semibold mb-2">
              Explore
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text tracking-tight">
              Nossas categorias
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const style = categoryStyle[cat.slug] ?? { bg: "#F5F0E8", accent: "#555555" };
              return (
                <Link
                  key={cat.slug}
                  href={`/catalogo?categoria=${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden flex flex-col justify-end p-5 sm:p-6 aspect-square transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: style.bg }}
                >
                  {/* Hover overlay sutil */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ backgroundColor: style.accent + "18" }}
                  />
                  <p className="relative z-10 font-heading text-xl sm:text-2xl font-bold text-brand-text leading-tight mb-1.5">
                    {cat.name}
                  </p>
                  <p
                    className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.22em] flex items-center gap-1"
                    style={{ color: style.accent }}
                  >
                    Explorar
                    <ArrowRight size={10} />
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Favoritas da semana ────────────────────────── */}
      <section className="py-12 sm:py-20 container-custom border-t border-brand-border/50">
        <SectionHeader label="Esta semana" title="As favoritas da semana 💖" href="/catalogo" />
        <ProductGrid products={maisVendidos} />
      </section>

      {/* ── Clube Solenne — compacto e editorial ───────── */}
      <section className="py-12 sm:py-20 border-t border-brand-border/50 bg-white/40">
        <div className="container-custom">
          <div className="rounded-3xl bg-brand-text text-white px-8 py-12 sm:px-14 sm:py-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold mb-4">
              Programa de fidelidade
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Clube Solenne
            </h2>
            <p className="text-white/60 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Acumule selos a cada compra e troque por croppeds exclusivos.
              Indique amigas e ganhe ainda mais benefícios.
            </p>
            <Link
              href="/clube"
              className="inline-flex items-center gap-2 bg-white text-brand-text font-semibold px-7 py-3.5 rounded-full hover:bg-brand-bg transition-colors text-sm"
            >
              Conhecer o clube
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final — WhatsApp ───────────────────────── */}
      <section className="py-24 sm:py-36 bg-[#0E0E0E] text-white text-center">
        <div className="max-w-lg mx-auto px-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 font-semibold mb-5">
            Atendimento personalizado
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-[1.1]">
            Encontrou algo<br />
            que amou?
          </h2>
          <p className="text-white/50 text-sm sm:text-base mb-10 leading-relaxed">
            Fale com a gente agora. Respondemos rápido<br className="hidden sm:block" />
            e entregamos hoje em Londrina.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold px-10 py-4 rounded-full hover:bg-[#20bd5a] transition-all shadow-xl shadow-[#25D366]/15 active:scale-[0.98] text-sm sm:text-base"
          >
            <MessageCircle size={20} />
            Falar no WhatsApp
          </a>
          <p className="text-white/25 text-xs mt-6 tracking-wide">
            Atendimento rápido · Entrega no mesmo dia em Londrina
          </p>
        </div>
      </section>
    </div>
  );
}
