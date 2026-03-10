"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { updateSiteBannerAction } from "@/lib/admin-actions";

type BannerConfig = {
    bannerUrl: string;
    bannerTitle: string;
    bannerSubtitle: string;
};

export default function BannerClient({
    initialBanner,
}: {
    initialBanner: BannerConfig;
}) {
    const [bannerUrl, setBannerUrl] = useState(initialBanner.bannerUrl);
    const [bannerTitle, setBannerTitle] = useState(initialBanner.bannerTitle);
    const [bannerSubtitle, setBannerSubtitle] = useState(initialBanner.bannerSubtitle);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSaving) return;

        setError("");
        setSuccess("");
        setIsSaving(true);

        try {
            const formData = new FormData(event.currentTarget);
            const result = await updateSiteBannerAction(formData);

            if (result?.error) {
                setError(result.error);
                return;
            }

            if (result?.bannerConfig) {
                setBannerUrl(result.bannerConfig.bannerUrl);
                setBannerTitle(result.bannerConfig.bannerTitle);
                setBannerSubtitle(result.bannerConfig.bannerSubtitle);
            }

            setSuccess("Banner atualizado com sucesso.");
        } catch {
            setError("Não foi possível atualizar o banner.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
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
                        Banner da Home
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-3">
                        Preview atual
                    </p>
                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-brand-border bg-brand-bg-soft">
                        <Image
                            src={bannerUrl}
                            alt="Banner atual da home"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-3">
                        Subir novo banner
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                Título do banner
                            </label>
                            <input
                                name="bannerTitle"
                                value={bannerTitle}
                                onChange={(event) => setBannerTitle(event.target.value)}
                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                placeholder="Nova coleção Solenne"
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                Subtítulo do banner
                            </label>
                            <input
                                name="bannerSubtitle"
                                value={bannerSubtitle}
                                onChange={(event) => setBannerSubtitle(event.target.value)}
                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                                placeholder="Peças elegantes para todas as ocasiões"
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-2">
                                Imagem do banner (opcional)
                            </label>
                            <input
                                name="banner"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm"
                            />
                            <p className="text-xs text-brand-muted mt-2">
                                Formatos aceitos: JPG, JPEG, PNG e WEBP (máx. 5MB). Envie
                                apenas quando quiser trocar a imagem.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                        >
                            <Upload size={16} />
                            {isSaving ? "Enviando..." : "Atualizar banner"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
