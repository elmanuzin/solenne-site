# PROJ-002: Solenne Premium Upgrade Plan

## 1. Project Context
**Goal:** Transform the current catalog MVP into a premium, production-ready fashion platform.
**Stack:** Next.js 14 (App Router), Tailwind CSS v4, Supabase (Arch), WhatsApp Model.
**Core Value:** Loyalty Club integration + "Sacola" conversion flow.

## 2. Implementation Strategy
We will execute this in 4 distinct phases to maintain stability.
- **Phase A:** Core UX & Conversion (Home, Catalog, Product)
- **Phase B:** Club Experience (Login, Dashboard)
- **Phase C:** Admin & Data (Supabase Migration, Security)
- **Phase D:** Performance & SEO Polish

---

## 3. Detailed Task Breakdown

### Phase A: Core UX & Conversion
*Objectives: Increase engagement and average order value (AOV).*

#### 1. Home Conversion [High Impact]
- [ ] **Hero Section Redesign:** Implement full-screen video background or high-res slider with "Shop Collection" CTA.
- [ ] **Category Marquee:** Auto-scrolling marquee of categories (Vestidos, Body,etc.) for immediate discovery.
- [ ] **"Best Sellers" Carousel:** Add horizontal scroll component for featured products.
- [ ] **Social Proof Section:** "Quem usa Solenne" - Instagram feed integration or customer testimonials.
- [ ] **WhatsApp Floating Action:** Add "pulsing" animation to the WhatsApp button to draw attention.

#### 2. Catalog UX (Listing Pages)
- [ ] **Filters & Sorting:** Add slide-over filter menu (Size, Color, Price) mobile-optimized.
- [ ] **Quick View:** Implement modal to view product details without leaving the catalog.
- [ ] **Image Hover:** Show secondary product image (model back/detail) on hover.
- [ ] **Load More:** Infinite scroll or "Load More" button instead of pagination.

#### 3. Product Page UX
- [ ] **Image Gallery:** Mobile swipeable gallery with zoom capability.
- [ ] **Sticky "Add to Bag":** On mobile, keep the CTA stuck to the bottom of the screen.
- [ ] **"Sacola" (WhatsApp Cart):** 
    - Create a global Cart Context.
    - "Adicionar à Sacola" button adds item.
    - Cart modal shows summary.
    - "Finalizar no WhatsApp" sends ONE message with all items.
- [ ] **Related Products:** "Combina com..." section suggesting matching items.

### Phase B: Club Experience
*Objectives: Make loyalty feel premium and exclusive.*

#### 4. Club Login UX
- [ ] **Magic Link / OTP:** Replace password with Email OTP (via Supabase) for frictionless login.
- [ ] **Branded Form:** Split screen layout (Brand Image Left / Login Form Right).
- [ ] **Feedback:** Clear error messages and loading spinners.

#### 5. Dashboard UI (Customer)
- [ ] **Animation:** Animate stamp fill (pop/confetti effect) when a new timestamp is detected.
- [ ] **Reward Unlock:** "Locked" state for rewards (greyscale + padlock icon) -> "Unlocked" (Gold border + glowing effect).
- [ ] **Progress Bar:** Visual bar alongside the stamps (e.g., "Faltam 3 selos para o seu prêmio").

### Phase C: Admin & Data
*Objectives: Secure data and streamline operations.*

#### 6. Admin Panel UX
- [ ] **Mobile Admin:** Optimize tables for mobile view (Card view instead of rows on small screens).
- [ ] **Quick Actions:** "Scan QR" feature (mock) for finding customers quickly.
- [ ] **Bulk Edits:** Allow selecting multiple products to update stock/price.
- [ ] **Sales/Redemption Chart:** Add Recharts library for visual trends.

#### 7. Security Hardening
- [ ] **Rate Limiting:** Implement `upstash/ratelimit` or custom middleware on auth routes.
- [ ] **Input Validation:** Enforce strict Zod schemas on all server actions.
- [ ] **Headers:** Add security headers (CSP, X-Frame-Options) in `next.config.ts`.
- [ ] **Supabase RLS:** Ensure Row Level Security policies are strict (Users can only read own data).

### Phase D: Optimize & Polish
*Objectives: 100/100 Lighthouse score and SEO domination.*

#### 8. Mobile Optimization
- [ ] **Touch Targets:** Ensure all buttons are min 44px height.
- [ ] **Bottom Navigation:** Move key nav items to a bottom bar for thumb reachability.
- [ ] **Prevent Zoom:** Disable auto-zoom on inputs (font-size 16px rule).

#### 9. SEO (Search Engine Optimization)
- [ ] **Metadata:** Implement dynamic `generateMetadata` for every product/category page.
- [ ] **JSON-LD:** Add structured data for "Product", "BreadcrumbList", and "LocalBusiness".
- [ ] **Sitemap:** Generate `sitemap.xml` and `robots.txt`.
- [ ] **Canonical URLs:** Ensure preventing duplicate content issues.

#### 10. Performance
- [ ] **Image Optimization:** Strict `sizes` attribute on `next/image` to prevent serving desktop images on mobile.
- [ ] **Font Loading:** Self-host fonts or use `next/font` with swap strategy.
- [ ] **Bundle Analysis:** Check for heavy dependencies (e.g., big chart libs or moment.js).
- [ ] **Lazy Loading:** Defer loading of below-fold components (Footer, Reviews).

---

## 4. Verification Plan

| Phase | Metric | Target |
|-------|--------|--------|
| A | Homepage LCP | < 2.5s |
| A | Cart Add Rate | Increase |
| B | Login Success | 100% |
| C | Security Score | A+ |
| D | Lighthouse | > 90 All |
