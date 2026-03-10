"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
    {
        question: "Como faço para comprar?",
        answer:
            'Escolha o produto desejado no catálogo, selecione o tamanho e clique em "Finalizar pelo WhatsApp". A mensagem já vai preenchida com todos os detalhes.',
    },
    {
        question: "Qual a forma de pagamento?",
        answer:
            "Aceitamos Pix, transferência bancária e cartão (consulte condições pelo WhatsApp).",
    },
    {
        question: "Como funciona a entrega?",
        answer:
            "Realizamos entregas via Uber Flash na região de Londrina — PR. O valor do frete é calculado na hora pelo WhatsApp.",
    },
    {
        question: "Posso trocar minha peça?",
        answer:
            "Sim! Você pode solicitar a troca em até 7 dias após o recebimento, desde que o produto esteja sem uso e com etiqueta.",
    },
    {
        question: "O que é o Clube Solenne?",
        answer:
            "É nosso programa de fidelidade. A cada compra finalizada, você ganha 1 selo no seu cartão. Complete 10 selos e ganhe um cropped exclusivo!",
    },
    {
        question: "Vocês enviam para fora de Londrina?",
        answer:
            "No momento, nossas entregas são exclusivas para a região de Londrina — PR. Para outras localidades, entre em contato pelo WhatsApp para verificar disponibilidade.",
    },
    {
        question: "Os tamanhos são padrão?",
        answer:
            "Sim, trabalhamos com tamanhos P, M, G e GG. Caso tenha dúvidas sobre medidas, envie uma mensagem pelo WhatsApp e ajudamos você a escolher.",
    },
];

function FAQItem({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-brand-card rounded-xl border border-brand-border overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <span className="font-heading text-base font-semibold text-brand-text pr-4">
                    {question}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-brand-accent shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>
            {open && (
                <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-brand-muted leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-12 sm:py-20">
            <div className="text-center mb-12">
                <HelpCircle size={36} className="mx-auto text-brand-accent mb-4" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text">
                    Perguntas Frequentes
                </h1>
                <p className="text-sm text-brand-muted mt-3">
                    Tire suas dúvidas sobre a Solenne.
                </p>
            </div>

            <div className="space-y-3">
                {faqs.map((faq) => (
                    <FAQItem
                        key={faq.question}
                        question={faq.question}
                        answer={faq.answer}
                    />
                ))}
            </div>
        </div>
    );
}
