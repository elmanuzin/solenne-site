import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    emptyMessage?: string;
}

export default function ProductGrid({
    products,
    emptyMessage = "Nenhum produto encontrado.",
}: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-brand-muted text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
