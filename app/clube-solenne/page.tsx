import { Gift, ArrowRight, MessageCircle, ShoppingBag, KeyRound } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import PhysicalCardPreview from "@/components/clube/PhysicalCardPreview";

export const metadata: Metadata = {
    title: "Clube Solenne — Programa de Fidelidade",
    description: "Complete 10 selos e ganhe um cropped exclusivo Solenne. Seu estilo recompensado.",
};

export default async function ClubeSolennePage() {
    const session = await getCurrentSession();
    if (session) {
        redirect("/clube-solenne/dashboard");
    }

    return (
        <div className="container-custom section-spacing">
            {/* Header */}
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <span className="kiss-emoji block mb-6 text-center">💋</span>
                <h1 className="text-heading-1 mb-4 text-balance">
                    Clube Solenne
                </h1>
                <p className="text-body text-xl max-w-lg mx-auto text-balance font-medium">
                    Complete 10 selos e ganhe um cropped exclusivo Solenne. Seu estilo recompensado.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                    <Link
                        href="/clube-solenne/login"
                        className="btn-primary w-full sm:w-auto px-10 py-4 text-lg"
                    >
                        Acessar meu Clube <span className="kiss-emoji" style={{ fontSize: '20px' }}>💋</span>
                    </Link>
                    <a
                        href="https://wa.me/5543988044801?text=Olá,%20fiz%20minha%20primeira%20compra%20e%20gostaria%20de%20confirmar%20meu%20acesso%20ao%20Clube%20Solenne%20💋"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full sm:w-auto px-10 py-4 text-lg"
                    >
                        <MessageCircle size={20} />
                        Falar no WhatsApp
                    </a>
                </div>
            </div>

            {/* Loyalty Visual - NEW Physical Card Style */}
            <div className="mb-24 scale-90 sm:scale-100 origin-center transition-transform">
                <PhysicalCardPreview />
            </div>

            {/* How it works */}
            <div className="card-base p-8 sm:p-14 mb-24 bg-white/50 border border-brand-border/40 backdrop-blur-sm">
                <h2 className="text-heading-2 text-center mb-16">
                    Como funciona?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Step 1 */}
                    <div className="text-center group">
                        <div className="w-16 h-16 rounded-full bg-[rgba(198,58,58,0.08)] border border-[rgba(198,58,58,0.18)] flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110">
                            <ShoppingBag size={24} stroke="#C63A3A" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-heading-3 mb-4 italic">
                            1. Compre ou Indique
                        </h3>
                        <p className="text-brand-text/70 text-sm leading-relaxed max-w-[240px] mx-auto">
                            A cada compra finalizada ou indicação confirmada, você recebe 1 selo no seu perfil.
                        </p>
                    </div>
                    {/* Step 2 */}
                    <div className="text-center group">
                        <div className="w-16 h-16 rounded-full bg-[rgba(198,58,58,0.08)] border border-[rgba(198,58,58,0.18)] flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110">
                            <KeyRound size={24} stroke="#C63A3A" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-heading-3 mb-4 italic">
                            2. Acesso Automático
                        </h3>
                        <p className="text-brand-text/70 text-sm leading-relaxed max-w-[240px] mx-auto">
                            Seu login do Clube Solenne é enviado automaticamente após sua primeira compra ou indicação validada.
                        </p>
                    </div>
                    {/* Step 3 */}
                    <div className="text-center group">
                        <div className="w-16 h-16 rounded-full bg-[rgba(198,58,58,0.08)] border border-[rgba(198,58,58,0.18)] flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110">
                            <Gift size={24} stroke="#C63A3A" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-heading-3 mb-4 italic">
                            3. Complete 10 Selos
                        </h3>
                        <p className="text-brand-text/70 text-sm leading-relaxed max-w-[240px] mx-auto">
                            Ao completar 10 selos, você desbloqueia um cropped exclusivo para escolher no catálogo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="text-center py-10 border-t border-brand-border/30">
                <p className="text-brand-muted mb-8 italic text-lg">
                    Inicie sua coleção hoje mesmo e faça parte do Clube.
                </p>
                <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-3 text-brand-accent font-bold text-lg hover:underline transition-all"
                >
                    Ir ao Catálogo <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
