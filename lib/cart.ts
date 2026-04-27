export const CART_STORAGE_KEY = "solenne-cart";
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

export function getCartItemKey(item: CartItem): string {
    return `${item.productId}:${item.tamanho}:${item.cor}`.toLowerCase();
}

export function buildCartWhatsAppMessage(items: CartItem[]): string {
    if (!items.length) return "Oi! Gostaria de fazer um pedido na Solenne ✨";

    const lines = ["Oi! 💛", "Gostei dessas peças:"];

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

    lines.push("", "Sou de _______ 😊", "", "Você pode me ajudar a finalizar meu pedido?");

    return lines.join("\n");
}

export function buildCartWhatsAppLink(items: CartItem[]): string {
    const message = buildCartWhatsAppMessage(items);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
