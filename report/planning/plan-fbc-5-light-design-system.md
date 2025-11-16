---
Generated: 2025-11-16 10:03:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-5
---

## Summary

Goal: Implement a lightweight design system with reusable base components: Text, Heading, Input, Button (with loading), Link, Image.  
User value: Consistent, accessible, performant UI with reusable building blocks.  
Constraints: Strict Clean Architecture; no business logic in components; all styles use tokens from `src/styles/variables/*`; A11y via centralized `src/shared/a11y/*`; TypeScript strict; no inline styles; memoization for performance.  
Non-goals: Full component library; theming beyond current tokens; page-specific components.

## Assumptions & Risks

-   Assumptions: Existing tokens are sufficient or can be minimally extended; Next.js `Image` and `Link` available; React 18.
-   Risks: Token gaps causing delays; inconsistent token usage; A11y regressions if IDs/labels not wired; over-memoization complexity.

## Solution Outline (aligned with architecture)

-   Presentation: Implement base components in `src/presentation/components/ui/` with SCSS in `src/styles/components/`.
-   Shared: Add `src/shared/a11y/ids.ts` and `src/shared/a11y/utils.ts` to centralize accessibility IDs/utilities.
-   Domain/Usecases/Infrastructure: No changes (UI-only).
-   Testing: Add unit tests in `__tests__/presentation/components/ui/` using React Testing Library.
-   Performance: Use `React.memo`, `useCallback`, `useMemo` judiciously; avoid inline creations.
-   A11y: Labels, roles, `aria-*`, live regions for errors/loading where applicable.

## Sub-Tickets

### Sub-Ticket 5.1

**Title:** Create centralized accessibility utilities (`shared/a11y`)

**Rationale:**
Ensure consistent, reusable A11y IDs and helpers across components.

**Acceptance Criteria:**

-   `src/shared/a11y/ids.ts`: constants and base keys for common elements.
-   `src/shared/a11y/utils.ts`: `getAccessibilityId(key: string): string` and helpers for `ariaDescribedByIds(...ids)`.
-   Unit tests for utilities in `__tests__/shared/a11y/*`.

**Definition of Done:**
Code added, typed; tests passing; no lints; used by at least one component.

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** Frontend Developer

**Risk Notes:** Naming convention drift.

---

### Sub-Ticket 5.2

**Title:** Token audit and minimal additions in `styles/variables/*`

**Rationale:**
Ensure tokens exist for spacing, colors, typography needed by components.

**Acceptance Criteria:**

-   Verify `_colors.scss`, `_spacing.scss`, `_typography.scss` cover text, headings, inputs, buttons, links, image placeholders.
-   Add missing variables only if necessary with clear names.
-   No hardcoded values in components.

**Definition of Done:**
Variables updated; references documented; no inline values used in components.

**Estimated Effort:** 2h

**Dependencies:** None

**Owner:** UI Designer

**Risk Notes:** Naming alignment.

---

### Sub-Ticket 5.3

**Title:** Build `Text` and `Heading` components

**Rationale:**
Foundational typography components used by others.

**Acceptance Criteria:**

-   `Text.tsx` supports variants (sm, md, lg), weight, muted; semantic `<p>`; class-based styling from tokens.
-   `Heading.tsx` supports levels h1–h6 via prop; renders correct semantic tag; accessible heading role.
-   SCSS in `styles/components/_text.scss`, `_heading.scss`; tokens only.
-   Memoized where props stable; no inline styles.
-   Tests cover variants and accessibility.

**Definition of Done:**
Components, styles, tests, lints pass.

**Estimated Effort:** 4h

**Dependencies:** Sub-Ticket 5.2

**Owner:** Frontend Developer

**Risk Notes:** Tag/role alignment.

---

### Sub-Ticket 5.4

**Title:** Build `Button` with loading and variants

**Rationale:**
Primary interactive element.

**Acceptance Criteria:**

-   Variants: primary, secondary, ghost; sizes: sm, md, lg; fullWidth; disabled; loading with spinner and `aria-busy="true"` disables click.
-   Keyboard accessible; focus styles via tokens; decorative spinner `aria-hidden="true"`.
-   SCSS `_button.scss`; tokens only; no inline styles.
-   Memoized; callbacks via `useCallback` when passed down.
-   Tests: render, variants, disabled/loading, a11y attributes.

**Definition of Done:**
Component, styles, tests green.

**Estimated Effort:** 5h

**Dependencies:** Sub-Tickets 5.1–5.2, optionally 5.3

**Owner:** Frontend Developer

**Risk Notes:** Spinner alignment, re-render prevention.

---

### Sub-Ticket 5.5

**Title:** Build `Input` with label, helper, and error wiring

**Rationale:**
Forms require accessible inputs.

**Acceptance Criteria:**

-   Props: `id` (required), `label`, `helperText`, `error`, `required`, `disabled`, `type`.
-   Labels use `htmlFor`; error region `role="alert"` with `aria-describedby`; `aria-invalid` when error.
-   SCSS `_input.scss`; tokens only.
-   Tests: label linking, error/live region, disabled, required.

**Definition of Done:**
Component, styles, tests pass.

**Estimated Effort:** 5h

**Dependencies:** Sub-Tickets 5.1–5.2

**Owner:** Frontend Developer

**Risk Notes:** ID wiring consistency.

---

### Sub-Ticket 5.6

**Title:** Build `Link` wrapper

**Rationale:**
Normalize internal/external behavior and styling.

**Acceptance Criteria:**

-   Wraps `next/link`; detects external via prop; sets `target="_blank"` + `rel="noopener noreferrer"` when external.
-   Underline and focus styles via tokens; `aria-label` optional.
-   SCSS `_link.scss`; tokens only; memoized.
-   Tests: internal vs external behavior, attributes, focus styles presence via class.

**Definition of Done:**
Component, styles, tests pass.

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 5.2

**Owner:** Frontend Developer

**Risk Notes:** Next.js Link nuances.

---

### Sub-Ticket 5.7

**Title:** Build `Image` wrapper

**Rationale:**
Enforce optimized images and alt text.

**Acceptance Criteria:**

-   Wraps `next/image`; requires `alt`, `width`, `height`; supports `priority`.
-   Prevents layout shift; optional `placeholder="blur"` support when src allows.
-   SCSS `_image.scss`; tokens for radii/spacings if needed.
-   Tests: required props, priority, alt enforcement.

**Definition of Done:**
Component, styles, tests pass.

**Estimated Effort:** 3h

**Dependencies:** Sub-Ticket 5.2

**Owner:** Frontend Developer

**Risk Notes:** Next Image constraints.

---

### Sub-Ticket 5.8

**Title:** Integration demo and documentation snippets

**Rationale:**
Validate usage and provide examples.

**Acceptance Criteria:**

-   Minimal demo usage in a temporary page or story (no business logic).
-   Component README snippets or JSDoc explaining props and a11y behavior.

**Definition of Done:**
Examples compile; code owners review; no lints.

**Estimated Effort:** 2h

**Dependencies:** Sub-Tickets 5.3–5.7

**Owner:** Frontend Developer

**Risk Notes:** Scope creep; keep minimal.

## Unit Test Spec (Test-First Protocol)

-   Files & paths:
    -   `__tests__/shared/a11y/utils.test.ts`
    -   `__tests__/presentation/components/ui/Text.test.tsx`
    -   `__tests__/presentation/components/ui/Heading.test.tsx`
    -   `__tests__/presentation/components/ui/Button.test.tsx`
    -   `__tests__/presentation/components/ui/Input.test.tsx`
    -   `__tests__/presentation/components/ui/Link.test.tsx`
    -   `__tests__/presentation/components/ui/Image.test.tsx`
-   Test names (describe/it):
    -   A11y utils: describe('getAccessibilityId') / it('returns stable prefixed id'), it('combines describedby ids')
    -   Text/Heading: it('renders correct tag/role'), it('applies variant classes')
    -   Button: it('shows spinner when loading'), it('sets aria-busy'), it('disables on loading'), it('applies variants')
    -   Input: it('links label via htmlFor/id'), it('renders error region with role="alert"'), it('sets aria-invalid')
    -   Link: it('renders external attributes when external'), it('uses Next Link for internal')
    -   Image: it('requires alt/size'), it('supports priority prop')
-   Mocks/fixtures: Jest DOM, Next.js `next/link` and `next/image` testing stubs if required.
-   Edge cases: Missing ids, conflicting `aria-describedby`, loading+disabled, external link without rel, image without alt.
-   Coverage target: ≥90% for components and a11y utilities.
-   Mapping AC → Tests: Each component AC reflected by at least one test as above.
-   Status: tests proposed.

## Agent Prompts

-   Unit Test Coach:  
    "Generate Jest + React Testing Library tests (TypeScript) for the following components and utilities, placed under **tests**/..., mirroring paths. Cover accessibility attributes, variants, disabled/loading states, and edge cases. Target 90% coverage. Components: Text, Heading, Button, Input, Link, Image. Utilities: shared/a11y/utils.ts. Use jest.setup.ts and avoid testing implementation details; focus on behavior."

-   Architecture-Aware Dev:  
    "Implement base UI components (Text, Heading, Button with loading, Input, Link, Image) in src/presentation/components/ui/ with SCSS in src/styles/components/_. Use tokens only from src/styles/variables/_. No business logic, no inline styles. Memoize appropriately. Add shared a11y utilities in src/shared/a11y/\*. Ensure props typed with 'type' and components exported as default arrow functions."

-   UI Designer:  
    "Define minimal SCSS in src/styles/components/_ leveraging variables in src/styles/variables/_. Ensure focus states visible, spacing consistent, and contrast meets WCAG AA. Avoid hardcoded values; extend tokens if necessary."

-   QA & Test Coach:  
    "Create a test plan to validate accessibility (labels, roles, aria-\*), keyboard navigation, focus indicators, and visual consistency for base UI components. Include VoiceOver checks and axe scans. Verify no inline styles and only tokens used."

-   Architecture Guardian:  
    "Verify Clean Architecture compliance: presentation-only components; shared a11y utilities; no domain/usecases/infrastructure imports. Ensure TypeScript strict, no 'any', memoization where appropriate, and tokens-only styling."

## Open Questions

-   Do we need additional variants (danger/success) for Button initially? Yes
-   Should Text support truncation/line clamp utilities out-of-the-box? Yes
-   Should Input include prefix/suffix icons in v1 or defer to v2? v1
-   Any brand guidelines for link underline behavior and focus ring color beyond existing tokens? no, follow the current colors or add some who match the currents one

## MVP Cut List

-   Defer ghost button and image placeholder blur if time-constrained.
-   Provide only h1–h3 in Heading for MVP, add h4–h6 later.
-   Limit Text variants to sm/md to start.
