import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";
import { listCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
    const products = await listCatalogProducts();

    return (
        <Suspense
            fallback={
                <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 text-center">
                    <p className="text-brand-muted">Carregando catálogo...</p>
                </div>
            }
        >
            <CatalogoClient initialProducts={products} />
        </Suspense>
    );
}
