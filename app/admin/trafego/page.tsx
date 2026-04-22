import Link from "next/link";
import { ArrowLeft, Globe, MousePointerClick, TrendingUp, Eye, MessageCircle, Info } from "lucide-react";

export const dynamic = "force-dynamic";

// TODO: Integrar com GA4 via API de dados (Data API) ou Vercel Analytics para preencher esses valores.
// TODO: Integrar com evento "whatsapp_click" já rastreado em lib/analytics.ts para puxar cliques por produto.
// TODO: Integrar com Microsoft Clarity para mapas de calor e gravações de sessão.

function PlaceholderCard({
    label,
    icon: Icon,
    color,
    note,
}: {
    label: string;
    icon: React.ElementType;
    color: string;
    note?: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
            </div>
            <div className="h-8 w-24 bg-brand-bg rounded-lg animate-pulse mb-1" />
            <p className="text-xs text-brand-muted font-medium">{label}</p>
            {note && <p className="text-[10px] text-brand-muted/60 mt-1">{note}</p>}
        </div>
    );
}

function IntegrationItem({
    name,
    status,
    description,
    steps,
}: {
    name: string;
    status: "pronto" | "pendente" | "parcial";
    description: string;
    steps?: string[];
}) {
    const statusColors = {
        pronto: "bg-emerald-100 text-emerald-700",
        parcial: "bg-amber-100 text-amber-700",
        pendente: "bg-neutral-200 text-neutral-600",
    };
    const statusLabels = { pronto: "Ativo", parcial: "Parcial", pendente: "Pendente" };

    return (
        <div className="border border-brand-border rounded-2xl p-5 bg-white">
            <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-brand-text">{name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${statusColors[status]}`}>
                    {statusLabels[status]}
                </span>
            </div>
            <p className="text-sm text-brand-muted mb-3">{description}</p>
            {steps && steps.length > 0 && (
                <ol className="space-y-1">
                    {steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-brand-muted">
                            <span className="w-4 h-4 rounded-full bg-brand-border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {i + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

export default function TrafegoPage() {
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
                    <p className="text-xs uppercase tracking-widest text-brand-accent font-bold mb-1">Administração</p>
                    <h1 className="font-heading text-3xl font-bold text-brand-text">Tráfego e Conversão</h1>
                </div>
            </div>

            {/* Info banner */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">Estrutura pronta — integração pendente</p>
                    <p className="text-sm text-blue-700">
                        Esta página está preparada para receber dados de tráfego do GA4 e de cliques no WhatsApp.
                        Siga o guia de integrações abaixo para ativar cada fonte de dados.
                    </p>
                </div>
            </div>

            {/* KPI placeholders */}
            <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-3">Métricas de tráfego</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <PlaceholderCard label="Sessões (7d)" icon={Globe} color="bg-blue-50 text-blue-500" note="via GA4" />
                    <PlaceholderCard label="Visualizações de produto" icon={Eye} color="bg-violet-50 text-violet-500" note="via GA4" />
                    <PlaceholderCard label="Cliques WhatsApp" icon={MessageCircle} color="bg-emerald-50 text-emerald-500" note="via lib/analytics" />
                    <PlaceholderCard label="Taxa de clique" icon={MousePointerClick} color="bg-amber-50 text-amber-500" note="WhatsApp / Views" />
                    <PlaceholderCard label="Crescimento" icon={TrendingUp} color="bg-rose-50 text-rose-500" note="vs. período anterior" />
                </div>
            </div>

            {/* Funnel placeholder */}
            <div className="mb-8 bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-5">Funil de conversão</p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    {[
                        { label: "Visitante", desc: "Acessa a loja", color: "bg-blue-100 text-blue-700" },
                        { label: "View produto", desc: "Abre uma PDP", color: "bg-violet-100 text-violet-700" },
                        { label: "Clique WhatsApp", desc: "Inicia conversa", color: "bg-emerald-100 text-emerald-700" },
                        { label: "Lead criado", desc: "Cliente cadastrado", color: "bg-amber-100 text-amber-700" },
                        { label: "Venda", desc: "Venda registrada", color: "bg-rose-100 text-rose-700" },
                    ].map((step, i, arr) => (
                        <div key={step.label} className="flex sm:flex-col items-center gap-2 flex-1">
                            <div className={`rounded-2xl px-4 py-3 text-center w-full ${step.color}`}>
                                <div className="h-6 w-12 bg-white/50 rounded animate-pulse mx-auto mb-1" />
                                <p className="text-xs font-bold uppercase tracking-widest">{step.label}</p>
                                <p className="text-[10px] mt-0.5 opacity-80">{step.desc}</p>
                            </div>
                            {i < arr.length - 1 && (
                                <span className="text-brand-muted text-lg sm:hidden">→</span>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-brand-muted mt-4 text-center">
                    Valores serão preenchidos após integração com GA4 e rastreamento de eventos.
                </p>
            </div>

            {/* Top products placeholder */}
            <div className="mb-8 bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-brand-border bg-brand-bg/30">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold">Produtos — cliques no WhatsApp vs. visualizações</p>
                </div>
                <div className="p-5 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-12 rounded-lg bg-brand-bg animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-brand-bg rounded animate-pulse w-48" />
                                <div className="h-2 bg-brand-bg rounded animate-pulse w-32" />
                            </div>
                            <div className="text-right space-y-1">
                                <div className="h-3 bg-brand-bg rounded animate-pulse w-16" />
                                <div className="h-2 bg-brand-bg rounded animate-pulse w-10 ml-auto" />
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-brand-muted text-center pt-2">
                        Aguardando integração com GA4 e eventos de <code className="bg-brand-bg px-1 rounded">whatsapp_click</code>.
                    </p>
                </div>
            </div>

            {/* Integration guide */}
            <div>
                <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-4">Guia de integrações</p>
                <div className="space-y-4">
                    <IntegrationItem
                        name="Vercel Analytics"
                        status="pronto"
                        description="Pageviews e métricas de Web Vitals automáticas. Já instalado e ativo no layout."
                    />
                    <IntegrationItem
                        name="Vercel Speed Insights"
                        status="pronto"
                        description="Core Web Vitals por página. Já instalado e ativo no layout."
                    />
                    <IntegrationItem
                        name="Google Analytics 4"
                        status="pendente"
                        description="Eventos avançados, funil de conversão e relatórios de audiência."
                        steps={[
                            "Crie uma propriedade GA4 em analytics.google.com",
                            "Copie o Measurement ID (ex: G-XXXXXXXXXX)",
                            'Adicione NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX no .env.local e no painel Vercel → Settings → Environment Variables',
                            "O script é carregado automaticamente quando a variável estiver definida (ver app/layout.tsx)",
                            'Verifique os eventos "whatsapp_click" e "product_view" em GA4 → DebugView',
                        ]}
                    />
                    <IntegrationItem
                        name="Microsoft Clarity"
                        status="pendente"
                        description="Mapas de calor e gravações de sessão. Gratuito e sem limite de eventos."
                        steps={[
                            "Crie um projeto em clarity.microsoft.com",
                            "Copie o Project ID (string de 10 caracteres)",
                            "Adicione NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx no .env.local e no Vercel",
                            "O script é carregado automaticamente quando a variável estiver definida",
                        ]}
                    />
                    <IntegrationItem
                        name="Meta Pixel (Facebook)"
                        status="pendente"
                        description="Rastreamento de eventos para campanhas no Instagram e Facebook."
                        steps={[
                            "Acesse business.facebook.com → Events Manager → Connect Data Sources → Web",
                            "Crie um Pixel e copie o Pixel ID (número de 15-16 dígitos)",
                            "Adicione NEXT_PUBLIC_META_PIXEL_ID=1234567890 no .env.local e no Vercel",
                            "O script é carregado automaticamente quando a variável estiver definida",
                            "Futuramente: configurar CAPI (Conversions API) para eventos server-side",
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
