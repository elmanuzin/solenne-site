"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { recalculatePopularProductsAction } from "@/lib/admin-actions";

export default function AdminAnalyticsPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleRecalculate() {
        setError("");
        setSuccess("");

        startTransition(async () => {
            const result = await recalculatePopularProductsAction();
            if (result?.error) {
                setError(result.error);
                return;
            }

            const updated = result?.updated ?? 0;
            setSuccess(
                updated > 0
                    ? `${updated} produto(s) marcado(s) como mais vendido.`
                    : "Nenhum produto atingiu o limite de visualizações nesta semana."
            );
        });
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/dashboard"
                    className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors shadow-sm"
                >
                    <ArrowLeft size={16} className="text-brand-muted" />
                </Link>
                <div>
                    <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">
                        Administração
                    </p>
                    <h1 className="font-heading text-3xl font-bold text-brand-text">
                        Analytics
                    </h1>
                </div>
            </div>

            {error ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
                    {success}
                </div>
            ) : null}

            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <BarChart3 size={18} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-brand-text">Produtos populares</p>
                        <p className="text-sm text-brand-muted">
                            Marca automaticamente os itens com mais de 20 visualizações
                            nos últimos 7 dias.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRecalculate}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                >
                    {isPending ? "Recalculando..." : "Recalcular produtos populares"}
                </button>
            </div>
        </div>
    );
}
