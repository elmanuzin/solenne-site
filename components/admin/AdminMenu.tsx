"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/clientes", label: "Clientes" },
    { href: "/admin/banner", label: "Banner" },
    { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminMenu() {
    const pathname = usePathname();

    if (pathname === "/admin/login") {
        return null;
    }

    return (
        <div className="border-b border-brand-border bg-white/70 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-3">
                <nav className="flex flex-wrap items-center gap-2">
                    {items.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-brand-accent text-white"
                                        : "bg-white text-brand-text border border-brand-border hover:bg-brand-bg"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
