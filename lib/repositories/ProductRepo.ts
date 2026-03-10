import { getAllProducts, updateProductStock, DBProduct } from "@/lib/db";

// Mock Repository Pattern
// In a real app, this would query Supabase/Postgres
export const ProductRepo = {
    getAll: async (): Promise<DBProduct[]> => {
        return getAllProducts();
    },

    updateStock: async (id: string, stock: number) => {
        return updateProductStock(id, stock);
    },

    bulkUpdateStock: async (updates: { id: string; stock: number }[]) => {
        const results = [];
        for (const update of updates) {
            const res = await updateProductStock(update.id, update.stock);
            if (res) results.push(res);
        }
        return results;
    },

    resetAllStock: async () => {
        const products = await getAllProducts();
        await Promise.all(products.map((p) => updateProductStock(p.id, 0)));
        return true;
    },

    setAllStock: async (stock: number) => {
        const products = await getAllProducts();
        await Promise.all(products.map((p) => updateProductStock(p.id, stock)));
        return true;
    }
};
