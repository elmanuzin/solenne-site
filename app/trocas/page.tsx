import { RefreshCw, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trocas e Devoluções — Solenne",
    description:
        "Política de trocas e devoluções da Solenne. Satisfação garantida.",
};

export default function TrocasPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center mb-12">
                <RefreshCw size={36} className="mx-auto text-brand-accent mb-4" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text">
                    Trocas e Devoluções
                </h1>
                <p className="text-sm text-brand-muted mt-3">
                    Sua satisfação é nossa prioridade.
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-brand-card rounded-xl p-6 border border-brand-border">
                    <div className="flex items-start gap-4">
                        <CheckCircle size={22} className="text-brand-accent shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-heading text-lg font-semibold mb-1">
                                Quando posso trocar?
                            </h3>
                            <p className="text-sm text-brand-muted leading-relaxed">
                                Você pode solicitar a troca em até 7 dias após o recebimento,
                                desde que o produto esteja em perfeitas condições, sem uso,
                                com etiqueta original.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border">
                    <div className="flex items-start gap-4">
                        <RefreshCw size={22} className="text-brand-accent shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-heading text-lg font-semibold mb-1">
                                Como solicitar?
                            </h3>
                            <p className="text-sm text-brand-muted leading-relaxed">
                                Entre em contato pelo WhatsApp informando o produto, motivo da
                                troca e envie fotos do estado atual da peça.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border">
                    <div className="flex items-start gap-4">
                        <AlertCircle size={22} className="text-brand-accent shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-heading text-lg font-semibold mb-1">
                                Importante
                            </h3>
                            <p className="text-sm text-brand-muted leading-relaxed">
                                Peças em promoção ou personalizadas podem não ser elegíveis
                                para troca. Consulte as condições específicas pelo WhatsApp.
                            </p>
                        </div>
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
                    Solicitar troca
                </a>
            </div>
        </div>
    );
}
