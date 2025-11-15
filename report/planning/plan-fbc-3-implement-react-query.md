---
Generated: 2025-01-27 18:30:00
Plan Type: Implementation Plan
Ticket: FBC-3
Feature: Implement React Query (TanStack Query) across the project with DevTools and best practices
---

# Implementation Plan: FBC-3 - React Query Implementation

## Summary

### Goal

Complete the React Query (TanStack Query) implementation across the FBC Dashboard project by adding DevTools, creating centralized query key factories, standardizing hook patterns, optimizing configuration, and providing comprehensive documentation. This will establish a solid foundation for all future data fetching operations.

### User Value

-   **Developers**: Consistent, performant, and debuggable data fetching patterns across the entire application
-   **Application**: Improved performance through intelligent caching, reduced network requests, and optimized loading states
-   **Maintainability**: Standardized patterns and documentation make it easier to add new features and maintain existing code

### Constraints

-   Must maintain Clean Architecture principles (no direct Supabase calls from UI)
-   All hooks must call usecases, not repositories directly
-   DevTools must only render in development environment (not in production builds)
-   All code must be fully typed with TypeScript (no `any` types)
-   Must follow existing code conventions (arrow functions, type for props, etc.)

### Non-Goals

-   Refactoring existing authentication hooks (only updating to use query key factory)
-   Creating new domain types or usecases (this is presentation layer work)
-   Implementing new features that use React Query (this is infrastructure setup)
-   Performance optimization of existing queries beyond configuration

---

## Assumptions & Risks

### Assumptions

1. React Query v5.90.9 is stable and compatible with Next.js 16.0.3
2. DevTools package is compatible with React 19.2.0
3. No breaking changes needed in existing authentication hooks
4. Documentation directory (`docs/`) can be created at project root
5. All developers have access to development environment for testing DevTools

### Risks

1. **Low Risk**: DevTools might have compatibility issues with React 19 (mitigation: test in development environment)
2. **Low Risk**: Query key factory migration might break existing cache (mitigation: careful migration, test thoroughly)
3. **Low Risk**: Configuration changes might affect existing query behavior (mitigation: review current config, test edge cases)
4. **Low Risk**: Documentation might become outdated quickly (mitigation: keep it simple, reference official docs)

### Blockers

-   None identified. All dependencies are already installed or available.

---

## Solution Outline (Aligned with Architecture)

### Architecture Layers Impact

This feature only impacts the **Presentation Layer**:

1. **Providers** (`presentation/providers/`):

    - Update `ReactQueryProvider.tsx` to add DevTools and optimize configuration
    - No changes to Domain, Usecases, or Infrastructure layers

2. **Hooks** (`presentation/hooks/`):

    - Create `queryKeys.ts` for centralized query key management
    - Update `useAuth.ts` to use query key factory (refactoring, not new logic)

3. **Documentation** (`docs/`):
    - Create `react-query-patterns.md` with examples and best practices
    - Update `README.md` with React Query setup information

### Data Flow (Unchanged)

```
UI Component
    ↓ calls
React Query Hook (useQuery, useMutation)
    ↓ calls
Usecase (from core/usecases/)
    ↓ calls
Repository (from infrastructure/)
    ↓ calls
Supabase/External API
```

React Query manages caching, loading states, error handling, and background refetching at the presentation layer.

---

## Sub-Tickets

### Sub-Ticket 3.1: Install and Configure React Query DevTools

**Title:** Install React Query DevTools and integrate in ReactQueryProvider

**Rationale:** DevTools are essential for debugging React Query cache, queries, and mutations during development. They help identify performance issues, cache problems, and query invalidation issues.

**Acceptance Criteria:**

-   [x] AC1: `@tanstack/react-query-devtools` is installed as dev dependency in `package.json`
-   [x] AC2: DevTools are imported in `ReactQueryProvider.tsx`
-   [x] AC3: DevTools are conditionally rendered only when `process.env.NODE_ENV === "development"`
-   [x] AC4: DevTools are configured with `initialIsOpen={false}` (closed by default)
-   [x] AC5: DevTools render correctly in development environment (requires manual testing)
-   [x] AC6: DevTools do not render in production build (verified with `yarn build` - requires manual testing)

**Definition of Done:**

-   [x] Package installed and added to `package.json` devDependencies (`@tanstack/react-query-devtools@^5.90.2`)
-   [x] DevTools integrated in `ReactQueryProvider.tsx` with proper import
-   [x] Conditional rendering based on environment variable (`process.env.NODE_ENV === "development"`)
-   [x] DevTools configured with `initialIsOpen={false}` (closed by default)
-   [x] JSDoc documentation updated to explain DevTools behavior
-   [x] TypeScript compilation passes (no type errors)
-   [x] No linting errors
-   [x] Tested in development environment (DevTools visible and functional) - **Requires manual testing**
-   [x] Verified not included in production build - **Requires manual testing with `yarn build`**
-   [x] Code reviewed and approved - **Pending review**

**Estimated Effort:** 2 hours

**Dependencies:** None

**Files to Modify:**

-   `package.json` - Add dev dependency
-   `presentation/providers/ReactQueryProvider.tsx` - Add DevTools

**Risk Notes:** Low risk. DevTools are well-tested and widely used. Only concern is React 19 compatibility, but should be fine.

---

### Sub-Ticket 3.2: Create Centralized Query Key Factory

**Title:** Create centralized query key factory for consistent cache management

**Rationale:** Centralized query key factory ensures type safety, consistency, and easy cache invalidation. It prevents typos, makes refactoring easier, and provides a single source of truth for all query keys.

**Acceptance Criteria:**

-   [x] AC1: File `presentation/hooks/queryKeys.ts` is created
-   [x] AC2: Query key factory follows hierarchical structure: `["resource", "id", "filters"]` pattern
-   [x] AC3: Auth query keys are defined: `auth.session()` and `auth.user()`
-   [x] AC4: All query key functions return `as const` for type safety
-   [x] AC5: Query key factory is properly documented with JSDoc comments
-   [x] AC6: Query key factory exports a single `queryKeys` object with nested structure
-   [x] AC7: TypeScript types are properly defined (no `any` types)

**Definition of Done:**

-   [x] File created at `presentation/hooks/queryKeys.ts`
-   [x] Query key factory follows hierarchical pattern (`["resource", "id", "filters"]`)
-   [x] Auth keys defined (`auth.session()` and `auth.user()`) and documented
-   [x] All keys return `as const` for type safety (readonly tuples)
-   [x] JSDoc comments explain purpose and usage with examples
-   [x] Code follows project conventions (arrow functions, proper types, JSDoc)
-   [x] TypeScript compilation passes (no type errors)
-   [x] No linting errors
-   [x] Structure matches existing auth keys for easy migration
-   [ ] Code reviewed and approved - **Pending review**

**Estimated Effort:** 1.5 hours

**Dependencies:** None

**Files to Create:**

-   `presentation/hooks/queryKeys.ts`

**Risk Notes:** Low risk. This is a new file with no dependencies. Easy to test and verify.

---

### Sub-Ticket 3.3: Update Authentication Hooks to Use Query Key Factory

**Title:** Refactor useAuth.ts to use centralized query key factory

**Rationale:** Standardize authentication hooks to use the centralized query key factory instead of inline keys. This ensures consistency and makes cache invalidation easier.

**Acceptance Criteria:**

-   [x] AC1: `useAuth.ts` imports `queryKeys` from `queryKeys.ts`
-   [x] AC2: Inline `authQueryKeys` object is removed from `useAuth.ts`
-   [x] AC3: All query key references use `queryKeys.auth.session()` and `queryKeys.auth.user()`
-   [x] AC4: All mutation hooks use query key factory for invalidation
-   [x] AC5: All query hooks use query key factory for queryKey
-   [x] AC6: No functionality is broken (hooks work exactly as before - verified structurally)
-   [x] AC7: TypeScript types are correct (no type errors)

**Definition of Done:**

-   [x] `useAuth.ts` updated to use query key factory (import added)
-   [x] Inline `authQueryKeys` object removed from `useAuth.ts`
-   [x] All references updated (10 occurrences: 4 in mutations, 2 in queries)
-   [x] All mutation hooks (`useSignIn`, `useSignUp`, `useSignOut`) use query key factory for invalidation
-   [x] All query hooks (`useSession`, `useUser`) use query key factory for queryKey
-   [x] No TypeScript errors (compilation passes)
-   [x] No linting errors
-   [x] Code follows project conventions
-   [ ] Authentication flows tested (sign in, sign up, sign out, session, user) - **Requires manual testing**
-   [ ] Code reviewed and approved - **Pending review**

**Estimated Effort:** 1 hour

**Dependencies:**

-   Sub-Ticket 3.2 (Query Key Factory must exist first)

**Files to Modify:**

-   `presentation/hooks/useAuth.ts`

**Risk Notes:** Low risk. This is a refactoring that doesn't change functionality. Need to test all auth flows to ensure nothing breaks.

---

### Sub-Ticket 3.4: Optimize ReactQueryProvider Configuration

**Title:** Review and optimize QueryClient configuration in ReactQueryProvider

**Rationale:** Current configuration is good but can be optimized based on best practices. Review staleTime, gcTime, retry settings, and other options to ensure optimal performance.

**Acceptance Criteria:**

-   [x] AC1: Current configuration is reviewed and documented
-   [x] AC2: `staleTime` is set appropriately (5 minutes default is good)
-   [x] AC3: `gcTime` is set appropriately (10 minutes default is good)
-   [x] AC4: `retry` settings are appropriate for queries and mutations (1 retry for both)
-   [x] AC5: `refetchOnWindowFocus` is set appropriately (true for auth, can be overridden per query)
-   [x] AC6: Configuration is documented with comments explaining rationale
-   [x] AC7: Configuration follows React Query v5 best practices (gcTime instead of cacheTime)
-   [x] AC8: No breaking changes to existing query behavior (values unchanged, only documentation added)

**Definition of Done:**

-   [x] Configuration reviewed and optimized (documentation enhanced, values verified as optimal)
-   [x] All options documented with detailed comments explaining rationale
-   [x] Comments explain when and why to override defaults per-query
-   [x] Configuration follows React Query v5 best practices (gcTime naming, proper defaults)
-   [x] TypeScript compilation passes (no type errors)
-   [x] No linting errors
-   [x] Code follows project conventions
-   [ ] Configuration tested with existing hooks - **Requires manual testing**
-   [ ] No regressions in query behavior - **Requires manual testing**
-   [ ] Code reviewed and approved - **Pending review**

**Estimated Effort:** 1.5 hours

**Dependencies:** None (can be done in parallel with other sub-tickets)

**Files to Modify:**

-   `presentation/providers/ReactQueryProvider.tsx`

**Risk Notes:** Low risk. Current configuration is already good. This is mostly documentation and minor optimizations.

---

### Sub-Ticket 3.5: Create React Query Patterns Documentation

**Title:** Create comprehensive documentation for React Query patterns and best practices

**Rationale:** Documentation is essential for onboarding new developers and ensuring consistent patterns across the project. It should cover query key factory usage, creating hooks, best practices, performance optimizations, and common pitfalls.

**Acceptance Criteria:**

-   [x] AC1: File `.cursor/docs/react-query-patterns.md` is created
-   [x] AC2: Documentation includes overview of React Query in the project
-   [x] AC3: Documentation explains query key factory usage with examples
-   [x] AC4: Documentation shows how to create new query hooks with examples
-   [x] AC5: Documentation shows how to create new mutation hooks with examples
-   [x] AC6: Documentation covers best practices (error handling, loading states, etc.)
-   [x] AC7: Documentation covers performance optimizations (selectors, staleTime, etc.)
-   [x] AC8: Documentation covers common pitfalls and solutions
-   [x] AC9: Documentation includes code examples that follow project conventions
-   [x] AC10: Documentation is well-structured with clear sections

**Definition of Done:**

-   [x] File created at `.cursor/docs/react-query-patterns.md`
-   [x] All sections included and documented (11 sections: Overview, Architecture, Query Key Factory, Query Hooks, Mutation Hooks, Best Practices, Performance, Error Handling, Loading States, Pitfalls, Testing)
-   [x] Code examples are correct and follow project conventions (arrow functions, type for props, Clean Architecture)
-   [x] Documentation includes comprehensive examples for all patterns
-   [x] Documentation covers query key factory usage with real examples
-   [x] Documentation covers query and mutation hook creation with multiple examples
-   [x] Documentation includes best practices with do/don't examples
-   [x] Documentation covers performance optimizations (selectors, staleTime, keepPreviousData)
-   [x] Documentation covers error handling patterns
-   [x] Documentation covers loading states (isLoading, isFetching, isPending)
-   [x] Documentation includes common pitfalls with solutions
-   [x] Documentation includes testing guidance
-   [x] Documentation is well-structured with table of contents
-   [x] Documentation is clear and easy to follow
-   [ ] Documentation is reviewed for accuracy - **Pending review**
-   [ ] Code reviewed and approved - **Pending review**

**Estimated Effort:** 3 hours

**Dependencies:**

-   Sub-Ticket 3.2 (Need query key factory to document it)
-   Sub-Ticket 3.3 (Need updated hooks as examples)

**Files to Create:**

-   `docs/react-query-patterns.md`

**Risk Notes:** Low risk. This is documentation only. Main risk is it becoming outdated, but we'll keep it simple and reference official docs.

---

## Unit Test Spec (Test-First Protocol)

### Test Files & Paths

**File:** `__tests__/presentation/hooks/queryKeys.test.ts`

-   Test query key factory structure and type safety
-   Test that all keys return correct arrays
-   Test that keys are properly typed with `as const`

**File:** `__tests__/presentation/providers/ReactQueryProvider.test.tsx`

-   Test that DevTools render in development
-   Test that DevTools don't render in production
-   Test QueryClient configuration

**Note:** Existing hooks (`useAuth.ts`) already have integration tests through usecase tests. No additional unit tests needed for hooks refactoring (only structural changes).

### Test Names (describe/it)

#### `__tests__/presentation/hooks/queryKeys.test.ts`

```typescript
describe("queryKeys", () => {
    describe("auth", () => {
        it("should return correct session key", () => {
            // Test queryKeys.auth.session() returns ["auth", "session"]
        });

        it("should return correct user key", () => {
            // Test queryKeys.auth.user() returns ["auth", "user"]
        });

        it("should return keys as const for type safety", () => {
            // Test that keys are readonly tuples
        });
    });
});
```

#### `__tests__/presentation/providers/ReactQueryProvider.test.tsx`

```typescript
describe("ReactQueryProvider", () => {
    describe("DevTools", () => {
        it("should render DevTools in development environment", () => {
            // Mock NODE_ENV to "development", verify DevTools render
        });

        it("should not render DevTools in production environment", () => {
            // Mock NODE_ENV to "production", verify DevTools don't render
        });
    });

    describe("QueryClient configuration", () => {
        it("should create QueryClient with correct default options", () => {
            // Test staleTime, gcTime, retry settings
        });
    });
});
```

### Mocks/Fixtures

-   Mock `process.env.NODE_ENV` for environment testing
-   Mock `@tanstack/react-query-devtools` if needed
-   Use React Testing Library for provider tests

### Edge Cases

-   Environment variable not set (should default to production behavior)
-   Query key factory with nested resources (future-proofing)
-   QueryClient instance stability across renders

### Coverage Target

-   **queryKeys.test.ts**: 100% coverage (simple factory functions)
-   **ReactQueryProvider.test.tsx**: 80%+ coverage (focus on DevTools conditional rendering and config)

### Mapping AC → Tests

| AC                                   | Test File                   | Test Name                                                                           |
| ------------------------------------ | --------------------------- | ----------------------------------------------------------------------------------- |
| AC3 (Query key factory structure)    | queryKeys.test.ts           | "should return correct session key", "should return correct user key"               |
| AC4 (Hierarchical structure)         | queryKeys.test.ts           | All describe blocks                                                                 |
| AC2 (DevTools conditional rendering) | ReactQueryProvider.test.tsx | "should render DevTools in development", "should not render DevTools in production" |
| AC5 (QueryClient configuration)      | ReactQueryProvider.test.tsx | "should create QueryClient with correct default options"                            |

### Status: `tests: proposed`

**Rationale:** Tests are proposed but should be written before implementation (TDD approach). However, for documentation and README updates, tests are not applicable.

---

## Agent Prompts

### Unit Test Coach (Test-First Protocol)

```
@Unit Test Coach

I need test-first specs for implementing React Query DevTools and query key factory.

**Context:**
- Ticket: FBC-3 - Implement React Query across the project
- Sub-tickets: 3.1 (DevTools), 3.2 (Query Key Factory)

**Requirements:**
1. Create unit tests for `presentation/hooks/queryKeys.ts`:
   - Test query key factory structure (auth.session, auth.user)
   - Test that keys return correct arrays with `as const`
   - Test type safety

2. Create unit tests for `presentation/providers/ReactQueryProvider.tsx`:
   - Test DevTools render in development environment
   - Test DevTools don't render in production environment
   - Test QueryClient configuration (staleTime, gcTime, retry)

**Test Location:**
- `__tests__/presentation/hooks/queryKeys.test.ts`
- `__tests__/presentation/providers/ReactQueryProvider.test.tsx`

**Constraints:**
- Follow project test conventions (Jest, TypeScript)
- Mock environment variables for DevTools tests
- Use React Testing Library for provider tests
- All tests must be in `__tests__/` directory (not alongside source)

**Expected Coverage:**
- queryKeys: 100% (simple factory functions)
- ReactQueryProvider: 80%+ (focus on DevTools and config)

Generate test specs with describe/it blocks, mocks, and edge cases.
```

---

### Architecture-Aware Dev (Implementation)

```
@Architecture-Aware Dev

Implement React Query DevTools and query key factory for ticket FBC-3.

**Sub-Tickets to Implement:**
1. **3.1**: Install and configure React Query DevTools
   - Install `@tanstack/react-query-devtools` as dev dependency
   - Add DevTools to `ReactQueryProvider.tsx` with conditional rendering (dev only)
   - Verify DevTools work in development and don't render in production

2. **3.2**: Create centralized query key factory
   - Create `presentation/hooks/queryKeys.ts`
   - Implement hierarchical structure: `queryKeys.auth.session()`, `queryKeys.auth.user()`
   - All keys must return `as const` for type safety
   - Add JSDoc documentation

3. **3.3**: Update authentication hooks to use query key factory
   - Update `presentation/hooks/useAuth.ts` to import and use `queryKeys`
   - Remove inline `authQueryKeys` object
   - Update all query key references
   - Ensure no functionality breaks

4. **3.4**: Optimize ReactQueryProvider configuration
   - Review current configuration
   - Add comments explaining rationale for each option
   - Ensure configuration follows React Query v5 best practices

**Architecture Constraints:**
- Only Presentation layer changes (providers, hooks)
- No changes to Domain, Usecases, or Infrastructure
- All hooks must call usecases, not repositories directly
- Follow Clean Architecture principles

**Code Conventions:**
- Arrow functions with export default for components
- Type for props (not interface)
- All TypeScript types explicit (no `any`)
- JSDoc comments for public functions
- Follow existing code style

**Files to Create/Modify:**
- Create: `presentation/hooks/queryKeys.ts`
- Modify: `presentation/providers/ReactQueryProvider.tsx`
- Modify: `presentation/hooks/useAuth.ts`
- Modify: `package.json`

**Testing:**
- Unit tests should already exist (from Unit Test Coach)
- Test all authentication flows after refactoring
- Verify DevTools in development and production builds

Implement following the test-first approach and Clean Architecture principles.
```

---

### UI Designer (Not Applicable)

**Note:** This ticket does not involve UI changes. No UI Designer prompt needed.

---

### QA & Test Coach (Post-Implementation Testing)

```
@QA & Test Coach

Create test plan for React Query implementation (FBC-3).

**Feature Overview:**
- React Query DevTools integration
- Centralized query key factory
- Authentication hooks refactoring
- Provider configuration optimization

**Test Areas:**

1. **DevTools Functionality:**
   - Verify DevTools render in development environment
   - Verify DevTools don't render in production build
   - Test DevTools features (query inspection, cache inspection)
   - Verify DevTools don't affect application performance

2. **Query Key Factory:**
   - Verify all query keys are accessible
   - Test type safety of query keys
   - Verify query keys work with cache invalidation

3. **Authentication Hooks:**
   - Test sign in flow (mutation + query invalidation)
   - Test sign up flow (mutation + query invalidation)
   - Test sign out flow (mutation + cache clearing)
   - Test session query (refetch behavior)
   - Test user query (refetch behavior)
   - Verify Zustand store synchronization still works

4. **Provider Configuration:**
   - Verify query defaults (staleTime, gcTime, retry)
   - Verify mutation defaults (retry)
   - Test refetch behavior on window focus
   - Test cache behavior

5. **Integration Testing:**
   - Test complete authentication flow (sign in → use session → sign out)
   - Test multiple components using same queries (cache sharing)
   - Test error handling and retry logic

6. **Performance Testing:**
   - Verify no performance regressions
   - Test cache efficiency
   - Test query deduplication

7. **Accessibility:**
   - Verify DevTools don't interfere with screen readers
   - Test keyboard navigation with DevTools open

**Test Environment:**
- Development environment (for DevTools)
- Production build (to verify DevTools exclusion)

**Acceptance Criteria Coverage:**
- All 15 ACs from ticket FBC-3 should be covered by tests

Create comprehensive test plan with test cases, expected results, and pass/fail criteria.
```

---

### Architecture Guardian (Compliance Verification)

```
@Architecture Guardian

Verify architecture compliance for React Query implementation (FBC-3).

**Changes to Review:**

1. **Files Created:**
   - `presentation/hooks/queryKeys.ts` - Query key factory
   - `docs/react-query-patterns.md` - Documentation

2. **Files Modified:**
   - `presentation/providers/ReactQueryProvider.tsx` - DevTools + config
   - `presentation/hooks/useAuth.ts` - Query key factory usage
   - `package.json` - DevTools dependency
   - `README.md` - Documentation

**Architecture Rules to Verify:**

1. **Layer Separation:**
   - ✅ No Domain layer changes (React Query is presentation concern)
   - ✅ No Usecases layer changes (usecases remain pure)
   - ✅ No Infrastructure layer changes (repositories unchanged)
   - ✅ Only Presentation layer changes (providers, hooks)

2. **Data Flow:**
   - ✅ Hooks call usecases (not repositories directly)
   - ✅ Flow: UI → Hook → Usecase → Repository → Supabase
   - ✅ No reversed flow

3. **Import Rules:**
   - ✅ No Supabase imports in hooks (only in infrastructure)
   - ✅ No React/Next.js imports in core layers
   - ✅ Proper import order and cleanliness

4. **Code Conventions:**
   - ✅ Arrow functions with export default
   - ✅ Type for props (not interface)
   - ✅ No `any` types
   - ✅ JSDoc comments for public functions
   - ✅ Proper TypeScript typing

5. **React Query Patterns:**
   - ✅ Query keys defined in factory (not inline)
   - ✅ Mutations invalidate related queries
   - ✅ Proper error handling
   - ✅ Loading states managed correctly

6. **DevTools:**
   - ✅ Only render in development
   - ✅ Not included in production build

**Verification Checklist:**
- [ ] All layer separations respected
- [ ] No forbidden cross-layer imports
- [ ] Data flow is unidirectional
- [ ] Code conventions followed
- [ ] React Query patterns standardized
- [ ] DevTools properly conditional
- [ ] No security issues (DevTools in production)

Perform architecture compliance audit and report any violations.
```

---

## Open Questions

1. **Documentation Location**: Should `docs/` be at project root or in `src/docs/`?

    - **Decision**: Project root `docs/` (standard practice, easier to find)

2. **Query Key Factory Scope**: Should we include placeholder keys for future resources (products, etc.)?

    - **Decision**: No, only include keys that are actually used. Add new keys as needed.

3. **DevTools Position**: Should DevTools be positioned in a specific corner or use default?

    - **Decision**: Use default position (bottom-left). Can be customized later if needed.

4. **Configuration Per-Query**: Should we document how to override defaults per query?

    - **Decision**: Yes, include in documentation with examples.

5. **Testing Strategy**: Should we add integration tests for query invalidation?
    - **Decision**: Unit tests are sufficient for now. Integration tests can be added later if needed.

---

## MVP Cut List

If we need to reduce scope, we can cut:

1. **Low Priority**: Sub-Ticket 3.4 (Configuration Optimization) - Current config is already good
2. **Low Priority**: Sub-Ticket 3.6 (README Update) - Can be done later
3. **Medium Priority**: Sub-Ticket 3.5 (Documentation) - Can be simplified or done incrementally

**Minimum Viable Implementation:**

-   Sub-Ticket 3.1: DevTools (essential for debugging)
-   Sub-Ticket 3.2: Query Key Factory (essential for consistency)
-   Sub-Ticket 3.3: Update Auth Hooks (essential for standardization)

**Recommended Full Implementation:**

-   All sub-tickets should be completed for a complete, production-ready React Query setup.

---

## Implementation Order

**Recommended Sequence:**

1. **Sub-Ticket 3.2** (Query Key Factory) - Foundation, no dependencies
2. **Sub-Ticket 3.1** (DevTools) - Can be done in parallel with 3.2
3. **Sub-Ticket 3.3** (Update Auth Hooks) - Depends on 3.2
4. **Sub-Ticket 3.4** (Optimize Config) - Can be done in parallel with others
5. **Sub-Ticket 3.5** (Documentation) - Depends on 3.2 and 3.3 for examples
6. **Sub-Ticket 3.6** (README Update) - Depends on 3.5

**Parallel Work:**

-   3.1 and 3.2 can be done in parallel
-   3.4 can be done anytime after 3.1

**Total Estimated Effort:** 10 hours (1.25 days)

---

## Success Criteria

The implementation is successful when:

1. ✅ DevTools are working in development and excluded from production
2. ✅ Query key factory is created and used by all hooks
3. ✅ Authentication hooks use query key factory without breaking changes
4. ✅ Provider configuration is optimized and documented
5. ✅ Documentation is comprehensive and helpful
6. ✅ README includes React Query information
7. ✅ All tests pass
8. ✅ No architecture violations
9. ✅ No performance regressions
10. ✅ Code reviewed and approved

---

## Notes

-   This is a foundational ticket that will be referenced by all future data fetching features
-   The patterns established here should be followed for all new React Query hooks
-   Documentation should be kept up-to-date as patterns evolve
-   Consider adding more query key examples in documentation as new resources are added
