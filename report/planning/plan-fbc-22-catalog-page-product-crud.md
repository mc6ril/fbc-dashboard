---
Generated: 2025-01-27 20:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-22
---

## Summary

**Goal:** Build a complete catalog page that allows users to visualize their product list, add new products, and update existing products. The catalog page should follow the same patterns as the Activities page, providing a consistent user experience across the dashboard.

**User value:** Users can manage their product inventory and pricing information through an intuitive interface. They can view all products in a table, add new products to the catalog, and edit existing product information (name, type, coloris, pricing, stock, weight). This enables accurate product catalog management and inventory tracking.

**Constraints:**

-   Strict Clean Architecture: UI → Hooks → Usecases → Repositories
-   No direct Supabase calls from UI
-   Form validation must be accessible (WCAG 2.1 AA)
-   All styles use SCSS variables from `styles/variables/*`
-   No business logic in components; usecases handle orchestration
-   React Query mutations for data creation/updates
-   TypeScript strict mode
-   Centralized accessibility IDs via `shared/a11y/`
-   Follow same patterns as Activities page for consistency

**Non-goals:**

-   Product deletion (future feature)
-   Product search/filter functionality (future enhancement)
-   Pagination for large product lists (future enhancement)
-   Bulk operations (bulk update, bulk delete) (future enhancement)
-   Product images or media management (future feature)

## Assumptions & Risks

**Assumptions:**

-   Product domain model exists with all required fields (verified: exists in `src/core/domain/product.ts`)
-   Product repository has `create` and `update` methods implemented (verified: exists in `src/infrastructure/supabase/productRepositorySupabase.ts`)
-   Product repository has `getById` method for fetching single product (verified: exists in `src/core/ports/productRepository.ts`)
-   Domain validation function `isValidProduct` exists (verified: exists in `src/core/domain/validation.ts`)
-   `useProducts` hook exists for listing products (verified: exists in `src/presentation/hooks/useProducts.ts`)
-   Catalog page exists at `/dashboard/catalog` but is just a placeholder (verified: exists in `src/app/dashboard/catalog/page.tsx`)
-   UI components (Button, Input, Select, Heading, Text, Link) from design system exist (verified: exist in `src/presentation/components/ui/`)
-   React Query setup exists (verified: ReactQueryProvider exists)
-   Query keys structure exists (verified: `queryKeys.products.all()` exists in `src/presentation/hooks/queryKeys.ts`)

**Risks:**

-   **Missing `getProductById` usecase/hook:** Ticket #25 mentions needing `getProductById` for EditProductPage, but it doesn't exist yet. The repository has `getById`, but no usecase or hook. **Mitigation:** Add `getProductById` usecase and hook as part of ticket #25 or create a separate sub-ticket if needed.
-   **Form validation complexity:** Product form has 7 fields (name, type, coloris, unitCost, salePrice, stock, weight) with different validation rules. **Mitigation:** Use domain validation in usecases, add client-side validation in form component, display errors accessibly.
-   **ProductType enum in Select component:** Need to ensure Select component can handle enum values properly. **Mitigation:** Map enum to display labels, use enum values as option values.
-   **Weight field optional handling:** Weight is optional, form should handle empty/undefined values correctly. **Mitigation:** Validate weight only if provided, allow empty input for optional field.
-   **Query invalidation after mutations:** Need to ensure products list refreshes after create/update. **Mitigation:** Invalidate `queryKeys.products.all()` in mutation hooks' `onSuccess` callback.
-   **Edit page product fetch:** EditProductPage needs to fetch product by ID. If `getProductById` doesn't exist, need to create it. **Mitigation:** Check if usecase/hook exists, create if needed as part of ticket #25.
-   **Accessibility of table and form:** ProductsTable and ProductForm must be fully accessible. **Mitigation:** Use semantic HTML, proper ARIA labels, error announcements, live regions for success messages.
-   **Currency formatting:** unitCost and salePrice should be displayed as currency. **Mitigation:** Use existing currency utilities from `shared/utils/currency.ts` if available, or format in component.

## Solution Outline (aligned with architecture)

**Domain Layer (`core/domain/`):**

-   Product type already exists with all required fields (name, type, coloris, unitCost, salePrice, stock, weight)
-   Product validation (`isValidProduct`) already exists
-   No new domain types needed

**Usecases Layer (`core/usecases/`):**

-   **Ticket #23:** Add `createProduct` and `updateProduct` usecases
    -   `createProduct`: Validates product data using domain validation, delegates to repository.create
    -   `updateProduct`: Validates updates, checks product exists (getById), validates merged product, delegates to repository.update
-   **Ticket #25 (potential):** May need `getProductById` usecase for EditProductPage (if not using repository directly in hook)

**Ports Layer (`core/ports/`):**

-   ProductRepository port already has `create()`, `update()`, `getById()`, and `list()` methods
-   No new ports needed

**Infrastructure Layer (`infrastructure/supabase/`):**

-   ProductRepository Supabase implementation already exists with all required methods
-   No new infrastructure needed

**Presentation Layer:**

-   **Hooks (`presentation/hooks/`):**
    -   **Ticket #24:** Add `useCreateProduct` and `useUpdateProduct` mutation hooks
        -   `useCreateProduct`: React Query mutation that calls `createProduct` usecase, invalidates products list on success
        -   `useUpdateProduct`: React Query mutation that calls `updateProduct` usecase, invalidates products list on success
    -   **Ticket #25 (potential):** May need `useProductById` hook for EditProductPage (if creating usecase)
    -   `useProducts`: Already exists for listing products
-   **Stores (`presentation/stores/`):**
    -   No new stores needed (form state managed locally in components)
-   **UI Components (`presentation/components/ui/`):**
    -   All required UI components already exist (Button, Input, Select, Heading, Text, Link)
-   **Page Components (`presentation/components/catalog/`):**
    -   **Ticket #25:** Create `ProductsTable` component for displaying products in table format
    -   **Ticket #25:** Create `ProductForm` component for create/edit forms (reusable for both modes)
-   **Pages (`app/dashboard/catalog/`):**
    -   **Ticket #25:** Update `CatalogPage` at `/dashboard/catalog/page.tsx` to display products list
    -   **Ticket #25:** Create `NewProductPage` at `/dashboard/catalog/new/page.tsx`
    -   **Ticket #25:** Create `EditProductPage` at `/dashboard/catalog/[id]/edit/page.tsx`

**Shared Layer (`shared/`):**

-   Accessibility utilities already exist (`shared/a11y/utils.ts`)
-   Currency utilities may exist (`shared/utils/currency.ts`) for formatting prices
-   Date utilities already exist (`shared/utils/date.ts`)

## Sub-Tickets

This feature has been split into three main sub-tickets following Clean Architecture layers, with each ticket further divided into smaller, focused sub-sub-tickets for step-by-step implementation.

### Summary of Sub-Sub-Tickets

**Ticket #23: Product Usecases (Total: 3h)**

-   23.1: Create createProduct usecase (1.5h) - No dependencies
-   23.2: Create updateProduct usecase (1.5h) - Depends on 23.1

**Ticket #24: React Query Mutation Hooks (Total: 2h)**

-   24.1: Create useCreateProduct hook (1h) - Depends on 23.1
-   24.2: Create useUpdateProduct hook (1h) - Depends on 23.2

**Ticket #25: Catalog Page UI (Total: 6.5h)**

-   25.1: Create ProductsTable component (1.5h) - No dependencies
-   25.2: Create ProductForm component (2h) - No dependencies
-   25.3: Update CatalogPage (0.5h) - Depends on 25.1
-   25.4: Create NewProductPage (1h) - Depends on 25.2, 24.1
-   25.5: Create EditProductPage (1.5h) - Depends on 25.2, 24.2

**Total Estimated Effort: 11.5 hours**

**Recommended Implementation Order:**

1. 23.1 → 23.2 (usecases)
2. 24.1 (can start after 23.1) → 24.2 (can start after 23.2)
3. 25.1, 25.2 (can be done in parallel)
4. 25.3 (after 25.1)
5. 25.4 (after 25.2, 24.1)
6. 25.5 (after 25.2, 24.2)

### Sub-Ticket 23: Product Usecases

This ticket is divided into two sub-sub-tickets for incremental implementation:

#### Sub-Ticket 23.1: Create createProduct usecase

**Title:** Implement createProduct usecase with tests

**Rationale:**
Implement the `createProduct` usecase first as it's simpler (no existing product to fetch). This allows testing the creation flow independently before tackling updates.

**Acceptance Criteria:**

-   [x] Create `createProduct` usecase in `src/core/usecases/product.ts`
    -   Takes `ProductRepository` and `Omit<Product, 'id'>` as parameters
    -   Validates product data using domain validation (`isValidProduct`)
    -   Delegates to `repository.create()` for persistence
    -   Returns created product with generated ID
    -   Throws error if validation fails
-   [x] Add unit tests for `createProduct` usecase in `__tests__/core/usecases/product.test.ts`
    -   Test successful product creation
    -   Test validation errors (invalid data, missing required fields, negative prices, etc.)
    -   Test repository error handling
    -   Mock repository dependency

**Definition of Done:**

-   [x] `createProduct` usecase implemented in `src/core/usecases/product.ts`
-   [x] Unit tests for `createProduct` pass
-   [x] All tests follow project conventions (Jest, TypeScript, mocks)
-   [x] JSDoc documentation added for usecase
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [ ] Code review approved

**Estimated Effort:** 1.5 hours

**Dependencies:** None (Product domain model, validation, and repository already exist)

**Owner:** Architecture-Aware Dev

**Risk Notes:**

-   Follow same patterns as `addActivity` usecase for consistency
-   Validation should use domain validation functions, not duplicate logic
-   Error handling must be descriptive for UI feedback

#### Sub-Ticket 23.2: Create updateProduct usecase

**Title:** Implement updateProduct usecase with tests

**Rationale:**
Implement the `updateProduct` usecase after `createProduct` is complete. This usecase is more complex as it needs to fetch the existing product first, merge updates, and validate the merged result.

**Acceptance Criteria:**

-   [x] Create `updateProduct` usecase in `src/core/usecases/product.ts`
    -   Takes `ProductRepository`, `ProductId`, and `Partial<Product>` as parameters
    -   Retrieves existing product using `repository.getById()` to verify it exists
    -   Throws error if product not found
    -   Validates merged product data (existing + updates) using domain validation
    -   Delegates to `repository.update()` for persistence
    -   Returns updated product
    -   Throws error if validation fails or product not found
-   [x] Add unit tests for `updateProduct` usecase in `__tests__/core/usecases/product.test.ts`
    -   Test successful product update
    -   Test product not found error
    -   Test validation errors (invalid updates, negative prices, etc.)
    -   Test partial updates (only some fields)
    -   Test repository error handling
    -   Mock repository dependency

**Definition of Done:**

-   [x] `updateProduct` usecase implemented in `src/core/usecases/product.ts`
-   [x] Unit tests for `updateProduct` pass
-   [x] All tests follow project conventions (Jest, TypeScript, mocks)
-   [x] JSDoc documentation added for usecase
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1.5 hours

**Dependencies:** Sub-Ticket 23.1 (createProduct usecase) - can be done in parallel but recommended to do sequentially for learning

**Owner:** Architecture-Aware Dev

**Risk Notes:**

-   Follow same patterns as `updateActivity` usecase for consistency
-   Validation should use domain validation functions, not duplicate logic
-   Error handling must be descriptive for UI feedback
-   Ensure proper merging of existing product with updates before validation

### Sub-Ticket 24: React Query Mutation Hooks

This ticket is divided into two sub-sub-tickets for incremental implementation:

#### Sub-Ticket 24.1: Create useCreateProduct mutation hook

**Title:** Implement useCreateProduct mutation hook

**Rationale:**
Implement the `useCreateProduct` hook first as it's simpler and can be tested independently. This hook will be used by the NewProductPage.

**Acceptance Criteria:**

-   [x] Create `useCreateProduct` mutation hook in `src/presentation/hooks/useProducts.ts`
    -   Uses `useMutation` from React Query
    -   Calls `createProduct` usecase with `productRepositorySupabase`
    -   Takes `Omit<Product, 'id'>` as mutation input
    -   Invalidates `queryKeys.products.all()` on success
    -   Returns mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `data`
-   [x] Verify `queryKeys.products.all()` exists in `src/presentation/hooks/queryKeys.ts`
    -   Add if missing (should already exist)

**Definition of Done:**

-   [x] `useCreateProduct` mutation hook implemented
-   [x] Hook invalidates products list query on success
-   [x] Hook follows React Query best practices
-   [x] Hook follows same patterns as existing mutation hooks (`useSignIn`, `useSignUp`)
-   [x] JSDoc documentation added for hook
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1 hour

**Dependencies:** Sub-Ticket 23.1 (createProduct usecase must be implemented first)

**Owner:** Architecture-Aware Dev

**Risk Notes:**

-   Follow same patterns as auth mutation hooks (`useSignIn`, `useSignUp`) for consistency
-   Cache invalidation ensures UI stays in sync after mutations
-   Error handling must propagate errors from usecases to UI

#### Sub-Ticket 24.2: Create useUpdateProduct mutation hook

**Title:** Implement useUpdateProduct mutation hook

**Rationale:**
Implement the `useUpdateProduct` hook after `useCreateProduct` is complete. This hook will be used by the EditProductPage.

**Acceptance Criteria:**

-   [x] Create `useUpdateProduct` mutation hook in `src/presentation/hooks/useProducts.ts`
    -   Uses `useMutation` from React Query
    -   Calls `updateProduct` usecase with `productRepositorySupabase`
    -   Takes `{ id: ProductId, updates: Partial<Product> }` as mutation input
    -   Invalidates `queryKeys.products.all()` on success
    -   Returns mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `data`
-   [x] Verify query keys are properly configured for invalidation

**Definition of Done:**

-   [x] `useUpdateProduct` mutation hook implemented
-   [x] Hook invalidates products list query on success
-   [x] Hook follows React Query best practices
-   [x] Hook follows same patterns as existing mutation hooks (`useSignIn`, `useSignUp`)
-   [x] JSDoc documentation added for hook
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1 hour

**Dependencies:** Sub-Ticket 23.2 (updateProduct usecase must be implemented first)

**Owner:** Architecture-Aware Dev

**Risk Notes:**

-   Follow same patterns as auth mutation hooks (`useSignIn`, `useSignUp`) for consistency
-   Cache invalidation ensures UI stays in sync after mutations
-   Error handling must propagate errors from usecases to UI

### Sub-Ticket 25: Catalog Page UI

This ticket is divided into five sub-sub-tickets for incremental, step-by-step implementation:

#### Sub-Ticket 25.1: Create ProductsTable component

**Title:** Build ProductsTable component to display products list

**Rationale:**
Start with the table component as it's the core display element. This allows testing the data display independently before building forms and pages.

**Acceptance Criteria:**

-   [x] Create `ProductsTable` component in `src/presentation/components/catalog/ProductsTable/ProductsTable.tsx`
    -   Displays products in a semantic HTML table format
    -   Shows columns: name, type, coloris, unitCost, salePrice, stock, weight (optional)
    -   Includes edit action button for each product row (Link to `/dashboard/catalog/[id]/edit`)
    -   Handles loading state (shows loading indicator)
    -   Handles error state (displays error message with role="alert")
    -   Handles empty state (shows message when no products)
    -   Uses `React.memo` for performance
-   [x] Create `ProductsTable.module.scss` with styles
    -   Uses variables from `styles/variables/*` (no hardcoded values)
    -   Uses kebab-case with BEM methodology
    -   Follows same styling patterns as ActivitiesTable
-   [x] Accessibility requirements:
    -   Table has semantic structure (`<thead>`, `<tbody>`, `<th>` with `scope` attributes)
    -   Edit buttons have descriptive ARIA labels
    -   Loading/error/empty states are announced to screen readers

**Definition of Done:**

-   [x] `ProductsTable` component created with proper styling
-   [x] Component handles loading, error, and empty states
-   [x] Component is accessible (ARIA labels, semantic HTML)
-   [x] Component uses `React.memo` for performance
-   [x] All styles use variables from `styles/variables/*`
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1.5 hours

**Dependencies:** None (can use mock data for initial development)

**Owner:** UI Designer

**Risk Notes:**

-   Currency formatting for unitCost and salePrice (can use simple number display initially)
-   Weight field optional display (show only if present)
-   Reference ActivitiesTable component for patterns

#### Sub-Ticket 25.2: Create ProductForm component

**Title:** Build reusable ProductForm component for create and edit modes

**Rationale:**
Build the form component next as it's needed by both NewProductPage and EditProductPage. This component handles all form logic and validation.

**Acceptance Criteria:**

-   [x] Create `ProductForm` component in `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
    -   Reusable form for both create and edit modes (accepts `mode` prop)
    -   Fields:
        -   name: text input, required
        -   type: select with ProductType enum options, required (map enum to display labels)
        -   coloris: text input, required
        -   unitCost: number input, required, > 0, step="0.01"
        -   salePrice: number input, required, > 0, step="0.01"
        -   stock: number input, required, >= 0, step="1"
        -   weight: number input, optional, > 0 if provided, step="1"
    -   Client-side validation before submission
    -   Displays validation errors accessibly (aria-describedby, role="alert")
    -   Uses `useCallback` for event handlers
    -   Accepts `initialValues` prop for edit mode
    -   Accepts `onSubmit` callback prop
-   [x] Create `ProductForm.module.scss` with styles
    -   Uses variables from `styles/variables/*` (no hardcoded values)
    -   Uses kebab-case with BEM methodology
    -   Follows same styling patterns as ActivityFilters
-   [x] Accessibility requirements:
    -   All form fields have associated `<label>` elements with `htmlFor` and `id`
    -   Error messages use `role="alert"` and `aria-describedby`
    -   Form validation errors are associated with fields using `aria-describedby`

**Definition of Done:**

-   [x] `ProductForm` component created with proper styling
-   [x] Component handles both create and edit modes
-   [x] Component validates inputs before submission
-   [x] Component displays validation errors accessibly
-   [x] Component uses `useCallback` for event handlers
-   [x] All styles use variables from `styles/variables/*`
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 2 hours

**Dependencies:** None (can be developed independently with mock handlers)

**Owner:** UI Designer

**Risk Notes:**

-   Form validation complexity with 7 fields and different validation rules
-   ProductType enum handling in Select component (create mapping object for display labels)
-   Weight field optional handling (validate only if provided)
-   Reference ActivityFilters component for form patterns

#### Sub-Ticket 25.3: Update CatalogPage with products list

**Title:** Update CatalogPage to display products using ProductsTable

**Rationale:**
Update the existing CatalogPage to use the ProductsTable component and display the products list. This provides the main catalog view.

**Acceptance Criteria:**

-   [x] Update `CatalogPage` component in `src/app/dashboard/catalog/page.tsx`
    -   Fetches products using `useProducts` hook
    -   Displays `ProductsTable` with products data
    -   Includes "Add Product" button (Link to `/dashboard/catalog/new`)
    -   Handles loading and error states
    -   Follows same structure as Activities page
-   [x] Create `page.module.scss` with styles
    -   Uses variables from `styles/variables/*` (no hardcoded values)
    -   Uses kebab-case with BEM methodology
    -   Follows same styling patterns as Activities page

**Definition of Done:**

-   [x] `CatalogPage` displays products list with ProductsTable
-   [x] "Add Product" button navigates correctly
-   [x] Page handles loading and error states
-   [x] All styles use variables from `styles/variables/*`
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 0.5 hours

**Dependencies:** Sub-Ticket 25.1 (ProductsTable component must be created)

**Owner:** UI Designer

**Risk Notes:**

-   Reference Activities page for structure and patterns
-   Ensure proper error handling and loading states

#### Sub-Ticket 25.4: Create NewProductPage

**Title:** Build NewProductPage for creating products

**Rationale:**
Create the page for adding new products. This page uses the ProductForm in create mode and the useCreateProduct hook.

**Acceptance Criteria:**

-   [x] Create `NewProductPage` component in `src/app/dashboard/catalog/new/page.tsx`
    -   Uses `ProductForm` component in create mode
    -   Uses `useCreateProduct` mutation hook
    -   Handles form submission
    -   Redirects to `/dashboard/catalog` on success using Next.js `useRouter`
    -   Displays success feedback accessibly (aria-live="polite")
    -   Displays error feedback accessibly (role="alert")
    -   Handles loading state during mutation
-   [x] Create `page.module.scss` with styles
    -   Uses variables from `styles/variables/*` (no hardcoded values)
    -   Uses kebab-case with BEM methodology

**Definition of Done:**

-   [x] `NewProductPage` allows creating new products
-   [x] Form submission works correctly
-   [x] Success redirect works
-   [x] Error feedback displays correctly
-   [x] Success feedback announces correctly (aria-live)
-   [x] All styles use variables from `styles/variables/*`
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1 hour

**Dependencies:**

-   Sub-Ticket 25.2 (ProductForm component must be created)
-   Sub-Ticket 24.1 (useCreateProduct hook must be implemented)

**Owner:** UI Designer

**Risk Notes:**

-   Ensure proper error handling from mutation hook
-   Success feedback must be announced to screen readers
-   Reference NewActivityPage if it exists for patterns

#### Sub-Ticket 25.5: Create EditProductPage

**Title:** Build EditProductPage for editing products

**Rationale:**
Create the page for editing existing products. This page needs to fetch the product by ID first, then use the ProductForm in edit mode with pre-filled data.

**Acceptance Criteria:**

-   [x] Create `getProductById` usecase in `src/core/usecases/product.ts` (if needed)
    -   Takes `ProductRepository` and `ProductId` as parameters
    -   Calls `repository.getById()`
    -   Throws error if product not found (convert null to error)
    -   Returns product if found
-   [x] Create `useProductById` hook in `src/presentation/hooks/useProducts.ts` (if needed)
    -   Uses `useQuery` from React Query
    -   Calls usecase or repository directly
    -   Query key: `queryKeys.products.detail(id)` (add to queryKeys if needed)
    -   Returns query object with `data`, `isLoading`, `error`
-   [x] Create `EditProductPage` component in `src/app/dashboard/catalog/[id]/edit/page.tsx`
    -   Gets product ID from route params (`params.id`)
    -   Fetches product by ID using hook
    -   Uses `ProductForm` component in edit mode with pre-filled data
    -   Uses `useUpdateProduct` mutation hook
    -   Handles form submission
    -   Redirects to `/dashboard/catalog` on success
    -   Displays success/error feedback accessibly
    -   Handles loading and error states for product fetch
-   [x] Create `page.module.scss` with styles
    -   Uses variables from `styles/variables/*` (no hardcoded values)
    -   Uses kebab-case with BEM methodology

**Definition of Done:**

-   [x] `getProductById` usecase and `useProductById` hook created (if needed)
-   [x] `EditProductPage` allows editing existing products
-   [x] Product data loads correctly
-   [x] Form pre-fills correctly with product data
-   [x] Form submission updates product
-   [x] Success redirect works
-   [x] Error feedback displays correctly
-   [x] Loading state displays correctly during product fetch
-   [x] All styles use variables from `styles/variables/*`
-   [x] Build/lint green
-   [x] No TypeScript errors
-   [x] Code review approved

**Estimated Effort:** 1.5 hours (includes getProductById usecase/hook if needed)

**Dependencies:**

-   Sub-Ticket 25.2 (ProductForm component must be created)
-   Sub-Ticket 24.2 (useUpdateProduct hook must be implemented)

**Owner:** UI Designer + Architecture-Aware Dev

**Risk Notes:**

-   May need to create `getProductById` usecase and hook (decision: follow Activity pattern or create usecase)
-   Ensure proper error handling for product not found scenario
-   Form pre-filling must work correctly with initialValues prop
-   Reference EditActivityPage if it exists for patterns

## Unit Test Spec (Test-First Protocol)

### Ticket #23.1: createProduct Usecase Tests

**Files & Paths:**

-   `__tests__/core/usecases/product.test.ts` (update existing file)

**Test Structure:**

```typescript
describe("createProduct", () => {
    describe("successful creation", () => {
        it("should create a product with valid data", () => {});
        it("should return created product with generated ID", () => {});
    });

    describe("validation errors", () => {
        it("should throw error if product data is invalid", () => {});
        it("should throw error if name is missing", () => {});
        it("should throw error if type is invalid", () => {});
        it("should throw error if coloris is missing", () => {});
        it("should throw error if unitCost is negative or zero", () => {});
        it("should throw error if salePrice is negative or zero", () => {});
        it("should throw error if stock is negative", () => {});
        it("should throw error if weight is provided and negative or zero", () => {});
    });

    describe("repository errors", () => {
        it("should propagate repository errors", () => {});
    });
});

describe("updateProduct", () => {
    describe("successful update", () => {
        it("should update a product with valid updates", () => {});
        it("should return updated product", () => {});
        it("should allow partial updates (only some fields)", () => {});
    });

    describe("product not found", () => {
        it("should throw error if product does not exist", () => {});
    });

    describe("validation errors", () => {
        it("should throw error if merged product data is invalid", () => {});
        it("should throw error if unitCost update is negative or zero", () => {});
        it("should throw error if salePrice update is negative or zero", () => {});
        it("should throw error if stock update is negative", () => {});
        it("should throw error if weight update is provided and negative or zero", () => {});
    });

    describe("repository errors", () => {
        it("should propagate repository errors", () => {});
    });
});
```

**Mocks/Fixtures:**

-   Mock `ProductRepository` with `jest.fn()` for all methods
-   Create valid product fixtures for testing
-   Create invalid product fixtures for validation testing

**Edge Cases:**

-   Empty string for required fields
-   Negative numbers for prices and stock
-   Zero for prices (should fail validation)
-   Zero for stock (should pass validation, >= 0)
-   Optional weight field (undefined, null, positive number, negative number)
-   Partial updates with only some fields
-   Product not found scenario

**Coverage Target:** 100% for both usecases (all branches, error paths, success paths)

**Mapping AC → Tests:**

-   AC: "Validates product data using domain validation" → Test validation error cases
-   AC: "Delegates to repository.create()" → Test successful creation with mocked repository
-   AC: "Returns created product with generated ID" → Test return value
-   AC: "Checks product exists before updating" → Test product not found error
-   AC: "Validates merged product data" → Test validation with merged data
-   AC: "Delegates to repository.update()" → Test successful update with mocked repository

**Status:** tests: proposed

### Ticket #23.2: updateProduct Usecase Tests

**Files & Paths:**

-   `__tests__/core/usecases/product.test.ts` (update existing file)

**Test Structure:**

```typescript
describe("updateProduct", () => {
    describe("successful update", () => {
        it("should update a product with valid updates", () => {});
        it("should return updated product", () => {});
        it("should allow partial updates (only some fields)", () => {});
    });

    describe("product not found", () => {
        it("should throw error if product does not exist", () => {});
    });

    describe("validation errors", () => {
        it("should throw error if merged product data is invalid", () => {});
        it("should throw error if unitCost update is negative or zero", () => {});
        it("should throw error if salePrice update is negative or zero", () => {});
        it("should throw error if stock update is negative", () => {});
        it("should throw error if weight update is provided and negative or zero", () => {});
    });

    describe("repository errors", () => {
        it("should propagate repository errors", () => {});
    });
});
```

**Mocks/Fixtures:**

-   Mock `ProductRepository` with `jest.fn()` for all methods
-   Create valid product fixtures for testing
-   Create invalid product fixtures for validation testing

**Edge Cases:**

-   Partial updates with only some fields
-   Product not found scenario
-   Negative numbers for prices and stock
-   Zero for prices (should fail validation)
-   Zero for stock (should pass validation, >= 0)
-   Optional weight field (undefined, null, positive number, negative number)

**Coverage Target:** 100% for updateProduct usecase (all branches, error paths, success paths)

**Mapping AC → Tests:**

-   AC: "Checks product exists before updating" → Test product not found error
-   AC: "Validates merged product data" → Test validation with merged data
-   AC: "Delegates to repository.update()" → Test successful update with mocked repository

**Status:** tests: proposed

### Ticket #24: Hooks Tests (Optional)

**Note:** Hooks are typically tested through integration tests or UI component tests. Unit tests for hooks are optional but can be added if needed.

**Files & Paths:**

-   `__tests__/presentation/hooks/useProducts.test.tsx` (new file, optional)

**Test Structure (if implemented):**

```typescript
describe("useCreateProduct", () => {
    it("should call createProduct usecase on mutation", () => {});
    it("should invalidate products list query on success", () => {});
    it("should return mutation object with correct properties", () => {});
});

describe("useUpdateProduct", () => {
    it("should call updateProduct usecase on mutation", () => {});
    it("should invalidate products list query on success", () => {});
    it("should return mutation object with correct properties", () => {});
});
```

**Status:** tests: optional (hooks tested through component integration)

### Ticket #25: Component Tests (Reusable Components Only)

**Files & Paths:**

-   `__tests__/presentation/components/catalog/ProductsTable.test.tsx` (new file, if ProductsTable is considered reusable)
-   `__tests__/presentation/components/catalog/ProductForm.test.tsx` (new file, if ProductForm is considered reusable)

**Note:** According to project rules, only reusable components in `presentation/components/ui/` require tests. ProductsTable and ProductForm are page-specific components, so tests are optional. However, if they are considered reusable or complex, tests can be added.

**Status:** tests: optional (page-specific components, not mandatory per project rules)

## Agent Prompts

### Unit Test Coach (Test-First Protocol)

**Prompt for Ticket #23.1:**

```
@Unit Test Coach

Generate unit test specifications and scaffolds for the `createProduct` usecase following Test-First Protocol.

**Context:**
- File: `__tests__/core/usecases/product.test.ts` (update existing)
- Usecase to test: `createProduct` from `src/core/usecases/product.ts`
- Reference: `__tests__/core/usecases/activity.test.ts` for patterns (specifically `addActivity` tests)

**Requirements:**
- Test successful product creation
- Test all validation error cases (missing fields, negative prices, negative stock, invalid weight)
- Test repository error propagation
- Mock ProductRepository dependency
- Use Jest and TypeScript
- Follow project test conventions

**Test Structure:**
- Use `describe()` blocks for grouping
- Use `it()` for individual test cases
- Use `beforeEach()` for setup
- Use `jest.clearAllMocks()` in beforeEach
- Follow Arrange-Act-Assert pattern

Generate test specs and scaffolds before implementation.
```

### Architecture-Aware Dev

**Prompt for Ticket #23.1:**

```
@Architecture-Aware Dev

Implement `createProduct` usecase in `src/core/usecases/product.ts` following Clean Architecture principles.

**Context:**
- Reference: `src/core/usecases/activity.ts` for patterns (`addActivity`)
- Domain validation: Use `isValidProduct` from `src/core/domain/validation.ts`
- Repository: `ProductRepository` interface from `src/core/ports/productRepository.ts`
- Repository implementation: `productRepositorySupabase` from `src/infrastructure/supabase/productRepositorySupabase.ts`

**Requirements:**
- `createProduct(repo: ProductRepository, product: Omit<Product, 'id'>): Promise<Product>`
  - Validate product data using `isValidProduct`
  - Delegate to `repo.create()`
  - Return created product with generated ID
  - Throw descriptive errors on validation failure

**Architecture Rules:**
- NO Supabase imports in usecases
- NO React/Next.js imports in usecases
- Use domain validation functions, don't duplicate logic
- Follow same patterns as `addActivity` usecase
- Add JSDoc documentation
- Type all return values explicitly

**Testing:**
- Unit tests already scaffolded by Unit Test Coach for ticket #23.1
- Ensure all tests pass
- Mock repository dependency in tests

Implement following architecture rules strictly.
```

**Prompt for Ticket #23.2:**

```
@Architecture-Aware Dev

Implement `updateProduct` usecase in `src/core/usecases/product.ts` following Clean Architecture principles.

**Context:**
- Reference: `src/core/usecases/activity.ts` for patterns (`updateActivity`)
- Domain validation: Use `isValidProduct` from `src/core/domain/validation.ts`
- Repository: `ProductRepository` interface from `src/core/ports/productRepository.ts`
- Repository implementation: `productRepositorySupabase` from `src/infrastructure/supabase/productRepositorySupabase.ts`

**Requirements:**
- `updateProduct(repo: ProductRepository, id: ProductId, updates: Partial<Product>): Promise<Product>`
  - Retrieve existing product using `repo.getById()` to verify it exists
  - Throw error if product not found
  - Merge existing + updates
  - Validate merged product using `isValidProduct`
  - Delegate to `repo.update()`
  - Return updated product
  - Throw descriptive errors on validation failure or product not found

**Architecture Rules:**
- NO Supabase imports in usecases
- NO React/Next.js imports in usecases
- Use domain validation functions, don't duplicate logic
- Follow same patterns as `updateActivity` usecase
- Add JSDoc documentation
- Type all return values explicitly

**Testing:**
- Unit tests already scaffolded by Unit Test Coach for ticket #23.2
- Ensure all tests pass
- Mock repository dependency in tests

Implement following architecture rules strictly.
```

**Prompt for Ticket #24.1:**

```
@Architecture-Aware Dev

Implement `useCreateProduct` React Query mutation hook in `src/presentation/hooks/useProducts.ts` following React Query best practices.

**Context:**
- Reference: `src/presentation/hooks/useAuth.ts` for mutation patterns (`useSignIn`, `useSignUp`)
- Usecase: `createProduct` from `src/core/usecases/product.ts` (from ticket #23.1)
- Repository: `productRepositorySupabase` from `src/infrastructure/supabase/productRepositorySupabase.ts`
- Query keys: `queryKeys.products.all()` from `src/presentation/hooks/queryKeys.ts`

**Requirements:**
- `useCreateProduct()`: React Query mutation hook
  - Uses `useMutation` from `@tanstack/react-query`
  - Calls `createProduct(productRepositorySupabase, product)` in `mutationFn`
  - Takes `Omit<Product, 'id'>` as mutation input
  - Invalidates `queryKeys.products.all()` in `onSuccess` callback
  - Returns mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `data`

**Architecture Rules:**
- Use `useQueryClient` for cache invalidation
- Follow same patterns as auth mutation hooks
- Add JSDoc documentation
- Export hook for use in components

**Dependencies:**
- Ticket #23.1 must be completed first (createProduct usecase must exist)

Implement following React Query best practices and architecture rules.
```

**Prompt for Ticket #24.2:**

```

Implement `useUpdateProduct` React Query mutation hook in `src/presentation/hooks/useProducts.ts` following React Query best practices.

**Context:**
- Reference: `src/presentation/hooks/useAuth.ts` for mutation patterns (`useSignIn`, `useSignUp`)
- Usecase: `updateProduct` from `src/core/usecases/product.ts` (from ticket #23.2)
- Repository: `productRepositorySupabase` from `src/infrastructure/supabase/productRepositorySupabase.ts`
- Query keys: `queryKeys.products.all()` from `src/presentation/hooks/queryKeys.ts`

**Requirements:**
- `useUpdateProduct()`: React Query mutation hook
  - Uses `useMutation` from `@tanstack/react-query`
  - Calls `updateProduct(productRepositorySupabase, id, updates)` in `mutationFn`
  - Takes `{ id: ProductId, updates: Partial<Product> }` as mutation input
  - Invalidates `queryKeys.products.all()` in `onSuccess` callback
  - Returns mutation object with `mutate`, `mutateAsync`, `isPending`, `error`, `data`

**Architecture Rules:**
- Use `useQueryClient` for cache invalidation
- Follow same patterns as auth mutation hooks
- Add JSDoc documentation
- Export hook for use in components

**Dependencies:**
- Ticket #23.2 must be completed first (updateProduct usecase must exist)

Implement following React Query best practices and architecture rules.
```

**Prompt for Ticket #25.5 (if getProductById needed):**

```
@Architecture-Aware Dev

Implement `getProductById` usecase and `useProductById` hook if needed for EditProductPage.

**Context:**
- Repository: `ProductRepository` has `getById(id: ProductId): Promise<Product | null>`
- Reference: Activity usecases don't have `getActivityById` (they use repository directly in hooks)
- Check if EditProductPage can use repository directly or needs usecase/hook

**Decision:**
- If following Activity pattern: Use repository directly in hook (no usecase needed)
- If following Clean Architecture strictly: Create usecase `getProductById` and hook `useProductById`

**If creating usecase:**
- File: `src/core/usecases/product.ts`
- `getProductById(repo: ProductRepository, id: ProductId): Promise<Product>`
  - Calls `repo.getById(id)`
  - Throws error if product not found (convert null to error)
  - Returns product if found

**If creating hook:**
- File: `src/presentation/hooks/useProducts.ts`
- `useProductById(id: ProductId)`: React Query query hook
  - Uses `useQuery` from `@tanstack/react-query`
  - Calls usecase or repository directly
  - Query key: `queryKeys.products.detail(id)` (add to queryKeys if needed)
  - Returns query object with `data`, `isLoading`, `error`

Check EditProductPage requirements and implement accordingly.
```

### UI Designer

**Prompt for Ticket #25.1:**

```
@UI Designer

Build the ProductsTable component to display products in a table format.

**Component to Create:**

**ProductsTable** (`src/presentation/components/catalog/ProductsTable/ProductsTable.tsx`)
- Display products in semantic HTML table
- Columns: name, type, coloris, unitCost (formatted as currency), salePrice (formatted as currency), stock, weight (optional, show if present)
- Edit button for each row (Link to `/dashboard/catalog/[id]/edit`)
- Loading state (show loading indicator)
- Error state (show error message with role="alert")
- Empty state (show message when no products)
- Use `React.memo` for performance
- Reference: `src/presentation/components/activities/ActivitiesTable/ActivitiesTable.tsx`

**Styling:**
- Create `ProductsTable.module.scss` with styles
- Use variables from `styles/variables/*` (NO hardcoded values)
- Use kebab-case with BEM methodology for class names
- Follow same styling patterns as ActivitiesTable

**Accessibility:**
- Table has semantic structure (`<thead>`, `<tbody>`, `<th>` with `scope` attributes)
- Edit buttons have descriptive ARIA labels
- Loading/error/empty states are announced to screen readers

**Component Conventions:**
- Arrow function with export default
- Props typed with `type` (not `interface`)
- Use `React.memo` for performance
- No inline functions in render methods

Build component following project conventions and accessibility guidelines.
```

**Prompt for Ticket #25.2:**

```
@UI Designer

Build the reusable ProductForm component for both create and edit modes.

**Component to Create:**

**ProductForm** (`src/presentation/components/catalog/ProductForm/ProductForm.tsx`)
- Reusable form for both create and edit modes (accepts `mode` prop)
- Fields:
  - name: text input, required
  - type: select with ProductType enum options, required (map enum to display labels)
  - coloris: text input, required
  - unitCost: number input, required, > 0, step="0.01"
  - salePrice: number input, required, > 0, step="0.01"
  - stock: number input, required, >= 0, step="1"
  - weight: number input, optional, > 0 if provided, step="1"
- Client-side validation before submission
- Display validation errors accessibly (aria-describedby, role="alert")
- Use `useCallback` for event handlers
- Accepts `initialValues` prop for edit mode
- Accepts `onSubmit` callback prop
- Reference: `src/presentation/components/activities/ActivityFilters/ActivityFilters.tsx` for form patterns

**Styling:**
- Create `ProductForm.module.scss` with styles
- Use variables from `styles/variables/*` (NO hardcoded values)
- Use kebab-case with BEM methodology for class names
- Follow same styling patterns as ActivityFilters

**Accessibility:**
- All form fields have associated `<label>` elements with `htmlFor` and `id`
- Error messages use `role="alert"` and `aria-describedby`
- Form validation errors are associated with fields using `aria-describedby`
- Use accessibility utilities from `shared/a11y/`

**Component Conventions:**
- Arrow function with export default
- Props typed with `type` (not `interface`)
- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- No inline functions in render methods

Build component following project conventions and accessibility guidelines.
```

**Prompt for Ticket #25.3:**

```
@UI Designer

Update the CatalogPage to display products using the ProductsTable component.

**Page to Update:**

**CatalogPage** (`src/app/dashboard/catalog/page.tsx`)
- Fetch products using `useProducts` hook
- Display ProductsTable with products data
- Include "Add Product" button (Link to `/dashboard/catalog/new`)
- Handle loading and error states
- Follow same structure as Activities page
- Reference: `src/app/dashboard/activities/page.tsx`

**Styling:**
- Create `page.module.scss` with styles
- Use variables from `styles/variables/*` (NO hardcoded values)
- Use kebab-case with BEM methodology for class names
- Follow same styling patterns as Activities page

**Dependencies:**
- Sub-Ticket 25.1: ProductsTable component must be created

Build page following project conventions.
```

**Prompt for Ticket #25.4:**

```
@UI Designer

Build the NewProductPage for creating products.

**Page to Create:**

**NewProductPage** (`src/app/dashboard/catalog/new/page.tsx`)
- Use ProductForm component in create mode
- Use `useCreateProduct` mutation hook
- Handle form submission
- Redirect to `/dashboard/catalog` on success (use Next.js `useRouter`)
- Display success feedback accessibly (aria-live="polite")
- Display error feedback accessibly (role="alert")
- Handle loading state during mutation

**Styling:**
- Create `page.module.scss` with styles
- Use variables from `styles/variables/*` (NO hardcoded values)
- Use kebab-case with BEM methodology for class names

**Dependencies:**
- Sub-Ticket 25.2: ProductForm component must be created
- Sub-Ticket 24.1: useCreateProduct hook must be implemented

Build page following project conventions and accessibility guidelines.
```

**Prompt for Ticket #25.5:**

```
@UI Designer

Build the EditProductPage for editing existing products.

**Page to Create:**

**EditProductPage** (`src/app/dashboard/catalog/[id]/edit/page.tsx`)
- Get product ID from route params (`params.id`)
- Fetch product by ID (use `useProductById` hook or repository directly - check if hook exists from ticket #25.5)
- Use ProductForm component in edit mode with pre-filled data (via `initialValues` prop)
- Use `useUpdateProduct` mutation hook
- Handle form submission
- Redirect to `/dashboard/catalog` on success
- Display success/error feedback accessibly
- Handle loading and error states for product fetch

**Styling:**
- Create `page.module.scss` with styles
- Use variables from `styles/variables/*` (NO hardcoded values)
- Use kebab-case with BEM methodology for class names

**Dependencies:**
- Sub-Ticket 25.2: ProductForm component must be created
- Sub-Ticket 24.2: useUpdateProduct hook must be implemented
- May need `getProductById` usecase and `useProductById` hook (see Architecture-Aware Dev prompt for ticket #25.5)

**Note:** If `getProductById` usecase and `useProductById` hook are needed, they should be created first (see Architecture-Aware Dev prompt for ticket #25.5).

Build page following project conventions and accessibility guidelines.
```

### QA & Test Coach

**Prompt for Ticket #25:**

```
@QA & Test Coach

Create test plan and accessibility checklist for the catalog page feature.

**Components to Test:**

1. **ProductsTable**
   - Display products correctly
   - Loading state displays correctly
   - Error state displays correctly
   - Empty state displays correctly
   - Edit button navigates to correct URL
   - Table is accessible (screen reader, keyboard navigation)

2. **ProductForm**
   - All fields render correctly
   - Validation errors display correctly
   - Form submission works (create mode)
   - Form submission works (edit mode)
   - Pre-filled data works (edit mode)
   - Form is accessible (labels, error messages, keyboard navigation)

3. **CatalogPage**
   - Products list displays correctly
   - "Add Product" button navigates correctly
   - Loading state displays correctly
   - Error state displays correctly

4. **NewProductPage**
   - Form renders correctly
   - Form submission creates product
   - Success redirect works
   - Error feedback displays correctly
   - Success feedback announces correctly (aria-live)

5. **EditProductPage**
   - Product data loads correctly
   - Form pre-fills correctly
   - Form submission updates product
   - Success redirect works
   - Error feedback displays correctly
   - Loading state displays correctly

**Accessibility Checklist (WCAG 2.1 AA):**
- [ ] All interactive elements have ARIA labels
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Success messages are announced to screen readers
- [ ] Table has semantic structure
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation testing

**E2E Scenarios:**
1. User views products list
2. User creates a new product
3. User edits an existing product
4. User sees validation errors
5. User sees success feedback
6. User sees error feedback

Create comprehensive test plan and accessibility checklist.
```

### Architecture Guardian

**Prompt for All Tickets:**

```
@Architecture Guardian

Verify architecture compliance for tickets #23, #24, and #25 (catalog page product CRUD).

**Architecture Rules to Verify:**

1. **Layer Separation:**
   - [ ] No Supabase imports in core/ (domain, usecases, ports)
   - [ ] No React/Next.js imports in core/
   - [ ] No business logic in presentation/components
   - [ ] No direct repository calls from UI components
   - [ ] Flow: UI → Hooks → Usecases → Repositories

2. **Usecases Layer (Ticket #23):**
   - [ ] Usecases take repository as parameter
   - [ ] Usecases use domain validation
   - [ ] Usecases return domain types
   - [ ] No infrastructure imports in usecases
   - [ ] JSDoc documentation present

3. **Hooks Layer (Ticket #24):**
   - [ ] Hooks call usecases, not repositories directly
   - [ ] Hooks use React Query properly
   - [ ] Cache invalidation implemented correctly
   - [ ] No business logic in hooks

4. **Presentation Layer (Ticket #25):**
   - [ ] Components receive data via props or hooks
   - [ ] No business logic in components
   - [ ] No direct Supabase calls
   - [ ] Components follow conventions (arrow functions, type props, memoization)
   - [ ] Styles use variables from `styles/variables/*`
   - [ ] Accessibility utilities from `shared/a11y/` used

5. **File Organization:**
   - [ ] Usecases in `core/usecases/`
   - [ ] Hooks in `presentation/hooks/`
   - [ ] Page-specific components in `presentation/components/catalog/`
   - [ ] Reusable components in `presentation/components/ui/`
   - [ ] SCSS modules in component folders

6. **Import Rules:**
   - [ ] Absolute imports with `@/` prefix
   - [ ] No relative imports from `src/`
   - [ ] Import order: external → domain → usecases → infrastructure → presentation → styles

**Files to Review:**
- `src/core/usecases/product.ts` (createProduct, updateProduct)
- `src/presentation/hooks/useProducts.ts` (useCreateProduct, useUpdateProduct)
- `src/presentation/components/catalog/ProductsTable/ProductsTable.tsx`
- `src/presentation/components/catalog/ProductForm/ProductForm.tsx`
- `src/app/dashboard/catalog/page.tsx`
- `src/app/dashboard/catalog/new/page.tsx`
- `src/app/dashboard/catalog/[id]/edit/page.tsx`

Verify all architecture rules are followed and report any violations.
```

## Open Questions

1. **getProductById usecase/hook:** Does EditProductPage need a `getProductById` usecase and hook, or can it use the repository directly in a hook? Activity pages don't have `getActivityById` usecase, but they might use repository directly. **Decision needed:** Follow Activity pattern (repository in hook) or create usecase for consistency.

2. **Currency formatting:** Should unitCost and salePrice be formatted as currency in the ProductsTable? If yes, use existing currency utilities or format in component? **Decision needed:** Check if `shared/utils/currency.ts` exists and use it, or format in component.

3. **ProductType enum display labels:** How should ProductType enum values be displayed in the Select component? Should we create a mapping object (e.g., `SAC_BANANE` → "Sac banane")? **Decision needed:** Create mapping object or use enum values directly.

4. **Weight field display:** How should weight be displayed in ProductsTable? Show in grams, kilograms, or with unit label? **Decision needed:** Format weight display (e.g., "150 g" or "0.15 kg").

5. **Table sorting:** Should ProductsTable support sorting by columns? This is a future enhancement, but should we prepare the structure? **Decision:** Defer to future ticket, no sorting in initial implementation.

6. **Form default values:** Should ProductForm have default values for any fields in create mode? (e.g., stock = 0, type = first enum value) **Decision:** No defaults, user must fill all required fields.

## MVP Cut List

If time is limited, the following can be deferred:

1. **Weight field:** Make weight field optional and defer validation/display complexity
2. **Empty state:** Simple empty state message, defer fancy empty state design
3. **Loading skeletons:** Use simple loading indicators, defer skeleton loaders
4. **Currency formatting:** Display raw numbers, defer currency formatting
5. **ProductType labels:** Use enum values directly, defer label mapping
6. **Error message details:** Simple error messages, defer detailed error mapping

**Core MVP (must have):**

-   ProductsTable with basic display
-   ProductForm with all required fields
-   CatalogPage with products list
-   NewProductPage for creating products
-   EditProductPage for editing products
-   Basic validation and error handling
-   Accessibility compliance (WCAG 2.1 AA)
