import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listAdminOrders } from "@/services/admin-order.service";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
    return new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusClass(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized === "entregue" || normalized === "concluido") {
        return "bg-emerald-100 text-emerald-700";
    }

    if (normalized === "cancelado") {
        return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
}

export default async function AdminPedidosPage() {
    const orders = await listAdminOrders();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
                        Pedidos
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="border-b border-brand-border bg-brand-bg/35">
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Cliente</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Produto</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Tamanho</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Status</th>
                                <th className="px-5 py-4 text-xs uppercase tracking-widest text-brand-muted">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-brand-border last:border-0"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-brand-text">
                                            {order.customerName}
                                        </p>
                                        <p className="text-xs text-brand-muted mt-1">
                                            {order.customerEmail}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-brand-text">
                                            {order.productName}
                                        </p>
                                        <p className="text-xs text-brand-muted mt-1">
                                            Cor: {order.productColor}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {order.size}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusClass(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-brand-text">
                                        {formatDate(order.created_at)}
                                    </td>
                                </tr>
                            ))}
                            {!orders.length ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-10 text-center text-sm text-brand-muted"
                                    >
                                        Nenhum pedido cadastrado.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
