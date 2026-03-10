import {
    getUserById,
    updateStamps,
    updateReferralStamps,
    getCustomers,
    getOrdersByUserId,
    getAllOrders,
    createOrder,
} from "@/lib/db";
import type { DBUser } from "@/lib/db";

const MAX_STAMPS = 10;

// --- FIDELIDADE (Compras) ---
export async function addStamp(userId: string): Promise<DBUser | null> {
    const user = await getUserById(userId);
    if (!user) return null;
    if (user.stamps >= MAX_STAMPS) return user;
    return updateStamps(userId, user.stamps + 1);
}

export async function removeStamp(userId: string): Promise<DBUser | null> {
    const user = await getUserById(userId);
    if (!user) return null;
    if (user.stamps <= 0) return user;
    return updateStamps(userId, user.stamps - 1);
}

export async function resetStamps(userId: string): Promise<DBUser | null> {
    return updateStamps(userId, 0);
}

// --- INDICAÇÃO (Referrals) ---
export async function addReferralStamp(userId: string): Promise<DBUser | null> {
    const user = await getUserById(userId);
    if (!user) return null;
    if (user.referralStamps >= MAX_STAMPS) return user;
    return updateReferralStamps(userId, user.referralStamps + 1);
}

export async function removeReferralStamp(userId: string): Promise<DBUser | null> {
    const user = await getUserById(userId);
    if (!user) return null;
    if (user.referralStamps <= 0) return user;
    return updateReferralStamps(userId, user.referralStamps - 1);
}

export async function resetReferralStamps(userId: string): Promise<DBUser | null> {
    return updateReferralStamps(userId, 0);
}

export async function canRedeem(userId: string): Promise<boolean> {
    const user = await getUserById(userId);
    if (!user) return false;
    // Can redeem if EITHER card is full
    return user.stamps >= MAX_STAMPS || user.referralStamps >= MAX_STAMPS;
}

export async function redeemReward(
    userId: string,
    rewardName: string
): Promise<{ success: boolean; user: DBUser | null; message: string }> {
    const user = await getUserById(userId);
    if (!user) {
        return { success: false, user: null, message: "Usuário não encontrado." };
    }

    const canRedeemFidelidade = user.stamps >= MAX_STAMPS;
    const canRedeemIndicacao = user.referralStamps >= MAX_STAMPS;

    if (!canRedeemFidelidade && !canRedeemIndicacao) {
        return {
            success: false,
            user,
            message: `Você precisa de ${MAX_STAMPS} selos para resgatar.`,
        };
    }

    await createOrder({
        user_id: userId,
        product_name: `[RESGATE] ${rewardName}`,
        size: "Único",
        price: 0,
        generates_stamp: false,
    });

    const updated = canRedeemFidelidade
        ? await updateStamps(userId, 0)
        : await updateReferralStamps(userId, 0);

    return {
        success: true,
        user: updated,
        message: `Resgate de "${rewardName}" realizado com sucesso.`,
    };
}

export async function listCustomers(): Promise<(DBUser & { ordersCount: number })[]> {
    const customers = await getCustomers();
    const counts = await Promise.all(
        customers.map(async (user) => ({
            id: user.id,
            ordersCount: (await getOrdersByUserId(user.id)).length,
        }))
    );

    const countById = new Map<string, number>();
    counts.forEach((item) => countById.set(item.id, item.ordersCount));

    return customers.map((user) => ({
        ...user,
        ordersCount: countById.get(user.id) || 0,
    }));
}

export async function getStats() {
    const customers = await getCustomers();
    const orders = await getAllOrders();
    const totalStamps = customers.reduce((sum, u) => sum + u.stamps, 0);
    const totalReferralStamps = customers.reduce((sum, u) => sum + u.referralStamps, 0);
    const totalRedemptions = orders.filter((o) =>
        o.product_name.startsWith("[RESGATE]")
    ).length;

    return {
        totalStamps,
        totalReferralStamps,
        totalRedemptions,
        totalCustomers: customers.length,
    };
}
