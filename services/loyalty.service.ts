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
export function addStamp(userId: string): DBUser | null {
    const user = getUserById(userId);
    if (!user) return null;
    if (user.stamps >= MAX_STAMPS) return user;
    return updateStamps(userId, user.stamps + 1);
}

export function removeStamp(userId: string): DBUser | null {
    const user = getUserById(userId);
    if (!user) return null;
    if (user.stamps <= 0) return user;
    return updateStamps(userId, user.stamps - 1);
}

export function resetStamps(userId: string): DBUser | null {
    return updateStamps(userId, 0);
}

// --- INDICAÇÃO (Referrals) ---
export function addReferralStamp(userId: string): DBUser | null {
    const user = getUserById(userId);
    if (!user) return null;
    if (user.referralStamps >= MAX_STAMPS) return user;
    return updateReferralStamps(userId, user.referralStamps + 1);
}

export function removeReferralStamp(userId: string): DBUser | null {
    const user = getUserById(userId);
    if (!user) return null;
    if (user.referralStamps <= 0) return user;
    return updateReferralStamps(userId, user.referralStamps - 1);
}

export function resetReferralStamps(userId: string): DBUser | null {
    return updateReferralStamps(userId, 0);
}

export function canRedeem(userId: string): boolean {
    const user = getUserById(userId);
    if (!user) return false;
    // Can redeem if EITHER card is full
    return user.stamps >= MAX_STAMPS || user.referralStamps >= MAX_STAMPS;
}

export function redeemReward(
    userId: string,
    rewardName: string
): { success: boolean; user: DBUser | null; message: string } {
    const user = getUserById(userId);
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

    createOrder({
        user_id: userId,
        product_name: `[RESGATE] ${rewardName}`,
        size: "Único",
        price: 0,
        generates_stamp: false,
    });

    const updated = canRedeemFidelidade
        ? updateStamps(userId, 0)
        : updateReferralStamps(userId, 0);

    return {
        success: true,
        user: updated,
        message: `Resgate de "${rewardName}" realizado com sucesso.`,
    };
}

export function listCustomers(): (DBUser & { ordersCount: number })[] {
    return getCustomers().map((user) => ({
        ...user,
        ordersCount: getOrdersByUserId(user.id).length,
    }));
}

export function getStats() {
    const customers = getCustomers();
    const orders = getAllOrders();
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
