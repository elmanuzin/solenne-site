"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Heart, ChevronDown, Search } from "lucide-react";
import { categories } from "@/lib/data";

const infoLinks = [
    { href: "/como-comprar", label: "Como Comprar" },
    { href: "/entrega", label: "Entrega" },
    { href: "/trocas", label: "Trocas" },
    { href: "/faq", label: "FAQ" },
    { href: "/contato", label: "Contato" },
];

const productLinks = [
    { href: "/conjuntos", label: "Conjuntos" },
    { href: "/body", label: "Body" },
    { href: "/vestidos", label: "Vestidos" },
    { href: "/saias", label: "Saias" },
    { href: "/croppeds", label: "Croppeds" },
    { href: "/shorts", label: "Shorts" },
];

export default function Header() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const productsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                productsMenuRef.current &&
                !productsMenuRef.current.contains(event.target as Node)
            ) {
                setProductsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [searchValue]);

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const term = debouncedSearch || searchValue.trim();
        const target = term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo";
        router.push(target);
        setMobileOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-sm">
            {/* Top announcement bar */}
            <div className="bg-black text-white text-center text-xs py-1.5 px-4 md:px-10 tracking-wider font-medium">
                ✨ Entrega via Uber em Londrina • Frete calculado no WhatsApp ✨
            </div>

            <div className="container-custom">
                {/* Mobile header row */}
                <div className="lg:hidden flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 -ml-2 text-brand-text"
                        aria-label="Abrir menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-brand-text">
                            Solenne
                        </span>
                        <span className="kiss-emoji ml-1" style={{ fontSize: '20px' }}>💋</span>
                    </Link>

                </div>

                {/* Desktop header in a single line */}
                <div className="hidden lg:grid lg:grid-cols-[auto_1fr_auto] items-center gap-6 h-[74px]">
                    <Link href="/" className="flex items-center whitespace-nowrap">
                        <span className="font-heading text-2xl xl:text-3xl font-bold tracking-tight text-brand-text">
                            Solenne
                        </span>
                        <span className="kiss-emoji ml-1" style={{ fontSize: "20px" }}>💋</span>
                    </Link>

                    <nav className="min-w-0 flex items-center justify-center gap-5 xl:gap-7 whitespace-nowrap">
                        <div
                            ref={productsMenuRef}
                            className="relative"
                            onMouseEnter={() => setProductsOpen(true)}
                            onMouseLeave={() => setProductsOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => setProductsOpen((prev) => !prev)}
                                className="flex items-center gap-1 text-sm font-medium text-brand-text hover:text-brand-accent transition-colors uppercase"
                            >
                                Produtos
                                <ChevronDown
                                    size={15}
                                    className={`transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            <div
                                className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50 transition-all duration-200 ${productsOpen
                                    ? "opacity-100 translate-y-0 visible"
                                    : "opacity-0 -translate-y-1 invisible pointer-events-none"
                                    }`}
                            >
                                <div className="w-[620px] rounded-2xl border border-brand-border/70 bg-white shadow-2xl p-8">
                                    <p className="text-xs uppercase tracking-[0.2em] text-brand-muted font-semibold mb-6">
                                        Produtos
                                    </p>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted font-semibold mb-4">
                                                Categorias
                                            </p>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                {productLinks.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setProductsOpen(false)}
                                                        className="block rounded-lg px-2 py-1.5 text-sm text-brand-muted hover:bg-gray-50 hover:text-black transition-colors"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-l border-brand-border/70 pl-8">
                                            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-muted font-semibold mb-4">
                                                Ver todos
                                            </p>
                                            <Link
                                                href="/produtos"
                                                onClick={() => setProductsOpen(false)}
                                                className="block text-base font-semibold text-black hover:text-brand-accent transition-colors"
                                            >
                                                Todos os produtos
                                            </Link>
                                            <p className="text-sm text-brand-muted mt-2">
                                                Veja a coleção completa da Solenne.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {infoLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs text-brand-muted hover:text-brand-text transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearchSubmit} className="relative w-44 xl:w-56">
                            <input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Buscar peça..."
                                className="w-full rounded-full border border-brand-border bg-white px-4 py-2 pr-10 text-sm text-brand-text shadow-sm outline-none focus:ring-1 focus:ring-brand-accent/30"
                                aria-label="Buscar produtos por nome, categoria ou cor"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-brand-muted hover:text-brand-text transition-colors"
                                aria-label="Buscar"
                            >
                                <Search size={15} />
                            </button>
                        </form>

                        <Link
                            href="/clube"
                            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-black hover:opacity-80 transition-opacity"
                        >
                            <Heart size={16} fill="currentColor" className="text-brand-accent" />
                            Clube Solenne
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <nav className="lg:hidden bg-brand-bg">
                    <div className="px-4 md:px-10 py-4 space-y-1">
                        <form onSubmit={handleSearchSubmit} className="relative mb-4">
                            <input
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Buscar peça..."
                                className="w-full rounded-full border border-brand-border bg-white px-4 py-2 pr-10 text-sm text-brand-text shadow-sm outline-none focus:ring-1 focus:ring-brand-accent/30"
                                aria-label="Buscar produtos por nome, categoria ou cor"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-brand-muted hover:text-brand-text transition-colors"
                                aria-label="Buscar"
                            >
                                <Search size={15} />
                            </button>
                        </form>

                        <p className="text-xs uppercase tracking-widest text-brand-muted mb-2 font-medium">
                            Categorias
                        </p>
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/catalogo?categoria=${cat.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2.5 text-sm font-medium text-brand-text hover:text-brand-accent transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}

                        <Link
                            href="/clube"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 py-2.5 text-sm font-medium text-black"
                        >
                            <Heart size={16} fill="currentColor" className="text-brand-accent" />
                            Clube Solenne <span className="kiss-emoji" style={{ fontSize: '16px' }}>💋</span>
                        </Link>

                        <p className="text-xs uppercase tracking-widest text-brand-muted mb-2 font-medium">
                            Informações
                        </p>
                        {infoLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
