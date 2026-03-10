import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";
import { listCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default function CatalogoPage() {
    const products = listCatalogProducts();

    return (
        <Suspense
            fallback={
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
                    <p className="text-brand-muted">Carregando catálogo...</p>
                </div>
            }
        >
            <CatalogoClient initialProducts={products} />
        </Suspense>
    );
}
