"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, X, ChevronDown } from "lucide-react";
import {
    addStampAction,
    createCustomerAction,
} from "@/lib/admin-actions";

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    stamps: number;
    referralStamps: number;
    created_at: string;
}

type RFMTag = "VIP" | "Recorrente" | "Alto Potencial" | "Inativa" | "Nova";

function getRFMTag(customer: Customer): RFMTag {
    const totalStamps = customer.stamps + customer.referralStamps;
    const daysSinceJoin = Math.floor(
        (Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (totalStamps >= 8) return "VIP";
    if (totalStamps >= 4) return "Recorrente";
    if (totalStamps >= 1) return "Alto Potencial";
    if (daysSinceJoin < 30) return "Nova";
    return "Inativa";
}

const TAG_STYLES: Record<RFMTag, string> = {
    VIP: "bg-amber-100 text-amber-700",
    Recorrente: "bg-emerald-100 text-emerald-700",
    "Alto Potencial": "bg-blue-100 text-blue-700",
    Nova: "bg-violet-100 text-violet-700",
    Inativa: "bg-neutral-200 text-neutral-500",
};

function renderBeijos(quantity: number): string {
    const count = Math.max(0, quantity || 0);
    return count > 0 ? "💋".repeat(Math.min(count, 10)) : "—";
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function ClientesClient({
    initialCustomers,
}: {
    initialCustomers: Customer[];
}) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState<RFMTag | "">("");
    const [actionError, setActionError] = useState("");
    const [isMutating, setIsMutating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        name: "",
        phone: "",
        email: "",
        stamps: "0",
        referralStamps: "0",
    });

    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        customers.forEach((c) => {
            const tag = getRFMTag(c);
            counts[tag] = (counts[tag] ?? 0) + 1;
        });
        return counts;
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        const term = search.toLowerCase().trim();
        return customers.filter((c) => {
            const matchSearch =
                !term ||
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                (c.phone || "").toLowerCase().includes(term);
            const matchTag = !tagFilter || getRFMTag(c) === tagFilter;
            return matchSearch && matchTag;
        });
    }, [customers, search, tagFilter]);

    async function handleAddKiss(customerId: string, cardType: "fidelidade" | "indicacao") {
        if (isMutating) return;
        setActionError("");
        const previous = customers;
        setCustomers((cur) =>
            cur.map((c) => {
                if (c.id !== customerId) return c;
                return cardType === "fidelidade"
                    ? { ...c, stamps: Math.min(10, c.stamps + 1) }
                    : { ...c, referralStamps: Math.min(10, c.referralStamps + 1) };
            })
        );
        setIsMutating(true);
        try {
            const result = await addStampAction(customerId, cardType);
            if (result?.error) { setCustomers(previous); setActionError(result.error); }
        } catch {
            setCustomers(previous);
            setActionError("Não foi possível atualizar os beijos.");
        } finally {
            setIsMutating(false);
        }
    }

    function resetForm() {
        setFormState({ name: "", phone: "", email: "", stamps: "0", referralStamps: "0" });
    }

    async function handleCreateCustomer(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isMutating) return;
        setActionError("");
        setIsMutating(true);
        try {
            const payload = new FormData();
            payload.append("name", formState.name);
            payload.append("phone", formState.phone);
            payload.append("email", formState.email);
            payload.append("stamps", formState.stamps || "0");
            payload.append("referralStamps", formState.referralStamps || "0");
            const result = await createCustomerAction(payload);
            if (result?.error) { setActionError(result.error); return; }
            if (result?.customer) setCustomers((cur) => [result.customer, ...cur]);
            resetForm();
            setIsModalOpen(false);
        } catch {
            setActionError("Não foi possível cadastrar cliente.");
        } finally {
            setIsMutating(false);
        }
    }

    const allTags: RFMTag[] = ["VIP", "Recorrente", "Alto Potencial", "Nova", "Inativa"];

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard"
                        className="w-10 h-10 rounded-xl bg-white border border-brand-border flex items-center justify-center hover:bg-brand-bg transition-colors shadow-sm"
                    >
                        <ArrowLeft size={16} className="text-brand-muted" />
                    </Link>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">Administração</p>
                        <h1 className="font-heading text-3xl font-bold text-brand-text">Clientes</h1>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover transition-colors"
                >
                    <Plus size={16} />
                    Adicionar Cliente
                </button>
            </div>

            {/* Segment pills */}
            <div className="flex flex-wrap gap-2 mb-5">
                <button
                    type="button"
                    onClick={() => setTagFilter("")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!tagFilter ? "bg-brand-accent text-white" : "border border-brand-border bg-white text-brand-muted hover:bg-brand-bg"}`}
                >
                    Todas ({customers.length})
                </button>
                {allTags.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => setTagFilter(tag === tagFilter ? "" : tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tagFilter === tag ? "bg-brand-accent text-white" : `border border-brand-border bg-white text-brand-muted hover:bg-brand-bg`}`}
                    >
                        {tag} {tagCounts[tag] ? `(${tagCounts[tag]})` : "(0)"}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome, telefone ou e-mail..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all shadow-sm font-medium text-sm"
                />
            </div>

            {actionError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{actionError}</div>
            )}

            {/* Empty state */}
            {filteredCustomers.length === 0 ? (
                <div className="text-center py-20 bg-brand-bg/10 rounded-2xl border border-brand-border border-dashed">
                    <p className="text-brand-text font-bold">
                        {search || tagFilter ? "Nenhuma cliente encontrada com esses filtros." : "Nenhuma cliente cadastrada ainda 💋"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left">
                            <thead>
                                <tr className="border-b border-brand-border bg-brand-bg/30">
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Nome</th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Segmento</th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Telefone</th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Beijos 💋</th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Cadastro</th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => {
                                    const tag = getRFMTag(customer);
                                    const isExpanded = expandedId === customer.id;
                                    return (
                                        <>
                                            <tr
                                                key={customer.id}
                                                className="border-b border-brand-border last:border-0 hover:bg-brand-bg/10 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-1.5 text-sm font-semibold text-brand-text hover:text-brand-accent transition-colors"
                                                        onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                                                    >
                                                        {customer.name}
                                                        <ChevronDown
                                                            size={14}
                                                            className={`text-brand-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                        />
                                                    </button>
                                                    <p className="text-xs text-brand-muted mt-0.5">{customer.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${TAG_STYLES[tag]}`}>
                                                        {tag}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-text">{customer.phone || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-brand-text">
                                                    <span title={`Fidelidade: ${customer.stamps} · Indicação: ${customer.referralStamps}`}>
                                                        {renderBeijos(customer.stamps + customer.referralStamps)}{" "}
                                                        <span className="text-brand-muted text-xs">
                                                            ({customer.stamps + customer.referralStamps})
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-brand-text">{formatDate(customer.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddKiss(customer.id, "fidelidade")}
                                                            disabled={isMutating}
                                                            className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                                                        >
                                                            +💋 Fidelidade
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddKiss(customer.id, "indicacao")}
                                                            disabled={isMutating}
                                                            className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                                                        >
                                                            +💋 Indicação
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${customer.id}-expanded`} className="border-b border-brand-border bg-brand-bg/30">
                                                    <td colSpan={6} className="px-6 py-4">
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold mb-1">Selos fidelidade</p>
                                                                <p className="font-semibold text-brand-text">{customer.stamps} / 10</p>
                                                                <div className="mt-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
                                                                    <div className="h-full bg-brand-accent rounded-full" style={{ width: `${(customer.stamps / 10) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold mb-1">Selos indicação</p>
                                                                <p className="font-semibold text-brand-text">{customer.referralStamps} / 10</p>
                                                                <div className="mt-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
                                                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(customer.referralStamps / 10) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold mb-1">Segmento</p>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${TAG_STYLES[tag]}`}>
                                                                    {tag}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold mb-1">Email</p>
                                                                <p className="text-brand-text break-all">{customer.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add customer modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Fechar modal"
                        onClick={() => { setIsModalOpen(false); resetForm(); }}
                        className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl border border-brand-border shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-heading text-2xl font-bold text-brand-text">Adicionar Cliente</h2>
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            {[
                                { label: "Nome", key: "name" as const, type: "text", required: true },
                                { label: "Telefone", key: "phone" as const, type: "text", required: false },
                                { label: "Email", key: "email" as const, type: "email", required: true },
                            ].map(({ label, key, type, required }) => (
                                <div key={key}>
                                    <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">{label}</label>
                                    <input
                                        type={type}
                                        required={required}
                                        value={formState[key]}
                                        onChange={(e) => setFormState((cur) => ({ ...cur, [key]: e.target.value }))}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Beijos Fidelidade 💋", key: "stamps" as const },
                                    { label: "Beijos Indicação 💋", key: "referralStamps" as const },
                                ].map(({ label, key }) => (
                                    <div key={key}>
                                        <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">{label}</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            value={formState[key]}
                                            onChange={(e) => setFormState((cur) => ({ ...cur, [key]: e.target.value }))}
                                            className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    disabled={isMutating}
                                    className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isMutating}
                                    className="px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                                >
                                    {isMutating ? "Salvando…" : "Salvar cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
