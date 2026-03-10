"use client";

import React, { useState } from "react";
import {
    Plus,
    Minus,
    RotateCcw,
    ArrowLeft,
    Search,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
} from "lucide-react";
import {
    addStampAction,
    removeStampAction,
    resetStampsAction,
} from "@/lib/admin-actions";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

interface Customer {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    stamps: number;
    referralStamps: number;
    ordersCount: number;
    created_at: string;
}

export default function ClientesClient({
    initialCustomers,
}: {
    initialCustomers: Customer[];
}) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "remove" | "reset";
        cardType: "fidelidade" | "indicacao";
        customerId: string | null;
    }>({ isOpen: false, type: "remove", cardType: "fidelidade", customerId: null });
    const [isMutating, setIsMutating] = useState(false);

    const filtered = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    async function handleAction(id: string, type: "add" | "remove" | "reset", cardType: "fidelidade" | "indicacao") {
        if (isMutating) return;

        const previousCustomers = customers;
        setActionError("");
        setCustomers((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;

                if (type === "add") {
                    return cardType === "fidelidade"
                        ? { ...c, stamps: Math.min(10, c.stamps + 1) }
                        : { ...c, referralStamps: Math.min(10, c.referralStamps + 1) };
                } else if (type === "remove") {
                    return cardType === "fidelidade"
                        ? { ...c, stamps: Math.max(0, c.stamps - 1) }
                        : { ...c, referralStamps: Math.max(0, c.referralStamps - 1) };
                } else {
                    return cardType === "fidelidade"
                        ? { ...c, stamps: 0 }
                        : { ...c, referralStamps: 0 };
                }
            })
        );

        setIsMutating(true);
        try {
            const result =
                type === "add"
                    ? await addStampAction(id, cardType)
                    : type === "remove"
                        ? await removeStampAction(id, cardType)
                        : await resetStampsAction(id, cardType);

            if (result?.error) {
                setCustomers(previousCustomers);
                setActionError(result.error);
            }
        } catch {
            setCustomers(previousCustomers);
            setActionError("Não foi possível atualizar os selos.");
        } finally {
            setIsMutating(false);
        }
    }

    function openConfirm(type: "remove" | "reset", cardType: "fidelidade" | "indicacao", id: string) {
        setConfirmModal({ isOpen: true, type, cardType, customerId: id });
    }

    async function handleConfirmAction() {
        const { type, cardType, customerId } = confirmModal;
        if (!customerId) return;
        await handleAction(customerId, type, cardType);
        setConfirmModal({ ...confirmModal, isOpen: false });
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
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
                        Clientes & Fidelidade
                    </h1>
                </div>
            </div>

            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 relative">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                    />
                    <input
                        type="text"
                        placeholder="Buscar cliente por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all shadow-sm font-medium"
                    />
                </div>
                <div className="bg-white border border-brand-border rounded-2xl px-6 py-3 shadow-sm flex items-center justify-between">
                    <span className="text-xs text-brand-muted uppercase tracking-widest font-bold">Total Clientes</span>
                    <span className="text-xl font-bold text-brand-text">
                        {filtered.length}
                    </span>
                </div>
            </div>

            {actionError ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {actionError}
                </div>
            ) : null}

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/30">
                            <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Cliente</th>
                            <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold text-center">Progresso Fidelidade</th>
                            <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold text-center">Pedidos</th>
                            <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold text-center">Ações</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((customer) => (
                            <React.Fragment key={customer.id}>
                                <tr
                                    className="border-b border-brand-border last:border-0 hover:bg-brand-bg/10 transition-colors"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
                                                <span className="text-base font-black text-brand-accent">
                                                    {customer.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-brand-text">
                                                    {customer.name}
                                                </p>
                                                <p className="text-xs text-brand-muted font-medium">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-4">
                                            {/* Fidelidade */}
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase text-brand-muted/40 w-16 text-right">Fidelidade</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                            <div key={i} className={clsx("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", i < customer.stamps ? "bg-brand-accent/5" : "border border-dashed border-brand-muted/20")}>
                                                                {i < customer.stamps ? <span className="kiss-emoji" style={{ fontSize: '18px' }}>💋</span> : ""}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 w-20">
                                                        <button
                                                            onClick={() => openConfirm("remove", "fidelidade", customer.id)}
                                                            className="p-1 hover:text-red-500 transition-colors disabled:opacity-20"
                                                            disabled={isMutating || customer.stamps === 0}
                                                        ><Minus size={12} /></button>
                                                        <button
                                                            onClick={() => handleAction(customer.id, "add", "fidelidade")}
                                                            className="p-1 hover:text-emerald-500 transition-colors disabled:opacity-20"
                                                            disabled={isMutating || customer.stamps >= 10}
                                                        ><Plus size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Indicação */}
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase text-brand-muted/40 w-16 text-right">Indicação</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                            <div key={i} className={clsx("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", i < customer.referralStamps ? "bg-brand-accent/5" : "border border-dashed border-brand-muted/20")}>
                                                                {i < customer.referralStamps ? <span className="kiss-emoji" style={{ fontSize: '18px' }}>💋</span> : ""}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1 w-20">
                                                        <button
                                                            onClick={() => openConfirm("remove", "indicacao", customer.id)}
                                                            className="p-1 hover:text-red-500 transition-colors disabled:opacity-20"
                                                            disabled={isMutating || customer.referralStamps === 0}
                                                        ><Minus size={12} /></button>
                                                        <button
                                                            onClick={() => handleAction(customer.id, "add", "indicacao")}
                                                            className="p-1 hover:text-emerald-500 transition-colors disabled:opacity-20"
                                                            disabled={isMutating || customer.referralStamps >= 10}
                                                        ><Plus size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm text-brand-text font-bold bg-brand-bg px-3.5 py-1.5 rounded-full border border-brand-border">
                                            {customer.ordersCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <button
                                                onClick={() => openConfirm("reset", "fidelidade", customer.id)}
                                                disabled={isMutating || (customer.stamps === 0 && customer.referralStamps === 0)}
                                                className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center hover:bg-amber-50 hover:border-amber-200 hover:text-amber-500 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Resetar tudo"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() =>
                                                setExpandedId(
                                                    expandedId === customer.id ? null : customer.id
                                                )
                                            }
                                            className="w-9 h-9 rounded-xl hover:bg-brand-bg flex items-center justify-center transition-colors border border-transparent hover:border-brand-border"
                                        >
                                            {expandedId === customer.id ? (
                                                <ChevronUp size={20} className="text-brand-muted" />
                                            ) : (
                                                <ChevronDown size={20} className="text-brand-muted" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === customer.id && (
                                    <tr className="border-b border-brand-border bg-brand-bg/20">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="grid grid-cols-4 gap-8">
                                                <div>
                                                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold block mb-1.5">WhatsApp</span>
                                                    <span className="text-sm text-brand-text font-bold font-mono">{customer.whatsapp}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold block mb-1.5">Membro desde</span>
                                                    <span className="text-sm text-brand-text font-bold">{formatDate(customer.created_at)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-brand-muted uppercase tracking-widest font-bold block mb-1.5">Status</span>
                                                    <span className={clsx("text-sm font-black uppercase tracking-widest", (customer.stamps >= 10 || customer.referralStamps >= 10) ? "text-emerald-600" : "text-amber-600")}>
                                                        {(customer.stamps >= 10 || customer.referralStamps >= 10) ? "🎁 Prêmio Disponível" : "Em progresso"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filtered.map((customer) => (
                    <div
                        key={customer.id}
                        className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
                                    <span className="text-base font-black text-brand-accent">
                                        {customer.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-text">{customer.name}</h3>
                                    <p className="text-xs text-brand-muted font-medium">{customer.email}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted bg-brand-bg px-2.5 py-1 rounded-full border border-brand-border">
                                {customer.ordersCount} pedidos
                            </span>
                        </div>

                        <div className="space-y-4 mb-5">
                            <div className="bg-brand-bg rounded-xl p-3 border border-brand-border/30">
                                <p className="text-[8px] uppercase tracking-tighter font-black text-brand-muted/40 mb-2">Cartão Fidelidade</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className={clsx("w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]", i < customer.stamps ? "bg-brand-accent/5" : "border border-dashed border-brand-muted/20")}>
                                                {i < customer.stamps ? <span className="kiss-emoji" style={{ fontSize: '20px' }}>💋</span> : ""}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleAction(customer.id, "remove", "fidelidade")} disabled={isMutating || customer.stamps === 0} className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center disabled:opacity-20"><Minus size={14} /></button>
                                        <button onClick={() => handleAction(customer.id, "add", "fidelidade")} disabled={isMutating || customer.stamps >= 10} className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center disabled:opacity-20"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-bg rounded-xl p-3 border border-brand-border/30">
                                <p className="text-[8px] uppercase tracking-tighter font-black text-brand-muted/40 mb-2">Cartão Indicação</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className={clsx("w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]", i < customer.referralStamps ? "bg-brand-accent/5" : "border border-dashed border-brand-muted/20")}>
                                                {i < customer.referralStamps ? <span className="kiss-emoji" style={{ fontSize: '20px' }}>💋</span> : ""}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleAction(customer.id, "remove", "indicacao")} disabled={isMutating || customer.referralStamps === 0} className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center disabled:opacity-20"><Minus size={14} /></button>
                                        <button onClick={() => handleAction(customer.id, "add", "indicacao")} disabled={isMutating || customer.referralStamps >= 10} className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center disabled:opacity-20"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-brand-bg">
                            <span className={clsx(
                                "text-[10px] font-black uppercase tracking-widest",
                                (customer.stamps >= 10 || customer.referralStamps >= 10) ? "text-emerald-600" : "text-brand-muted"
                            )}>
                                {(customer.stamps >= 10 || customer.referralStamps >= 10) ? "🎁 Prêmio Disponível" : "Em progresso"}
                            </span>
                            <button
                                onClick={() => openConfirm("reset", "fidelidade", customer.id)}
                                disabled={isMutating || (customer.stamps === 0 && customer.referralStamps === 0)}
                                className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center hover:bg-amber-50 hover:text-amber-500 transition-all shadow-sm disabled:opacity-30"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-brand-bg/10 rounded-2xl border border-brand-border border-dashed">
                    <Search size={32} className="mx-auto text-brand-muted/40 mb-4" />
                    <p className="text-brand-text font-bold">Nenhum cliente encontrado</p>
                    <p className="text-sm text-brand-muted font-medium">Tente buscar por outro termo</p>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-white border border-brand-border rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto text-red-500 border border-red-100 shadow-sm">
                                <AlertTriangle size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text text-center mb-2">
                                {confirmModal.type === "remove" ? "Remover Selo?" : "Resetar Fidelidade?"}
                            </h3>
                            <p className="text-sm text-brand-muted text-center mb-8 font-medium px-2">
                                {confirmModal.type === "remove"
                                    ? "Tem certeza que deseja remover 1 selo deste cliente? Esta ação não pode ser desfeita."
                                    : "Tem certeza que deseja zerar todos os selos deste cliente? O progresso será perdido."}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    disabled={isMutating}
                                    className="px-4 py-3 rounded-xl border border-brand-border text-brand-muted font-bold hover:bg-brand-bg transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={isMutating}
                                    className="px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all text-sm shadow-lg shadow-red-200"
                                >
                                    {isMutating ? "Confirmando..." : "Confirmar"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
