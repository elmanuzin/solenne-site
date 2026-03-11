"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

type PaymentType = "pix" | "dinheiro" | "cartao" | "link_pagamento";
type CardType = "debito" | "credito" | "parcelado";

export interface RegisterSaleProduct {
    id: string;
    name: string;
    price: number;
    cost: number;
}

export interface RegisterSalePayload {
    productId: string;
    quantity: number;
    paymentType: PaymentType;
    cardType?: CardType | null;
    installments?: number | null;
}

interface RegisterSaleModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    isLoadingProducts: boolean;
    products: RegisterSaleProduct[];
    onClose: () => void;
    onSubmit: (payload: RegisterSalePayload) => Promise<void>;
}

export default function RegisterSaleModal({
    isOpen,
    isSubmitting,
    isLoadingProducts,
    products,
    onClose,
    onSubmit,
}: RegisterSaleModalProps) {
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [paymentType, setPaymentType] = useState<PaymentType>("pix");
    const [cardType, setCardType] = useState<CardType>("debito");
    const [installments, setInstallments] = useState("2");
    const resolvedProductId = productId || products[0]?.id || "";

    const selectedProduct = useMemo(
        () => products.find((product) => product.id === resolvedProductId),
        [products, resolvedProductId]
    );

    if (!isOpen) return null;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting) return;

        const parsedQuantity = Math.max(1, Math.trunc(Number(quantity || 1)));

        await onSubmit({
            productId: resolvedProductId,
            quantity: parsedQuantity,
            paymentType,
            cardType: paymentType === "cartao" ? cardType : null,
            installments:
                paymentType === "cartao" && cardType === "parcelado"
                    ? Math.max(1, Math.trunc(Number(installments || 1)))
                    : null,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onClose}
                className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-lg bg-white rounded-2xl border border-brand-border shadow-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-heading text-2xl font-bold text-brand-text">
                        Registrar venda
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                            Produto
                        </label>
                        <select
                            required
                            value={resolvedProductId}
                            onChange={(event) => setProductId(event.target.value)}
                            disabled={isLoadingProducts || isSubmitting}
                            className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                        >
                            {!products.length ? (
                                <option value="">Nenhum produto disponível</option>
                            ) : null}
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                Quantidade
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                required
                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                Forma pagamento
                            </label>
                            <select
                                value={paymentType}
                                onChange={(event) => setPaymentType(event.target.value as PaymentType)}
                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                            >
                                <option value="pix">Pix</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao">Cartão</option>
                                <option value="link_pagamento">Link pagamento</option>
                            </select>
                        </div>
                    </div>

                    {paymentType === "cartao" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                    Tipo cartão
                                </label>
                                <select
                                    value={cardType}
                                    onChange={(event) => setCardType(event.target.value as CardType)}
                                    className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                >
                                    <option value="debito">Débito</option>
                                    <option value="credito">Crédito</option>
                                    <option value="parcelado">Parcelado</option>
                                </select>
                            </div>

                            {cardType === "parcelado" ? (
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                                        Parcelas
                                    </label>
                                    <select
                                        value={installments}
                                        onChange={(event) => setInstallments(event.target.value)}
                                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map((value) => (
                                            <option key={value} value={value}>
                                                {value}x
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {selectedProduct ? (
                        <div className="rounded-xl border border-brand-border bg-brand-bg/20 px-4 py-3 text-sm text-brand-text">
                            <p>
                                Preço unitário: <strong>R$ {selectedProduct.price.toFixed(2)}</strong>
                            </p>
                            <p>
                                Custo unitário: <strong>R$ {selectedProduct.cost.toFixed(2)}</strong>
                            </p>
                        </div>
                    ) : null}

                    <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-muted text-sm font-semibold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !resolvedProductId || isLoadingProducts}
                            className="px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                        >
                            {isSubmitting ? "Registrando..." : "Salvar venda"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
