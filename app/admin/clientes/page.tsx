import ClientesClient from "@/components/admin/ClientesClient";
import {
    listAdminCustomers,
    type AdminCustomerRecord,
} from "@/services/admin-client.service";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
    let customers: AdminCustomerRecord[] = [];

    try {
        customers = await listAdminCustomers();
    } catch (error) {
        console.error("Erro ao carregar clientes no admin:", error);
    }

    return <ClientesClient initialCustomers={customers} />;
}
