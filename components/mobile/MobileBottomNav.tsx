"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, LayoutGrid, Shirt, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

const staticNavItems = [
    { label: "Início", href: "/", icon: Home, exact: true },
    { label: "Catálogo", href: "/catalogo", icon: LayoutGrid, exact: false },
    { label: "Vestidos", href: "/catalogo?categoria=vestidos", icon: Shirt, exact: false },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { itemCount, openDrawer } = useCart();

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
                {staticNavItems.map(({ label, href, icon: Icon }) => {
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

                {/* Carrinho */}
                <button
                    type="button"
                    onClick={openDrawer}
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide text-brand-muted relative touch-target"
                    aria-label="Abrir carrinho"
                >
                    <span className="relative">
                        <ShoppingBag size={20} strokeWidth={1.7} />
                        {itemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-brand-accent text-white text-[9px] font-semibold flex items-center justify-center">
                                {itemCount > 9 ? "9+" : itemCount}
                            </span>
                        )}
                    </span>
                    Carrinho
                </button>
            </div>
        </nav>
    );
}
