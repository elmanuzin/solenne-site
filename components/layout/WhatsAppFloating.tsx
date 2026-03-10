"use client";

import { MessageCircle } from "lucide-react";
import { generateDefaultMessage } from "@/lib/whatsapp";

export default function WhatsAppFloating() {
    return (
        <a
            href={generateDefaultMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label="Falar pelo WhatsApp"
        >
            <MessageCircle size={26} fill="white" stroke="white" />
        </a>
    );
}
