"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
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

function renderBeijos(quantity: number): string {
    const count = Math.max(0, quantity || 0);
    return count > 0 ? "💋".repeat(count) : "—";
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
    const [actionError, setActionError] = useState("");
    const [isMutating, setIsMutating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState({
        name: "",
        phone: "",
        email: "",
        stamps: "0",
        referralStamps: "0",
    });

    const filteredCustomers = useMemo(() => {
        const term = search.toLowerCase().trim();
        if (!term) return customers;

        return customers.filter((customer) => {
            return (
                customer.name.toLowerCase().includes(term) ||
                customer.email.toLowerCase().includes(term) ||
                (customer.phone || "").toLowerCase().includes(term)
            );
        });
    }, [customers, search]);

    async function handleAddKiss(
        customerId: string,
        cardType: "fidelidade" | "indicacao"
    ) {
        if (isMutating) return;

        setActionError("");
        const previous = customers;

        setCustomers((current) =>
            current.map((customer) => {
                if (customer.id !== customerId) return customer;
                return cardType === "fidelidade"
                    ? { ...customer, stamps: Math.min(10, customer.stamps + 1) }
                    : {
                          ...customer,
                          referralStamps: Math.min(10, customer.referralStamps + 1),
                      };
            })
        );

        setIsMutating(true);
        try {
            const result = await addStampAction(customerId, cardType);
            if (result?.error) {
                setCustomers(previous);
                setActionError(result.error);
            }
        } catch {
            setCustomers(previous);
            setActionError("Não foi possível atualizar os beijos.");
        } finally {
            setIsMutating(false);
        }
    }

    function resetForm() {
        setFormState({
            name: "",
            phone: "",
            email: "",
            stamps: "0",
            referralStamps: "0",
        });
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
            if (result?.error) {
                setActionError(result.error);
                return;
            }

            if (result?.customer) {
                setCustomers((current) => [result.customer, ...current]);
            }

            resetForm();
            setIsModalOpen(false);
        } catch {
            setActionError("Não foi possível cadastrar cliente.");
        } finally {
            setIsMutating(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
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
                            Clientes
                        </h1>
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

            <div className="relative mb-6">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome, telefone ou e-mail..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10 outline-none transition-all shadow-sm font-medium"
                />
            </div>

            {actionError ? (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {actionError}
                </div>
            ) : null}

            {filteredCustomers.length === 0 ? (
                <div className="text-center py-20 bg-brand-bg/10 rounded-2xl border border-brand-border border-dashed">
                    <p className="text-brand-text font-bold">
                        Nenhuma cliente cadastrada ainda 💋
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left">
                            <thead>
                                <tr className="border-b border-brand-border bg-brand-bg/30">
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Nome
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Telefone
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Beijos Fidelidade 💋
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Beijos Indicação 💋
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Data de cadastro
                                    </th>
                                    <th className="px-6 py-4 text-xs text-brand-muted uppercase tracking-widest font-bold">
                                        Ações rápidas
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b border-brand-border last:border-0 hover:bg-brand-bg/10 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-brand-text">
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-text">
                                            {customer.phone || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-text">
                                            {customer.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-text">
                                            {renderBeijos(customer.stamps)}{" "}
                                            <span className="text-brand-muted">({customer.stamps})</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-text">
                                            {renderBeijos(customer.referralStamps)}{" "}
                                            <span className="text-brand-muted">
                                                ({customer.referralStamps})
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-text">
                                            {formatDate(customer.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddKiss(customer.id, "fidelidade")
                                                    }
                                                    disabled={isMutating}
                                                    className="px-3 py-2 rounded-lg border border-brand-border text-sm font-medium text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                                                >
                                                    +💋 Fidelidade
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddKiss(customer.id, "indicacao")
                                                    }
                                                    disabled={isMutating}
                                                    className="px-3 py-2 rounded-lg border border-brand-border text-sm font-medium text-brand-text hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-50"
                                                >
                                                    +💋 Indicação
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Fechar modal"
                        onClick={() => {
                            setIsModalOpen(false);
                            resetForm();
                        }}
                        className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
                    />

                    <div className="relative w-full max-w-lg bg-white rounded-2xl border border-brand-border shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-heading text-2xl font-bold text-brand-text">
                                Adicionar Cliente
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                    Nome
                                </label>
                                <input
                                    required
                                    value={formState.name}
                                    onChange={(event) =>
                                        setFormState((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                    Telefone
                                </label>
                                <input
                                    value={formState.phone}
                                    onChange={(event) =>
                                        setFormState((current) => ({
                                            ...current,
                                            phone: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formState.email}
                                    onChange={(event) =>
                                        setFormState((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                        Beijos Fidelidade 💋
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={formState.stamps}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                stamps: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                        Beijos Indicação 💋
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={10}
                                        value={formState.referralStamps}
                                        onChange={(event) =>
                                            setFormState((current) => ({
                                                ...current,
                                                referralStamps: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
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
                                    {isMutating ? "Salvando..." : "Salvar cliente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
