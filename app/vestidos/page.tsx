import { redirect } from "next/navigation";

export default function VestidosPage() {
    redirect("/catalogo?categoria=vestidos");
}
