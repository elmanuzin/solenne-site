# PLAN: Clube Solenne Landing & Auth Adjustment

Overview of changes to streamline the Clube Solenne experience by removing self-registration, updating the landing page to act as a physical card preview, and standardizing all kiss emojis.

## Project Type
WEB (Next.js App Router)

## Success Criteria
- [ ] `/clube-solenne` landing page shows "Acessar minha conta" and no register options.
- [ ] Landing page features a physical-style "Cartão Indicação" instead of the black block.
- [ ] Login page has a notice about automatic access and no "Cadastre-se" toggle.
- [ ] Global audit confirms all kiss icons are now `<span className="kiss-emoji">💋</span>`.
- [ ] Auth flow correctly redirects logged-in users from the landing page to the dashboard.

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Framer Motion
- Lucide React

## File Structure
- `app/clube-solenne/page.tsx` (Landing Page)
- `app/clube-solenne/login/page.tsx` (Login Page Cleanup)
- `components/clube/PhysicalCardPreview.tsx` (New component for landing)
- `components/layout/Header.tsx`, `Footer.tsx`, `Home`, etc. (Emoji cleanup)

## Task Breakdown

### Phase 1: Foundation & Cleanup
| Task ID | Name | Agent | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|-------|----------|--------------|-------------------------|
| T1.1 | Global Emoji Pente-fino | `frontend-specialist` | P0 | None | Find all legacy kiss icons (SVG/Image/Text) → Replace with `<span className="kiss-emoji">💋</span>` → Verify across Home, Catalog, Header, Footer. |
| T1.2 | Remove Registration from UI | `frontend-specialist` | P0 | None | Remove `isRegister` state and toggle from `LoginPage` → UI shows only Login form → Verify "Cadastre-se" is gone. |

### Phase 2: Landing Page Refactor
| Task ID | Name | Agent | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|-------|----------|--------------|-------------------------|
| T2.1 | Landing Page Auth Logic | `backend-specialist` | P1 | None | Check `getCurrentSession()` in `clube-solenne/page.tsx` → `redirect("/clube-solenne/dashboard")` if session exists. |
| T2.2 | Landing Page UI Updates | `frontend-specialist` | P1 | T2.1 | Add "Acessar minha conta" button + Access Notice + WhatsApp Support link → Confirm branding (#C63A3A) and text match. |
| T2.3 | New Physical Card Component | `frontend-specialist` | P1 | None | Create `PhysicalCardPreview` with #FFF6DA background, mesh patterns, and 2x5 grid → Matches Indicação physical card style. |
| T2.4 | Replace Black Block | `frontend-specialist` | P1 | T2.3 | Swap the current black loyalty visual with the new `PhysicalCardPreview` (Empty state) → Visual check for premium feel. |

### Phase 3: Login Page & Informational Text
| Task ID | Name | Agent | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|-------|----------|--------------|-------------------------|
| T3.1 | Login Page Notice | `frontend-specialist` | P2 | T1.2 | Add centered access notice below title in `LoginPage` → "Seu acesso é enviado automaticamente..." visible. |
| T3.2 | "How it works" Update | `frontend-specialist` | P2 | None | Update text in "Como funciona?" section to mention auto-access generation. |

## Phase X: Verification
- [ ] Run `npm run build` to ensure no build errors.
- [ ] Run `npx tsc --noEmit` for type safety.
- [ ] Manual check: Logged in users go straight to dashboard.
- [ ] Manual check: No "Create account" button anywhere.
- [ ] Manual check: Emoji proportions and style (.kiss-emoji) are consistent.
