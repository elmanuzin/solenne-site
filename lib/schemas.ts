import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().trim().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const StampActionSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido"),
    cardType: z.enum(["fidelidade", "indicacao"]).optional(), // Added cardType
});

export const StockActionSchema = z.object({
    productId: z.string().min(1, "ID do produto inválido"),
    quantity: z.number().int().optional(),
});

export const ProductIdSchema = z.object({
    productId: z.string().min(1, "ID do produto inválido"),
});

export const ProductFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nome do produto inválido")
        .max(120, "Nome do produto muito longo"),
    category: z.enum(["conjuntos", "body", "vestidos", "saias", "croppeds", "shorts"]),
    color: z.string().trim().min(2, "Cor inválida").max(60, "Cor inválida"),
    price: z.number().min(0, "Preço inválido").max(100000, "Preço inválido"),
    stock: z.number().int().min(0, "Estoque inválido").max(100000, "Estoque inválido"),
    description: z
        .string()
        .trim()
        .min(5, "Descrição muito curta")
        .max(2000, "Descrição muito longa"),
    sizes: z
        .array(z.enum(["P", "M", "G", "GG", "Único"]))
        .min(1, "Selecione ao menos um tamanho")
        .max(5, "Selecione no máximo 5 tamanhos")
        .refine((sizes) => new Set(sizes).size === sizes.length, {
            message: "Tamanhos duplicados não são permitidos",
        }),
    featured: z.boolean().default(false),
    newArrival: z.boolean().default(false),
    bestSeller: z.boolean().default(false),
    isLancamento: z.boolean().default(false),
    available: z.boolean().default(true),
});

export const ChangeAdminPasswordSchema = z
    .object({
        currentPassword: z.string().min(6, "Senha atual inválida"),
        newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
        confirmPassword: z.string().min(6, "Confirmação de senha inválida"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "A confirmação da senha não confere",
        path: ["confirmPassword"],
    });
