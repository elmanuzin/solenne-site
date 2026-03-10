const WHATSAPP_NUMBER = "5543988044801";

function buildWhatsAppLink(message: string): string {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function gerarLinkWhatsApp(nome: string, cor: string, tamanho: string): string {
    const mensagem = `Olá! Vi no site o ${nome} ${cor} no tamanho ${tamanho} e gostaria de comprar.`;
    return buildWhatsAppLink(mensagem);
}

export function generateLoyaltyInquiryLink(): string {
    const mensagem =
        "Oi! Vim pelo site da Solenne e gostaria de consultar quantos selos eu já tenho no meu cartão fidelidade 💋";
    return buildWhatsAppLink(mensagem);
}

export function generateReferralInquiryLink(): string {
    const mensagem =
        "Oi! Vim pelo site da Solenne e gostaria de saber como funciona o cartão de indicação e como registrar uma amiga 💋";
    return buildWhatsAppLink(mensagem);
}

export function generateProductMessage(
    productName: string,
    color: string,
    size: string,
    price: number
): string {
    const formattedPrice = price.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
    });

    const message = [
        "Olá, vim pelo site da Solenne e quero finalizar meu pedido ✨",
        "",
        `🛍 Produto: ${productName}`,
        `🎨 Cor: ${color}`,
        `📏 Tamanho: ${size}`,
        `💰 Valor: R$ ${formattedPrice}`,
        "",
        "Pode calcular a entrega via Uber para Londrina?",
    ].join("\n");

    return buildWhatsAppLink(message);
}

export function generateProductAvailabilityMessage(
    productName: string,
    size: string,
    color: string,
    productUrl: string
): string {
    const message = [
        "Olá! Vi este produto no site Solenne.",
        "",
        `Produto: ${productName}`,
        `Tamanho: ${size}`,
        `Cor: ${color}`,
        "",
        "Você pode confirmar se está disponível?",
        "",
        "Link do produto:",
        productUrl,
    ].join("\n");

    return buildWhatsAppLink(message);
}

export function generateClubRewardMessage(croppedName: string): string {
    const message = [
        "Olá, completei 10 selos e quero resgatar meu cropped exclusivo 💋",
        "",
        `🎁 Escolha: ${croppedName}`,
        "Meu nome:",
        "Meu bairro/CEP:",
    ].join("\n");

    return buildWhatsAppLink(message);
}

export function generateDefaultMessage(): string {
    const message = "Olá! Vim pelo site da Solenne e gostaria de mais informações ✨";
    return buildWhatsAppLink(message);
}
