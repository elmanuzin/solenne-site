import type { NextConfig } from "next";

const securityHeaders = [
    { key: "X-Content-Type-Options",  value: "nosniff" },
    { key: "X-Frame-Options",         value: "DENY" },
    { key: "X-XSS-Protection",        value: "1; mode=block" },
    { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
];

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "**.supabase.co",
            },
        ],
    },

    async headers() {
        return [
            // Security headers on all routes
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
            // Admin: no cache, no index
            {
                source: "/admin/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
                    { key: "X-Robots-Tag",  value: "noindex, nofollow, noarchive" },
                ],
            },
            // Clube (authenticated area): no cache, no index
            {
                source: "/clube-solenne/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
                    { key: "X-Robots-Tag",  value: "noindex, nofollow, noarchive" },
                ],
            },
            // API routes: no cache, no index
            {
                source: "/api/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store" },
                    { key: "X-Robots-Tag",  value: "noindex, nofollow" },
                ],
            },
        ];
    },
};

export default nextConfig;
