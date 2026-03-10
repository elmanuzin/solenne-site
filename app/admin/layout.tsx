import type { Metadata } from "next";
import AdminMenu from "@/components/admin/AdminMenu";

export const metadata: Metadata = {
    title: "Admin | Solenne",
    robots: "noindex, nofollow",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout bg-brand-bg min-h-screen text-brand-text">
            <AdminMenu />
            {children}
        </div>
    );
}
