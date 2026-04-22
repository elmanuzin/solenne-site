import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ConfiguracoesPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
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
                    <h1 className="font-heading text-3xl font-bold text-brand-text flex items-center gap-3">
                        <Settings size={26} />
                        Configurações
                    </h1>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-3">
                        Segurança
                    </p>
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
}
