"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function WhatsAppFloating() {
    const pathname = usePathname();
    const shouldHide = pathname.startsWith("/admin");
    if (shouldHide) {
        return null;
    }

    const whatsappLink = generateDefaultMessage();

    return (
        <>
            <div className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-brand-border/60 bg-brand-bg/95 px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                        trackEvent("whatsapp_click", {
                            source: "mobile_sticky_cta",
                        })
                    }
                    className="w-full inline-flex items-center justify-center rounded-full bg-[#25D366] text-white py-3.5 text-sm font-semibold shadow-lg"
                    aria-label="Comprar no WhatsApp"
                >
                    Comprar no WhatsApp
                </a>
            </div>

            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                    trackEvent("whatsapp_click", {
                        source: "floating_whatsapp",
                    })
                }
                className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                aria-label="Falar pelo WhatsApp"
            >
                <MessageCircle size={26} fill="white" stroke="white" />
            </a>
        </>
    );
}
