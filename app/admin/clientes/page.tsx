import ClientesClient from "@/components/admin/ClientesClient";
import { listAdminCustomers } from "@/services/admin-client.service";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
    const customers = await listAdminCustomers();
    return <ClientesClient initialCustomers={customers} />;
}
