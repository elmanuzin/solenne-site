export const CART_STORAGE_KEY = "solenne-cart";
export const DELIVERY_STORAGE_KEY = "solenne-delivery";

const WHATSAPP_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5543988044801";

export type CartItem = {
    productId: string;
    nome: string;
    preco: number;
    tamanho: string;
    cor: string;
    url: string;
    image: string;
    quantity: number;
};

export type DeliveryMethod = "uber" | "pickup";

export type AddressData = {
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
};

export type CartMessageOptions = {
    city?: string;
    deliveryMethod?: DeliveryMethod;
    address?: AddressData | null;
};

export function getCartItemKey(item: CartItem): string {
    return `${item.productId}:${item.tamanho}:${item.cor}`.toLowerCase();
}

export function buildCartWhatsAppMessage(items: CartItem[], options: CartMessageOptions = {}): string {
    if (!items.length) return "Oi! Gostaria de fazer um pedido na Solenne ✨";

    const { city = "", deliveryMethod, address } = options;
    const lines = ["Oi! 💛", "", "Gostei dessas peças:", ""];

    const seen = new Set<string>();
    for (const item of items) {
        if (!seen.has(item.productId)) {
            seen.add(item.productId);
            if (item.preco > 0) {
                const price = item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                lines.push(`• ${item.nome} — ${price}`);
            } else {
                lines.push(`• ${item.nome}`);
            }
        }
    }

    if (city) lines.push("", `Sou de ${city} 😊`);

    if (deliveryMethod === "uber") {
        lines.push("", "Gostaria de entrega por Uber 🚗");
        if (address?.rua) {
            const street = [address.rua, address.numero].filter(Boolean).join(", ");
            const extra = address.complemento ? ` - ${address.complemento}` : "";
            const district = [address.bairro, `${address.cidade}/${address.estado}`].filter(Boolean).join(" - ");
            lines.push("", "Endereço:", `${street}${extra}`, district);
        }
        lines.push("", "Pode calcular o valor do envio?");
    } else if (deliveryMethod === "pickup") {
        lines.push("", "Gostaria de retirar na loja 📍", "Pode me passar o endereço?");
    } else {
        lines.push("", "Queria saber se ainda está disponível e como funciona o envio!");
    }

    return lines.join("\n");
}

export function buildCartWhatsAppLink(items: CartItem[], options: CartMessageOptions = {}): string {
    const message = buildCartWhatsAppMessage(items, options);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
