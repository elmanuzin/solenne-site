export const CART_STORAGE_KEY = "solenne-cart";
const WHATSAPP_NUMBER = "5543988044801";

export type CartItem = {
    productId: string;
    nome: string;
    preco: number;
    tamanho: string;
    cor: string;
    url: string;
};

export function getCartItemKey(item: CartItem): string {
    return `${item.productId}:${item.tamanho}:${item.cor}`.toLowerCase();
}

export function buildCartWhatsAppMessage(items: CartItem[]): string {
    const lines = [
        "Olá! Vi alguns produtos no site da Solenne e gostaria de confirmar disponibilidade:",
        "",
    ];

    items.forEach((item, index) => {
        lines.push(`Produto: ${item.nome}`);
        lines.push(`Tamanho: ${item.tamanho}`);
        lines.push(`Cor: ${item.cor}`);
        lines.push(`Link: ${item.url}`);
        if (index < items.length - 1) {
            lines.push("");
        }
    });

    lines.push("");
    lines.push("Pode me confirmar por favor? 💋");

    return lines.join("\n");
}

export function buildCartWhatsAppLink(items: CartItem[]): string {
    const message = buildCartWhatsAppMessage(items);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
