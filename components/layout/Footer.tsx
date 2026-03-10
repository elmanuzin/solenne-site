import Link from "next/link";
import { Instagram, Heart } from "lucide-react";
import { categories } from "@/lib/data";

export default function Footer() {
    return (
        <footer className="bg-brand-text text-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <h3 className="font-heading text-2xl font-bold text-white mb-3">
                            Solenne <span className="kiss-emoji" style={{ fontSize: '20px' }}>💋</span>
                        </h3>
                        <p className="text-sm leading-relaxed text-white/60">
                            Elegância que marca presença. Moda feminina sofisticada para
                            mulheres que sabem o que querem.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 font-medium">
                            Categorias
                        </h4>
                        <ul className="space-y-2.5">
                            {categories.map((cat) => (
                                <li key={cat.slug}>
                                    <Link
                                        href={`/catalogo?categoria=${cat.slug}`}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 font-medium">
                            Informações
                        </h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link
                                    href="/como-comprar"
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    Como Comprar
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/entrega"
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    Entrega
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/trocas"
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    Trocas e Devoluções
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    Perguntas Frequentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contato"
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    Contato
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social & Club */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 font-medium">
                            Clube Solenne
                        </h4>
                        <p className="text-sm text-white/60 mb-4">
                            Complete 10 selos e ganhe um cropped exclusivo.
                        </p>
                        <Link
                            href="/clube"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:text-white transition-colors"
                        >
                            <Heart size={14} fill="currentColor" />
                            Saiba mais
                        </Link>
                        <div className="flex items-center gap-4 mt-6">
                            <a
                                href="https://instagram.com/solenne"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/50 hover:text-white transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} Solenne. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-white/40">
                        Londrina — PR
                    </p>
                </div>
            </div>
        </footer>
    );
}
