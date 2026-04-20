"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function WhatsAppFloating() {
    const pathname = usePathname();
    if (pathname.startsWith("/admin")) return null;

    const whatsappLink = generateDefaultMessage();

    return (
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_click", { source: "floating_whatsapp" })}
            className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label="Falar pelo WhatsApp"
        >
            <MessageCircle size={26} fill="white" stroke="white" />
        </a>
    );
}
