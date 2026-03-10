import { Truck, Clock, MapPin, MessageCircle } from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Entrega — Solenne",
    description:
        "Entrega via Uber em Londrina. Valor calculado pelo WhatsApp e confirmado antes do envio.",
};

export default function EntregaPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-12 sm:py-20">
            <div className="text-center mb-12">
                <Truck size={36} className="mx-auto text-brand-accent mb-4" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text">
                    Entrega
                </h1>
                <p className="text-sm text-brand-muted mt-3">
                    Rápida, segura e com acompanhamento em tempo real.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <MapPin size={22} className="text-brand-accent shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Entrega via Uber em Londrina
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Todas as entregas são realizadas via Uber Flash na região de
                            Londrina — PR. Rápido e rastreável.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <MessageCircle
                        size={22}
                        className="text-brand-accent shrink-0 mt-0.5"
                    />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Valor calculado via WhatsApp
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            O valor do frete é calculado em tempo real com base no seu
                            endereço. Informamos o valor antes de confirmar o envio.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <Clock size={22} className="text-brand-accent shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Prazo de envio
                        </h3>
                        <p className="text-sm text-brand-muted leading-relaxed">
                            Após confirmação do pagamento, seu pedido é enviado no mesmo dia
                            ou no dia seguinte útil.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <a
                    href={generateDefaultMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-accent text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-brand-accent-hover transition-colors"
                >
                    <MessageCircle size={18} />
                    Calcular meu frete
                </a>
            </div>
        </div>
    );
}
