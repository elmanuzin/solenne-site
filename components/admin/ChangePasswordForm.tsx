"use client";

import { FormEvent, useState, useTransition } from "react";
import { changeAdminPasswordAction } from "@/lib/admin-actions";

export default function ChangePasswordForm() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setError("");

        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const result = await changeAdminPasswordAction(formData);

            if (result?.error) {
                setError(result.error);
                return;
            }

            setMessage("Senha alterada com sucesso.");
            form.reset();
        });
    }

    return (
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-brand-text mb-1">
                Alterar senha do admin
            </h3>
            <p className="text-sm text-brand-muted mb-5">
                Informe sua senha atual e defina uma nova senha de acesso.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                        Senha atual
                    </label>
                    <input
                        name="currentPassword"
                        type="password"
                        minLength={6}
                        required
                        className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                            Nova senha
                        </label>
                        <input
                            name="newPassword"
                            type="password"
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-brand-muted font-bold mb-2">
                            Confirmar senha
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-brand-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                    </div>
                </div>

                {error ? (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                ) : null}

                {message ? (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        {message}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover disabled:opacity-50"
                >
                    {isPending ? "Salvando..." : "Atualizar senha"}
                </button>
            </form>
        </div>
    );
}
