import { MapPin, MessageCircle, Clock, Instagram } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contato — Solenne",
    description:
        "Entre em contato com a Solenne. Atendimento pelo WhatsApp em Londrina — PR.",
};

export default function ContatoPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 md:px-10 py-12 sm:py-20">
            <div className="text-center mb-12">
                <MessageCircle size={36} className="mx-auto text-brand-accent mb-4" />
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-brand-text">
                    Contato
                </h1>
                <p className="text-sm text-brand-muted mt-3">
                    Estamos aqui para ajudar você.
                </p>
            </div>

            <div className="space-y-6 mb-12">
                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <MessageCircle
                        size={22}
                        className="text-brand-accent shrink-0 mt-0.5"
                    />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            WhatsApp
                        </h3>
                        <p className="text-sm text-brand-muted">
                            Principal canal de atendimento. Resposta rápida e personalizada.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <Instagram
                        size={22}
                        className="text-brand-accent shrink-0 mt-0.5"
                    />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Instagram
                        </h3>
                        <p className="text-sm text-brand-muted">
                            Siga @use_solenne_ para novidades, lançamentos e bastidores da marca.
                        </p>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <MapPin size={22} className="text-brand-accent shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Localização
                        </h3>
                        <p className="text-sm text-brand-muted">
                            Londrina — PR, Brasil
                        </p>
                    </div>
                </div>

                <div className="bg-brand-card rounded-xl p-6 border border-brand-border flex gap-4">
                    <Clock size={22} className="text-brand-accent shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-heading text-lg font-semibold mb-1">
                            Horário de Atendimento
                        </h3>
                        <p className="text-sm text-brand-muted">
                            Atendimento 24h por dia.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <a
                    href="https://wa.me/5543998804481"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
                >
                    <MessageCircle size={18} />
                    Falar pelo WhatsApp
                </a>
            </div>
        </div>
    );
}
