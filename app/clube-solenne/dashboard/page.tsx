import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { getOrdersByUserId } from "@/lib/db";
import { clubRewards } from "@/lib/data";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getCurrentSession();

    if (!session) {
        redirect("/clube-solenne/login");
    }

    const user = getUserById(session.userId);
    if (!user) {
        redirect("/clube-solenne/login");
    }

    const orders = getOrdersByUserId(user.id);

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        stamps: user.stamps,
        referralStamps: user.referralStamps, // Added
        created_at: user.created_at,
    };

    const ordersData = orders.map((o) => ({
        id: o.id,
        product_name: o.product_name,
        size: o.size,
        price: o.price,
        created_at: o.created_at,
        generates_stamp: o.generates_stamp,
    }));

    return (
        <DashboardClient
            user={userData}
            orders={ordersData}
            rewards={clubRewards}
        />
    );
}
