import { Truck, RefreshCw, MessageCircle } from "lucide-react";

const items = [
    { icon: Truck, label: "Entrega via Uber em Londrina" },
    { icon: RefreshCw, label: "Troca fácil pelo WhatsApp" },
    { icon: MessageCircle, label: "Atendimento rápido e personalizado" },
];

export default function TrustBar() {
    return (
        <div className="bg-brand-text text-white/75">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-3">
                <div className="flex items-center justify-center md:justify-between flex-wrap gap-x-10 gap-y-2">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-2 text-xs"
                        >
                            <item.icon size={13} strokeWidth={1.5} className="text-white/40 shrink-0" />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
