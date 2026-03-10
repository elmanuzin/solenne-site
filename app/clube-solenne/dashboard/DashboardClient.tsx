"use client";

import { useState, useEffect } from "react";
import {
    LogOut,
    ShoppingBag,
    Gift,
    Calendar,
    MessageCircle,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { logoutAction, redeemRewardAction } from "@/lib/actions";
import { generateClubRewardMessage } from "@/lib/whatsapp";
import LoyaltyCard from "@/components/clube/LoyaltyCard";
import type { ClubReward } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface DashboardUser {
    id: string;
    name: string;
    email: string;
    stamps: number;
    referralStamps: number;
    created_at: string;
}

interface DashboardOrder {
    id: string;
    product_name: string;
    size: string;
    price: number;
    created_at: string;
    generates_stamp: boolean;
}

interface DashboardClientProps {
    user: DashboardUser;
    orders: DashboardOrder[];
    rewards: ClubReward[];
}

export default function DashboardClient({
    user,
    orders,
    rewards,
}: DashboardClientProps) {
    const [showRewards, setShowRewards] = useState(false);
    const [redeeming, setRedeeming] = useState(false);

    // Confetti effect trigger (mock)
    useEffect(() => {
        if (user.stamps >= 10 || user.referralStamps >= 10) {
            // In a real app, trigger canvas confetti here
        }
    }, [user.stamps, user.referralStamps]);

    const canRedeemFidelidade = user.stamps >= 10;
    const canRedeemIndicacao = user.referralStamps >= 10;
    const canRedeem = canRedeemFidelidade || canRedeemIndicacao;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    async function handleRedeem(rewardName: string) {
        setRedeeming(true);
        try {
            const result = await redeemRewardAction(rewardName);
            if (result.success) {
                window.open(generateClubRewardMessage(rewardName), "_blank");
                // Reload page to reflect reset stamps
                window.location.reload();
            }
        } catch {
            // ignore
        }
        setRedeeming(false);
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
            {/* Header */}
            <div className="flex items-start justify-between mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-xs uppercase tracking-widest text-brand-accent font-medium mb-1">
                        Clube Solenne
                    </p>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold text-brand-text">
                        Olá, {user.name.split(" ")[0]}! <span className="kiss-emoji" style={{ fontSize: '20px' }}>💋</span>
                    </h1>
                    <p className="text-sm text-brand-muted mt-1">
                        Membro desde {formatDate(user.created_at)}
                    </p>
                </motion.div>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors px-3 py-2 rounded-full border border-brand-border hover:border-brand-accent/30"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </form>
            </div>

            {/* Loyalty Cards Stack */}
            <section className="space-y-12 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <LoyaltyCard stamps={user.stamps} title="FIDELIDADE SOLENNE" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <LoyaltyCard
                        stamps={user.referralStamps}
                        title="INDICAÇÃO SOLENNE"
                    />
                </motion.div>
            </section>

            {/* Reward Unlock Section */}
            <section className="mb-10 min-h-[100px]">
                <AnimatePresence mode="wait">
                    {canRedeem && !showRewards && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => setShowRewards(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-accent to-[#a82e2e] text-white font-semibold text-base shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 group"
                        >
                            <Gift size={20} className="group-hover:rotate-12 transition-transform" />
                            <span>Resgatar Brinde Exclusivo</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">GRÁTIS</span>
                        </motion.button>
                    )}

                    {canRedeem && showRewards && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-brand-card rounded-2xl border border-brand-border p-6 sm:p-8 shadow-sm">
                                <div className="text-center mb-6">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                        className="text-4xl mb-2 block"
                                    >
                                        🎁
                                    </motion.span>
                                    <h3 className="font-heading text-xl font-bold text-brand-text">
                                        Escolha seu prêmio
                                    </h3>
                                    <p className="text-sm text-brand-muted mt-1">
                                        Selecione um dos modelos abaixo e resgate pelo WhatsApp.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {rewards.map((reward) => (
                                        <div
                                            key={reward.id}
                                            className="bg-brand-bg rounded-xl overflow-hidden border border-brand-border group hover:border-brand-accent/30 transition-colors"
                                        >
                                            {/* Placeholder image */}
                                            <div className="aspect-square bg-gradient-to-br from-[#f5ede0] to-[#e8dfd0] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                                <div className="text-center">
                                                    <Gift
                                                        size={28}
                                                        className="mx-auto text-brand-muted/40 mb-1"
                                                    />
                                                    <p className="text-xs text-brand-muted/40">
                                                        {reward.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-4 relative bg-brand-bg">
                                                <h4 className="font-heading text-sm font-bold text-brand-text mb-1">
                                                    {reward.name}
                                                </h4>
                                                <p className="text-xs text-brand-muted mb-3 line-clamp-2">
                                                    {reward.description}
                                                </p>
                                                <button
                                                    onClick={() => handleRedeem(reward.name)}
                                                    disabled={redeeming}
                                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-brand-accent text-white text-xs font-semibold hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
                                                >
                                                    <MessageCircle size={14} />
                                                    Resgatar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowRewards(false)}
                                    className="mt-6 text-xs text-brand-muted hover:text-brand-accent transition-colors mx-auto block"
                                >
                                    ← Voltar para dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {!canRedeem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-brand-card rounded-2xl border border-brand-border p-6 text-center shadow-sm"
                        >
                            <Sparkles size={20} className="mx-auto text-brand-accent/40 mb-3" />
                            <p className="text-sm text-brand-muted">
                                Continue colecionando selos de compras e indicações para ganhar seus brindes exclusivos Solenne! <span className="kiss-emoji" style={{ fontSize: '18px' }}>💋</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Purchase History */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag size={18} className="text-brand-accent" />
                    <h2 className="font-heading text-lg font-bold text-brand-text">
                        Histórico de Compras
                    </h2>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-brand-card rounded-2xl border border-brand-border p-10 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-brand-bg-soft flex items-center justify-center mx-auto mb-4">
                            <Calendar size={28} className="text-brand-muted/40" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-brand-text mb-1">
                            Ainda não tem pedidos?
                        </h3>
                        <p className="text-sm text-brand-muted mb-6 max-w-xs mx-auto">
                            Faça sua primeira compra para começar a ganhar selos e aproveitar os benefícios.
                        </p>
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
                        >
                            Ir para o catálogo <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-brand-card rounded-xl border border-brand-border px-5 py-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-brand-text">
                                        {order.product_name}
                                    </p>
                                    <p className="text-xs text-brand-muted">
                                        Tam. {order.size} •{" "}
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-brand-accent">
                                        {formatPrice(order.price)}
                                    </p>
                                    {order.generates_stamp && (
                                        <p className="text-[10px] text-brand-muted flex items-center justify-end gap-1">
                                            +1 selo <span className="kiss-emoji" style={{ fontSize: '12px' }}>💋</span>
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
