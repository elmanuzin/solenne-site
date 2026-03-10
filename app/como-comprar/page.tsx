import {
    MessageCircle,
    ShoppingBag,
    CreditCard,
    CheckCircle,
} from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Como Comprar — Solenne",
    description:
        "Aprenda como comprar na Solenne. Escolha, confirme pelo WhatsApp e receba em casa.",
};

export default function ComoComprarPage() {
    const steps = [
        {
            icon: ShoppingBag,
            title: "1. Escolha sua peça",
            text: "Navegue pelo catálogo e encontre a peça perfeita para você. Selecione o tamanho desejado.",
        },
        {
            icon: MessageCircle,
            title: "2. Finalize pelo WhatsApp",
            text: 'Clique em "Finalizar pelo WhatsApp" na página do produto. A mensagem já vai preenchida com os detalhes do pedido.',
        },
        {
            icon: CreditCard,
            title: "3. Combine o pagamento",
            text: "No WhatsApp, combinamos a forma de pagamento e calculamos o frete via Uber para Londrina.",
        },
        {
            icon: CheckCircle,
            title: "4. Receba em casa",
            text: "Confirmado o pagamento, enviamos sua peça via Uber no mesmo dia ou no dia seguinte.",
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center mb-12">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text">
                    Como Comprar
                </h1>
                <p className="text-sm text-brand-muted mt-3">
                    Compre de forma simples e segura pelo WhatsApp.
                </p>
            </div>

            <div className="space-y-8">
                {steps.map((step) => (
                    <div
                        key={step.title}
                        className="flex gap-5 bg-brand-card rounded-xl p-6 border border-brand-border"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
                            <step.icon size={22} className="text-brand-accent" />
                        </div>
                        <div>
                            <h3 className="font-heading text-lg font-semibold mb-1">
                                {step.title}
                            </h3>
                            <p className="text-sm text-brand-muted leading-relaxed">
                                {step.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-12">
                <a
                    href={generateDefaultMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    <MessageCircle size={18} />
                    Falar com a Solenne
                </a>
            </div>
        </div>
    );
}
