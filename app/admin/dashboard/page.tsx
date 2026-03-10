import {
    Package,
    Users,
    Award,
    Stamp,
    LogOut,
    BarChart3,
    Box,
    UserCircle,
    ImageIcon,
} from "lucide-react";
import { adminLogoutAction } from "@/lib/admin-actions";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import Link from "next/link";
import { getAdminStats } from "@/services/admin-client.service";
import { listAdminProducts } from "@/services/admin-product.service";

export const dynamic = "force-dynamic";

const EMPTY_STATS = {
    totalStamps: 0,
    totalReferralStamps: 0,
    totalRedemptions: 0,
    totalCustomers: 0,
};

async function safeListProducts() {
    try {
        return await listAdminProducts();
    } catch (error) {
        console.error("Erro ao carregar produtos do dashboard:", error);
        return [];
    }
}

async function safeGetAdminStats() {
    try {
        return await getAdminStats();
    } catch (error) {
        console.error("Erro ao carregar métricas do dashboard:", error);
        return EMPTY_STATS;
    }
}

export default async function AdminDashboardPage() {
    const [products, stats] = await Promise.all([
        safeListProducts(),
        safeGetAdminStats(),
    ]);

    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + p.stock, 0);

    const cards = [
        {
            label: "Produtos",
            value: totalProducts,
            sub: `${totalStock} unidades em estoque`,
            icon: Package,
            color: "bg-blue-500/10 text-blue-400",
            href: "/admin/produtos",
        },
        {
            label: "Clientes",
            value: stats.totalCustomers,
            sub: "cadastrados",
            icon: Users,
            color: "bg-emerald-500/10 text-emerald-400",
            href: "/admin/clientes",
        },
        {
            label: "Selos Emitidos",
            value: stats.totalStamps,
            sub: "total acumulado",
            icon: Stamp,
            color: "bg-amber-500/10 text-amber-400",
        },
        {
            label: "Brindes Resgatados",
            value: stats.totalRedemptions,
            sub: "recompensas",
            icon: Award,
            color: "bg-rose-500/10 text-rose-400",
        },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">
                        Painel Administrativo
                    </p>
                    <h1 className="font-heading text-3xl font-bold text-brand-text">
                        Dashboard
                    </h1>
                </div>
                <form action={adminLogoutAction}>
                    <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors px-4 py-2 rounded-full border border-brand-border bg-white hover:border-brand-accent/30 shadow-sm"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-brand-muted uppercase tracking-widest font-bold">
                                {card.label}
                            </span>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color.replace('/10', '/20')}`}
                            >
                                <card.icon size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-brand-text">{card.value}</p>
                        <p className="text-xs text-brand-muted mt-1 font-medium">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href="/admin/produtos"
                    className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-6 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Box size={22} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                            Gerenciar Produtos
                        </p>
                        <p className="text-sm text-brand-muted">
                            {totalProducts} produtos • {totalStock} unidades
                        </p>
                    </div>
                    <BarChart3
                        size={18}
                        className="ml-auto text-brand-muted/40 group-hover:text-brand-accent transition-colors"
                    />
                </Link>

                <Link
                    href="/admin/clientes"
                    className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-6 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <UserCircle size={22} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                            Gerenciar Clientes
                        </p>
                        <p className="text-sm text-brand-muted">
                            {stats.totalCustomers} clientes • {stats.totalStamps} selos
                        </p>
                    </div>
                    <BarChart3
                        size={18}
                        className="ml-auto text-brand-muted/40 group-hover:text-brand-accent transition-colors"
                    />
                </Link>

                <Link
                    href="/admin/banner"
                    className="flex items-center gap-4 bg-white rounded-2xl border border-brand-border p-6 hover:border-brand-accent/40 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <ImageIcon size={22} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-brand-text group-hover:text-brand-accent transition-colors">
                            Gerenciar Banner
                        </p>
                        <p className="text-sm text-brand-muted">
                            Atualize o banner da homepage
                        </p>
                    </div>
                    <BarChart3
                        size={18}
                        className="ml-auto text-brand-muted/40 group-hover:text-brand-accent transition-colors"
                    />
                </Link>
            </div>

            <div className="mt-6">
                <ChangePasswordForm />
            </div>
        </div>
    );
}
