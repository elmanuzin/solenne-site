import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import TrustBar from "@/components/ui/TrustBar";
import ProductGrid from "@/components/catalog/ProductGrid";
import { categories } from "@/lib/data";
import { listFeaturedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await listFeaturedProducts(8);

  return (
    <div className="pb-20">
      <section
        className="w-full min-h-[60vh] md:min-h-[80vh] relative flex items-center justify-center overflow-hidden bg-contain md:bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/bannersolenesite.jpeg')",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute bottom-8 md:bottom-[110px] left-1/2 md:left-[52%] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:max-w-none sm:w-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto text-center bg-black text-white px-6 py-3 rounded-full"
          >
            Ver coleção
          </Link>
          <Link
            href="/contato"
            className="w-full sm:w-auto text-center border border-gray-400 px-6 py-3 rounded-full"
          >
            Falar com a Solenne
          </Link>
        </div>
      </section>

      <TrustBar />

      <section className="container-custom py-14 sm:py-16">
        <div className="rounded-3xl border border-brand-border bg-white/60 p-6 sm:p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brand-accent font-semibold mb-2">
                Clube Solenne
              </p>
              <h2 className="text-heading-2">Benefícios exclusivos</h2>
            </div>
            <Link
              href="/clube"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
            >
              Ver página do clube
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <Link
              href="/clube"
              className="rounded-2xl border border-brand-border bg-brand-bg-soft px-5 py-6 sm:px-6 sm:py-7 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="font-heading text-2xl text-brand-text mb-2">Cartão Fidelidade</h3>
              <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                Acumule benefícios a cada compra na Solenne.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-text text-white px-5 py-3 text-sm font-semibold">
                Ver cartão fidelidade
                <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/clube"
              className="rounded-2xl border border-brand-border bg-brand-bg-soft px-5 py-6 sm:px-6 sm:py-7 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="font-heading text-2xl text-brand-text mb-2">Cartão Indicação</h3>
              <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                Indique amigas e ganhe vantagens nas próximas compras.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-text text-white px-5 py-3 text-sm font-semibold">
                Ver cartão indicação
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-accent font-semibold mb-2">
              Destaques da Loja
            </p>
            <h2 className="text-heading-2">Peças mais desejadas</h2>
            <p className="text-sm text-brand-muted mt-2">
              Seleção especial da Solenne para você comprar pelo WhatsApp.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Ver catálogo completo
            <ArrowRight size={16} />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      <section className="container-custom pb-20">
        <div className="rounded-3xl border border-brand-border bg-white/70 p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-4 text-brand-accent">
            <Sparkles size={18} />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">Categorias</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/catalogo?categoria=${category.slug}`}
                className="px-4 py-3 rounded-2xl border border-brand-border bg-brand-bg-soft text-center text-sm font-medium text-brand-text hover:border-brand-accent/40 hover:text-brand-accent transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing px-4 bg-brand-accent text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Faça parte do Clube Solenne <span className="kiss-emoji">💋</span>
          </h2>
          <p className="text-white/85 text-sm md:text-base mb-8 leading-relaxed">
            Acumule selos em cada compra e troque por brindes exclusivos.
          </p>
          <Link
            href="/clube"
            className="inline-flex items-center gap-2 bg-white text-brand-accent px-8 py-3 rounded-full font-medium hover:bg-brand-bg transition-colors shadow-lg shadow-black/10"
          >
            Entrar no Clube
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
