import type { Category, ClubReward } from "@/types";

export const categories: Category[] = [
    {
        slug: "conjuntos",
        name: "Conjuntos",
        description: "Conjuntos elegantes para todas as ocasiões.",
    },
    {
        slug: "body",
        name: "Body",
        description: "Bodies sofisticados com caimento perfeito.",
    },
    {
        slug: "vestidos",
        name: "Vestidos",
        description: "Vestidos que marcam presença com elegância.",
    },
    {
        slug: "saias",
        name: "Saias",
        description: "Saias femininas com design exclusivo.",
    },
    {
        slug: "croppeds",
        name: "Croppeds",
        description: "Croppeds modernos e cheios de estilo.",
    },
    {
        slug: "shorts",
        name: "Shorts",
        description: "Shorts femininos com corte moderno e confortável.",
    },
];

export function getCategoryBySlug(slug: string): Category | undefined {
    return categories.find((category) => category.slug === slug);
}

// ─── CLUBE SOLENNE REWARDS ────────────────────────────
// These are EXCLUSIVE to the Clube Solenne page.
// They must NOT appear in the main catalog or in the Croppeds category.
export const clubRewards: ClubReward[] = [
    {
        id: "reward-cropped-aurora",
        slug: "reward-cropped-aurora",
        name: "Cropped Aurora",
        description:
            "Exclusivo do Clube Solenne. O Cropped Aurora é um presente especial para nossas clientes fiéis.",
        image: "",
    },
    {
        id: "reward-cropped-estrela",
        slug: "reward-cropped-estrela",
        name: "Cropped Estrela",
        description:
            "Brilhe com o Cropped Estrela. Disponível exclusivamente como recompensa do Clube Solenne.",
        image: "",
    },
    {
        id: "reward-cropped-soleil",
        slug: "reward-cropped-soleil",
        name: "Cropped Soleil",
        description:
            "O Cropped Soleil é elegância exclusiva. Sua recompensa por fazer parte do Clube Solenne.",
        image: "",
    },
];
