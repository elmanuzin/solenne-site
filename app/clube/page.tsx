import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import LoyaltyCard from "@/components/clube/LoyaltyCard";
import {
    generateLoyaltyInquiryLink,
    generateReferralInquiryLink,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
    title: "Clube Solenne",
    description: "Benefícios exclusivos para clientes da Solenne.",
};

function ClubCard({
    id,
    title,
    description,
    buttonLabel,
    buttonHref,
    cardTitle,
}: {
    id: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonHref: string;
    cardTitle: string;
}) {
    return (
        <article
            id={id}
            className="rounded-3xl border border-brand-border/70 bg-white/55 p-6 sm:p-8 shadow-sm"
        >
            <h2 className="font-heading text-3xl sm:text-4xl text-brand-text mb-2">
                {title}
            </h2>
            <p className="text-base text-brand-muted leading-relaxed mb-6">{description}</p>

            <a
                href={buttonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-text text-white px-6 py-3.5 text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity"
            >
                {buttonLabel}
                <ArrowRight size={16} />
            </a>

            <div className="mt-8 w-full [&>div]:max-w-none [&>div]:aspect-auto">
                <LoyaltyCard stamps={0} title={cardTitle} />
            </div>
        </article>
    );
}

export default function ClubePage() {
    return (
        <div className="container-custom section-spacing">
            <header className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
                <p className="text-xs uppercase tracking-[0.22em] text-brand-accent font-semibold mb-3">
                    Clube Solenne
                </p>
                <h1 className="text-heading-1 mb-4">Clube Solenne</h1>
                <p className="text-body text-lg">
                    Benefícios exclusivos para clientes da Solenne.
                </p>
            </header>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                <ClubCard
                    id="cartao-fidelidade"
                    title="Cartão Fidelidade"
                    description="Acumule benefícios a cada compra na Solenne."
                    buttonLabel="Consultar meus selos"
                    buttonHref={generateLoyaltyInquiryLink()}
                    cardTitle="FIDELIDADE SOLENNE"
                />

                <ClubCard
                    id="cartao-indicacao"
                    title="Cartão Indicação"
                    description="Indique amigas e ganhe vantagens nas próximas compras."
                    buttonLabel="Consultar indicação"
                    buttonHref={generateReferralInquiryLink()}
                    cardTitle="INDICAÇÃO SOLENNE"
                />
            </section>
        </div>
    );
}
