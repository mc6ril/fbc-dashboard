---
Generated: 2025-11-16 00:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-6
---

### Summary

Goal: Define the initial application navigation structure using Next.js App Router, covering auth and dashboard routes with proper public/private separation and accessibility scaffolding.

User value: Users can sign in/sign up and navigate to core dashboard sections with consistent layout (Navbar/Sidebar + Header), enabling subsequent features to plug into a stable structure.

Constraints:
- Follow Clean Architecture: UI → Hooks → Usecases → Repositories → Supabase.
- No business logic in pages/components; pages will render placeholders and consume hooks later.
- Accessibility landmarks and heading hierarchy required.
- Styling must use SCSS variables from `styles/variables/*`.

Non‑goals:
- Implementing page business content (metrics, tables, forms).
- Implementing Supabase logic or data fetching (scaffold only).
- Implementing final visual design beyond basic DS usage.

### Assumptions & Risks

Assumptions:
- Auth provider and auth state hooks exist or are stubbed to allow guarding private routes.
- Design System primitives (Text, Heading, Link, Container, Card, Button, Input) are available.

Risks:
- Guard logic might be duplicated if not centralized → mitigate by creating a single guard wrapper.
- Navigation info architecture may evolve → keep route structure minimal and extensible.
- A11y regressions if landmarks are inconsistent → provide a shared layout contract.

### Solution Outline (aligned with architecture)

- Presentation (App Router):
  - Create route segments: `/signin`, `/signup`, `/dashboard`, `/dashboard/stats`, `/dashboard/activities`, `/dashboard/catalog`.
  - Add a global dashboard layout with `<nav>`, `<header>`, `<main>` landmarks, and skip link.
  - Add a `RestrictedPage` wrapper component to gate dashboard pages using auth state (from provider), without business logic.
- Presentation Hooks:
  - None needed for scaffolding; later tickets will add data hooks.
- Usecases / Ports / Infrastructure:
  - No changes; this ticket is navigation scaffolding only.
- Styling:
  - Use SCSS modules or global classes; all tokens from `styles/variables/*`.
- Accessibility:
  - Use `shared/a11y/` IDs and helpers for nav landmarks and skip links.

### Sub-Tickets

```markdown
### Sub-Ticket 6.1

**Title:** Scaffold auth routes `/signin` and `/signup` with public layout

**Rationale:**
Public pages are needed for authentication entry points and must use a minimal accessible layout.

**Acceptance Criteria:**

-   [] `src/app/(auth)/signin/page.tsx` renders a placeholder with proper heading and `<main>` landmark
-   [] `src/app/(auth)/signup/page.tsx` renders a placeholder with proper heading and `<main>` landmark
-   [] No business logic or Supabase calls in pages
-   [] Uses DS components for headings/links; all styles via SCSS variables

**Definition of Done:**
-   [] Lint/build pass
-   [] Basic a11y landmarks verified (axe locally)
-   [] Unit smoke test for rendering (if applicable)

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Architecture-Aware Dev

**Risk Notes:** Low risk; ensure consistent heading levels across pages
```

```markdown
### Sub-Ticket 6.2

**Title:** Create dashboard route segment and base layout with Navbar/Sidebar + Header

**Rationale:**
Dashboard pages share common chrome; centralizing landmarks and structure prevents duplication and ensures a11y consistency.

**Acceptance Criteria:**

-   [] `src/app/dashboard/layout.tsx` defines `<nav>`, `<header>`, `<main>` landmarks
-   [] Add skip link and accessible names via `shared/a11y/`
-   [] Navbar/Sidebar and Header placeholders use DS components and SCSS variables
-   [] Responsive structure without layout shifts

**Definition of Done:**
-   [] Lint/build pass
-   [] Axe check for landmarks and roles
-   [] No inline styles or hardcoded values

**Estimated Effort:** 3h

**Dependencies:** 6.1 (optional)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Ensure tokens exist; add missing tokens to `styles/variables/*` if needed
```

```markdown
### Sub-Ticket 6.3

**Title:** Implement `RestrictedPage` wrapper to guard dashboard subtree

**Rationale:**
Private dashboard pages must be guarded using the existing auth state provider while keeping presentation free of business logic.

**Acceptance Criteria:**

-   [] `RestrictedPage` lives in `src/presentation/components/` and only orchestrates auth state
-   [] Reads auth status from provider/store; redirects or shows link to `/signin` when not authenticated
-   [] No Supabase calls; no business logic
-   [] Keyboard-focus-friendly redirect/announcement for denied access (aria-live polite)

**Definition of Done:**
-   [] Lint/build pass
-   [] Basic unit test for rendering behavior with mocked auth state
-   [] A11y announcement present for state change

**Estimated Effort:** 3h

**Dependencies:** 6.2 (layout available)

**Owner:** Architecture-Aware Dev

**Risk Notes:** Avoid flicker; use loading state from provider to defer rendering until ready
```

```markdown
### Sub-Ticket 6.4

**Title:** Scaffold dashboard child routes `/`, `/stats`, `/activities`, `/catalog`

**Rationale:**
Create placeholders under the guarded dashboard to confirm navigation structure and layout wiring.

**Acceptance Criteria:**

-   [] `src/app/dashboard/page.tsx` renders placeholder content and heading
-   [] `src/app/dashboard/stats/page.tsx` renders placeholder content and heading
-   [] `src/app/dashboard/activities/page.tsx` renders placeholder content and heading
-   [] `src/app/dashboard/catalog/page.tsx` renders placeholder content and heading
-   [] All pages render within dashboard layout and `RestrictedPage`

**Definition of Done:**
-   [] Lint/build pass
-   [] A11y landmarks intact in each page
-   [] No business logic; no inline styles

**Estimated Effort:** 2h

**Dependencies:** 6.3

**Owner:** Architecture-Aware Dev

**Risk Notes:** Keep placeholders minimal to avoid premature coupling
```

```markdown
### Sub-Ticket 6.5

**Title:** Add primary navigation links and active state handling

**Rationale:**
Users need discoverable links to all sections; active state improves orientation.

**Acceptance Criteria:**

-   [] Navbar/Sidebar includes links to `/dashboard`, `/dashboard/stats`, `/dashboard/activities`, `/dashboard/catalog`
-   [] Active route is visually indicated; styles from SCSS variables
-   [] Links include appropriate aria-current and accessible names

**Definition of Done:**
-   [] Lint/build pass
-   [] Keyboard navigation tested (Tab/Shift+Tab)
-   [] Axe passes for nav roles and labels

**Estimated Effort:** 2h

**Dependencies:** 6.2, 6.4

**Owner:** Architecture-Aware Dev

**Risk Notes:** Ensure server/client components split is correct for active state
```

### Unit Test Spec (Test-First Protocol)

- Files & paths:
  - `__tests__/presentation/layouts/dashboard-layout.test.tsx` (render landmarks, skip link)
  - `__tests__/presentation/components/restricted-page.test.tsx` (auth gating behavior)
  - `__tests__/presentation/components/navigation.test.tsx` (nav links, aria-current)
- Test names:
  - describe DashboardLayout → it renders nav, header, main landmarks; it exposes skip link
  - describe RestrictedPage → it renders children when authenticated; it announces and redirects when unauthenticated
  - describe Navigation → it renders links with accessible names; it sets aria-current on active link
- Mocks/fixtures:
  - Mock auth provider/store values (authenticated/unauthenticated/loading)
  - Mock Next.js navigation/router as needed
- Edge cases:
  - Loading auth state prevents flicker (no children until resolved)
  - Unauthenticated path announces access restriction
- Coverage target:
  - ≥ 80% on the above components/layouts
- Mapping AC → Tests:
  - Landmarks/skip link → DashboardLayout tests
  - Gating/announcement → RestrictedPage tests
  - Links/active state → Navigation tests
- Status: tests proposed

### Agent Prompts

- Unit Test Coach:
  - “Generate Jest + RTL test files for: dashboard layout landmarks and skip link; RestrictedPage gating behavior with mocked auth store/provider; Navigation links with aria-current. Mirror paths under `__tests__/presentation/...`. Use TypeScript, jest.mock for router/auth. Aim for ≥80% coverage.”
- Architecture-Aware Dev:
  - “Implement `/signin`, `/signup`, and `/dashboard` routes with layout, plus `RestrictedPage`. No business logic; no Supabase; use DS components; SCSS variables only; accessibility landmarks and skip link; centralized a11y IDs from `shared/a11y/`.”
- UI Designer:
  - “Create minimal Navbar/Sidebar + Header styles using tokens from `styles/variables/*`. Provide focus states, visible skip link, and responsive layout. No hardcoded colors/spacing.”
- QA & Test Coach:
  - “Write test plan covering keyboard navigation (Tab order, skip link), aria landmarks, aria-current on active nav, and unauthenticated access handling (announcement + redirect). Validate with axe and screen reader notes.”
- Architecture Guardian:
  - “Verify no Supabase or business logic in pages; ensure `RestrictedPage` only orchestrates auth state; confirm Clean Architecture direction; confirm SCSS tokens and a11y utilities usage.”

### Open Questions

- Should `/signin` and `/signup` share a common `(auth)` layout or remain separate pages?
- Preferred Sidebar vs Navbar for MVP (mobile-first constraints)?
- Which auth loading UX is preferred (skeleton vs spinner vs silent layout)?

### MVP Cut List

- Defer active state styling animations.
- Defer mobile off-canvas navigation; provide simple stacked nav first.
- Defer route-level breadcrumbs; rely on headings initially.

