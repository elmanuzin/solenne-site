export interface Product {
    id: string;
    slug: string;
    name: string;
    category: CategorySlug;
    color: string;
    price: number;
    description: string;
    sizes: SizeOption[];
    image: string;
    stock: number;
    available: boolean;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    isLancamento?: boolean;
    createdAt?: string;
}

export type SizeOption = "P" | "M" | "G" | "GG" | "Único";

export type CategorySlug =
    | "conjuntos"
    | "body"
    | "vestidos"
    | "saias"
    | "croppeds"
    | "shorts";

export interface Category {
    slug: CategorySlug;
    name: string;
    description: string;
}

export interface ClubReward {
    id: string;
    slug: string;
    name: string;
    description: string;
    image: string;
}
