"use client";

import { FormEvent, useState } from "react";
import { Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const result = (await response.json().catch(() => null)) as
                    | { error?: string }
                    | null;
                setError(result?.error || "Falha ao autenticar.");
                setLoading(false);
                return;
            }

            window.location.assign("/admin/dashboard");
        } catch {
            setError("Falha ao autenticar.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-xl mb-6">
                        <Lock size={28} className="text-brand-accent" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-brand-text">
                        Solenne Admin
                    </h1>
                    <p className="text-sm text-brand-muted mt-2">
                        Acesso restrito à administração.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 ml-1">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="admin@solenne.com"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-muted uppercase tracking-widest mb-2 ml-1">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                                />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all text-sm shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-brand-accent text-white font-bold text-sm hover:bg-brand-accent/90 transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/20 active:scale-95 mt-2"
                        >
                            {loading ? "Entrando..." : "Acessar Painel"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-brand-muted/60 mt-8 font-medium">
                    Solenne © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
