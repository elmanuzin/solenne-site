"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, LayoutGrid, Shirt, Sparkles } from "lucide-react";

const navItems = [
    { label: "Início", href: "/", icon: Home, exact: true },
    { label: "Catálogo", href: "/catalogo", icon: LayoutGrid, exact: false },
    { label: "Vestidos", href: "/catalogo?categoria=vestidos", icon: Shirt, exact: false },
    { label: "Novidades", href: "/catalogo?novidades=true", icon: Sparkles, exact: false },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (pathname.startsWith("/admin")) return null;

    function isActive(href: string) {
        const [path, query] = href.split("?");
        if (path !== pathname) return false;
        if (!query) return pathname === path && !searchParams.toString();
        const params = new URLSearchParams(query);
        for (const [key, value] of params.entries()) {
            if (searchParams.get(key) !== value) return false;
        }
        return true;
    }

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-brand-border/60 bg-brand-bg/95 backdrop-blur-md"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div className="flex items-stretch h-14">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide transition-colors touch-target ${
                                active ? "text-brand-accent" : "text-brand-muted"
                            }`}
                        >
                            <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
