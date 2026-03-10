import { Truck, RefreshCw, MessageCircle } from "lucide-react";

export default function TrustBar() {
    const items = [
        {
            icon: Truck,
            title: "Entrega Rápida",
            desc: "Uber Flash em Londrina",
        },
        {
            icon: RefreshCw,
            title: "Troca Fácil",
            desc: "Atendimento para trocas",
        },
        {
            icon: MessageCircle,
            title: "Atendimento Direto",
            desc: "Suporte via WhatsApp",
        },
    ];

    return (
        <section className="py-14 sm:py-16 bg-white/45">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {items.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl bg-brand-bg-soft border border-brand-border/60 px-7 py-8 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-5 text-brand-accent shadow-[0_8px_20px_rgba(198,58,58,0.10)]">
                                <item.icon size={24} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-brand-text mb-2">
                                {item.title}
                            </h3>
                            <p className="text-base text-brand-muted leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
