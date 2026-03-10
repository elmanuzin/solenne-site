# Project Plan: Solenne Master Implementation

---
**Goal**: End-to-end implementation of Solenne: a premium, catalog-only e-commerce site with a loyalty program (Clube Solenne) and Admin Dashboard. Focus on security, SEO, and UI/UX consistency.
**Context**: Next.js App Router + TypeScript + Tailwind. Brand colors: #FFF6DA (bg), #111111 (text), #C63A3A (cta).
**Status**: Partial Phase E Completed. Resuming for Final Polish & Verification.

---

## Phase 1: Foundation & Structure (Gap Analysis)
- [ ] **UI Primitives:** Create centralized components (`components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`) to replace scattered utility classes.
- [ ] **SEO Setup:** Implement JSON-LD for Organization and Products. Add OpenGraph placeholders.
- [ ] **WhatsApp Logic:** Verify message encoding and "Disabled until size selected" rule on Product Page.

## Phase 2: Clube Solenne Logic Refinement
- [ ] **Landing Page:** Ensure it acts as a Login Landing page (redirects logged-in users to dashboard).
- [ ] **Dashboard:**
  - [ ] **Game State:** Verify "Rewards hidden until 10 stamps".
  - [ ] **Unlock Flow:** Single "Resgatar" button -> Reveal 3 options.
  - [ ] **Redemption:** WhatsApp message with chosen reward.
- [ ] **Visuals:** Match "Fidelidade Solenne" card design pattern.

## Phase 3: Admin & Database
- [ ] **Adapter Pattern:** Refactor DB calls to use a Repository pattern (mock now, Supabase later).
- [ ] **Admin Panel:**
  - [ ] **Stock:** Highlighting (<5).
  - [ ] **Customer:** Profile view, purchase history (mock), stamp management.
  - [ ] **Security:** `verifyAdminSession` guard on all actions (Already implemented in Phase D, verify coverage).

## Phase 4: Quality & Verification
- [ ] **Lint/Build:** Run `npm run lint` and `tsc --noEmit`.
- [ ] **Responsive Audit:** check mobile layout for all new components.
- [ ] **Final Walkthrough:** Verify all user flows (Guest -> Catalog -> WhatsApp, Member -> Login -> Dashboard -> Redeem).

## Agents
- **Orchestrator:** Manage overall flow.
- **Frontend Specialist:** UI primitives, responsive design.
- **Backend Specialist:** DB adapter, admin logic.
- **Security Auditor:** Verify auth and inputs.
