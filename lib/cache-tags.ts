export const CACHE_TAGS = {
    // Admin
    adminProducts:  "admin-products",
    adminCustomers: "admin-customers",
    adminStats:     "admin-stats",
    adminOrders:    "admin-orders",
    // Site
    siteBanner:     "site-banner",
    productViews:   "product-views",
    // Catálogo — invalidados pelo admin ao salvar produto
    catalog:        "catalog",
    catalogFeatured: "catalog-featured",
    catalogNew:      "catalog-new",
    catalogBestSeller: "catalog-best-seller",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
