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
    if (!items.length) return "Olá! Gostaria de fazer um pedido na Solenne ✨";

    const names = items.map((item) => item.nome);
    let productPhrase: string;

    if (names.length === 1) {
        productPhrase = `do ${names[0]}`;
    } else if (names.length === 2) {
        productPhrase = `do ${names[0]} e do ${names[1]}`;
    } else {
        const middle = names.slice(1, -1).join(", ");
        productPhrase = `do ${names[0]}, ${middle} e ${names[names.length - 1]}`;
    }

    return `Gostei ${productPhrase} 😍`;
}

export function buildCartWhatsAppLink(items: CartItem[]): string {
    const message = buildCartWhatsAppMessage(items);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
