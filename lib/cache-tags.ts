export const CACHE_TAGS = {
    adminProducts: "admin-products",
    adminCustomers: "admin-customers",
    adminStats: "admin-stats",
    adminOrders: "admin-orders",
    siteBanner: "site-banner",
    productViews: "product-views",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
