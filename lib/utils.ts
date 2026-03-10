export function formatPrice(price: number): string {
    return price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}
