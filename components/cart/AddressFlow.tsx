"use client";

import { useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import type { AddressData } from "@/lib/cart";

interface Props {
    value: AddressData | null;
    onChange: (a: AddressData | null) => void;
}

type Step = "input" | "loading" | "details" | "error";

const empty: AddressData = { rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" };

export default function AddressFlow({ value, onChange }: Props) {
    const [step, setStep] = useState<Step>(value ? "details" : "input");
    const [cep, setCep] = useState(value?.cep ?? "");
    const [draft, setDraft] = useState<AddressData>(value ?? empty);
    const [error, setError] = useState("");

    async function lookupCep(rawCep: string) {
        const cleaned = rawCep.replace(/\D/g, "");
        if (cleaned.length !== 8) { setError("CEP inválido — informe 8 dígitos."); return; }
        setStep("loading");
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
            const data = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
            if (data.erro) throw new Error("CEP não encontrado");
            setDraft({ ...empty, cep: cleaned, rua: data.logradouro ?? "", bairro: data.bairro ?? "", cidade: data.localidade ?? "", estado: data.uf ?? "" });
            setStep("details");
        } catch {
            setError("CEP não encontrado. Preencha manualmente.");
            setDraft({ ...empty, cep: cleaned });
            setStep("details");
        }
    }

    async function useGeolocation() {
        if (!navigator.geolocation) { setError("Geolocalização não disponível."); return; }
        setStep("loading");
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`, {
                        headers: { "Accept-Language": "pt-BR" },
                    });
                    const data = await res.json() as { address?: { road?: string; suburb?: string; city?: string; town?: string; state?: string; postcode?: string } };
                    const addr = data.address ?? {};
                    setDraft({ ...empty, cep: (addr.postcode ?? "").replace("-", ""), rua: addr.road ?? "", bairro: addr.suburb ?? "", cidade: addr.city ?? addr.town ?? "", estado: addr.state ?? "" });
                    setStep("details");
                } catch {
                    setStep("error");
                    setError("Não foi possível identificar seu endereço.");
                }
            },
            () => { setStep("error"); setError("Permissão de localização negada."); }
        );
    }

    function save() {
        if (!draft.rua || !draft.numero) { setError("Preencha rua e número."); return; }
        onChange(draft);
        setError("");
    }

    function reset() { setStep("input"); setCep(""); setDraft(empty); onChange(null); setError(""); }

    if (step === "loading") return (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-brand-muted">
            <Loader2 size={16} className="animate-spin" /> Buscando endereço...
        </div>
    );

    if (step === "input") return (
        <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-brand-text">Endereço de entrega</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="CEP (somente números)"
                    className="flex-1 rounded-xl border border-brand-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-accent/40"
                    maxLength={8}
                />
                <button
                    type="button"
                    onClick={() => lookupCep(cep)}
                    className="px-4 py-2 rounded-xl bg-brand-text text-white text-xs font-semibold active:scale-95 transition-transform"
                >
                    Buscar
                </button>
            </div>
            <button
                type="button"
                onClick={useGeolocation}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-border py-2 text-xs text-brand-text font-medium active:scale-95 transition-transform"
            >
                <Navigation size={13} /> Usar minha localização 📍
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );

    if (step === "error") return (
        <div className="space-y-2 pt-2">
            <p className="text-xs text-red-500">{error}</p>
            <button type="button" onClick={reset} className="text-xs text-brand-accent underline">Tentar novamente</button>
        </div>
    );

    // step === "details"
    if (value) return (
        <div className="rounded-xl border border-brand-border bg-brand-bg-soft p-3 flex items-start justify-between gap-2 mt-2">
            <div className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs text-brand-text leading-snug">
                    <p className="font-semibold">{value.rua}, {value.numero}{value.complemento ? ` - ${value.complemento}` : ""}</p>
                    <p className="text-brand-muted">{value.bairro} · {value.cidade}/{value.estado}</p>
                </div>
            </div>
            <button type="button" onClick={reset} className="text-[10px] text-brand-muted underline whitespace-nowrap">Alterar</button>
        </div>
    );

    return (
        <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-brand-text">Confirme o endereço</p>
            <input value={draft.rua} onChange={(e) => setDraft(d => ({ ...d, rua: e.target.value }))} placeholder="Rua / Avenida" className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-accent/40" />
            <div className="flex gap-2">
                <input value={draft.numero} onChange={(e) => setDraft(d => ({ ...d, numero: e.target.value }))} placeholder="Número *" className="w-24 rounded-xl border border-brand-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-accent/40" />
                <input value={draft.complemento} onChange={(e) => setDraft(d => ({ ...d, complemento: e.target.value }))} placeholder="Complemento" className="flex-1 rounded-xl border border-brand-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-accent/40" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="button" onClick={save} className="w-full rounded-xl bg-brand-text text-white py-2.5 text-sm font-semibold active:scale-95 transition-transform">
                Confirmar endereço
            </button>
        </div>
    );
}
