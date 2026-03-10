import EstoqueClient from "@/components/admin/EstoqueClient";
import { listAdminProducts } from "@/services/admin-product.service";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
    const products = await listAdminProducts();
    return <EstoqueClient initialProducts={products} />;
}
