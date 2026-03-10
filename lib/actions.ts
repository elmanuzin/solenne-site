"use server";

import {
    hashPassword,
    verifyPassword,
    createSession,
    setSessionCookie,
    deleteSessionCookie,
    getCurrentSession,
} from "@/lib/auth";
import { createUser, getUserByEmail, getUserById } from "@/lib/db";
import { redeemReward } from "@/services/loyalty.service";
import { redirect } from "next/navigation";

// ─── REGISTER ─────────────────────────────────────────

export async function registerAction(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "Preencha todos os campos obrigatórios." };
    }

    const existing = await getUserByEmail(email);
    if (existing) {
        return { error: "Este e-mail já está cadastrado." };
    }

    const password_hash = await hashPassword(password);
    const user = await createUser({
        name,
        email: email.toLowerCase(),
        whatsapp: whatsapp || "",
        password_hash,
    });

    const token = await createSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "user",
    });

    await setSessionCookie(token);
    return { success: true };
}

// ─── LOGIN ────────────────────────────────────────────

export async function loginAction(formData: FormData) {
    await deleteSessionCookie();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Preencha todos os campos." };
    }

    const user = await getUserByEmail(email.toLowerCase());

    if (!user) {
        return { error: "E-mail ou senha inválidos." };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
        return { error: "E-mail ou senha inválidos." };
    }

    const token = await createSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "customer",
    });
    await setSessionCookie(token);

    return { success: true };
}

// ─── LOGOUT ───────────────────────────────────────────

export async function logoutAction() {
    await deleteSessionCookie();
    redirect("/clube-solenne/login");
}

// ─── REDEEM REWARD ────────────────────────────────────

export async function redeemRewardAction(rewardName: string) {
    const session = await getCurrentSession();
    if (!session) {
        return { error: "Sessão expirada. Faça login novamente." };
    }

    const user = await getUserById(session.userId);
    if (!user) {
        return { error: "Usuário não encontrado." };
    }

    const result = await redeemReward(session.userId, rewardName);
    return {
        success: result.success,
        message: result.message,
    };
}
