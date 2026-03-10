"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        try {
            const result = (await loginAction(formData)) as { error?: string; success?: boolean };

            if (result?.error) {
                setError(result.error);
                setLoading(false);
            } else if (result?.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.assign("/clube-solenne/dashboard");
                }, 800);
            }
        } catch {
            setLoading(false);
            setError("Ocorreu um erro ao tentar entrar. Tente novamente.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg px-6 py-12 relative overflow-hidden">
            {/* Success Animation */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="relative w-64 h-64">
                            <Image
                                src="/beijo-animado.gif"
                                alt="Sucesso"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <span className="kiss-emoji block mx-auto text-center" style={{ marginBottom: '16px' }}>💋</span>
                    <h1 className="font-heading text-4xl font-bold text-brand-text">
                        Clube Solenne
                    </h1>
                    <p className="text-sm text-brand-muted/70 mt-3 max-w-[280px] mx-auto leading-relaxed">
                        Seu acesso é enviado automaticamente após sua primeira compra ou indicação confirmada.
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-white/60">
                    <div className="mb-8">
                        <h2 className="font-heading text-2xl font-bold text-brand-text">
                            Entrar
                        </h2>
                        <p className="text-sm text-brand-muted mt-2">
                            Acesse seu cartão digital de fidelidade.
                        </p>
                    </div>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            await handleSubmit(formData);
                        }}
                        className="space-y-5"
                    >
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-brand-border bg-white/50 focus:bg-white text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all shadow-sm"
                            />
                        </div>

                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-accent transition-colors" />
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="Sua senha"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-brand-border bg-white/50 focus:bg-white text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all shadow-sm"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || showSuccess}
                            className="w-full py-4 rounded-2xl bg-brand-accent text-white font-bold tracking-wide hover:bg-brand-accent-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/30 flex items-center justify-center gap-2 group"
                        >
                            {loading && !showSuccess && <Loader2 size={18} className="animate-spin" />}
                            {(showSuccess || !loading) && (
                                <>
                                    {showSuccess ? "Entrando..." : "Acessar Clube"}
                                    {!showSuccess && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center pt-6 border-t border-brand-border/30">
                        <p className="text-xs text-brand-muted font-medium italic">
                            Problemas com o acesso? Fale conosco no WhatsApp.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Link href="/" className="text-xs text-brand-muted/60 hover:text-brand-accent transition-colors">
                        ← Voltar para a loja
                    </Link>
                </div>
            </div>
        </div>
    );
}
