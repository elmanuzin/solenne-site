"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title, text, url }); } catch {}
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {}
        }
    }

    return (
        <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent transition-all active:scale-95"
            aria-label="Compartilhar produto"
        >
            {copied
                ? <Check size={16} className="text-emerald-500" />
                : <Share2 size={16} />
            }
        </button>
    );
}
