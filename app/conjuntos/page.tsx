import { redirect } from "next/navigation";

export default function ConjuntosPage() {
    redirect("/catalogo?categoria=conjuntos");
}
