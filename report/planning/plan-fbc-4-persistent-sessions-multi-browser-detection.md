---
Generated: 2025-01-27 20:00:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-4
---

# Implementation Plan: Persistent Session Management with Cross-Tab Synchronization

## Summary

### Goal

Implement persistent session management with real-time cross-tab synchronization using Supabase's `onAuthStateChange` listener. Sessions remain active as long as Supabase considers the token valid, automatically disconnecting when the token expires or is invalidated.

### User Value

-   **Seamless Experience**: Sessions persist across browser tabs and windows as long as Supabase validates the token
-   **Automatic Disconnection**: When Supabase detects token expiration or invalidation, user is automatically signed out across all tabs
-   **Real-time Sync**: Session changes (sign in/out, token refresh) are synchronized across all tabs in real-time via Supabase events

### Constraints

-   Must follow Clean Architecture (Domain → Usecases → Infrastructure → Presentation)
-   No business logic in UI components
-   React Query for server state, Zustand for UI state only
-   TypeScript strict mode (no `any` types)
-   No direct Supabase calls from UI

### Non-Goals

-   Multi-session detection and alerts (simplified approach - rely on Supabase's built-in validation)
-   Manual session tracking or expiration management (Supabase handles this)
-   Custom cross-tab synchronization (Supabase handles this via localStorage)

---

## Assumptions & Risks

### Assumptions

1. Supabase `auth.onAuthStateChange()` is available and works reliably
2. Supabase automatically handles cross-tab synchronization via localStorage
3. Supabase automatically triggers `SIGNED_OUT` event when token expires or is invalidated
4. Supabase automatically triggers `TOKEN_REFRESHED` event when token is refreshed

### Risks

1. **Memory Leaks**: Event listeners not cleaned up properly (mitigation: strict cleanup in useEffect)
2. **Supabase API Changes**: `onAuthStateChange` API might change in future versions (mitigation: follow Supabase documentation)
3. **Subscription Failures**: `onAuthStateChange` might fail to subscribe (mitigation: error handling and graceful degradation)

---

## Solution Outline (Aligned with Architecture)

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Provider (AuthStateChangeProvider)             │  │
│  │   Hook (useAuthStateChange)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    Usecases Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • subscribeToAuthChanges(repo, callback)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • authRepositorySupabase.onAuthStateChange()     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                      Domain Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • SessionChangeEvent type                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Domain Layer**: Pure TypeScript type for session change events
2. **Usecases Layer**: Single usecase for subscribing to auth state changes
3. **Infrastructure Layer**: Supabase integration using `auth.onAuthStateChange()`
4. **Presentation Layer**: Provider and hook to manage listener and update stores/cache

### Simplified Approach

-   **Keep it simple**: As long as Supabase considers the token active, maintain the session
-   When Supabase detects token expiration or invalidation, it triggers `SIGNED_OUT` event automatically
-   We listen to these events and update Zustand store + React Query cache accordingly
-   No manual session tracking or multi-session detection needed
-   Supabase handles all session validation and cross-tab synchronization automatically

---

## Sub-Tickets

### Sub-Ticket 4.1: Domain Type for Session Change Event

**Title:** Add `SessionChangeEvent` type to domain

**Rationale:**
Foundation type needed before implementing session management logic. This type represents Supabase auth state change events.

**Acceptance Criteria:**

-   [x] AC1: `SessionChangeEvent` type defined in `core/domain/auth.ts`
-   [x] AC2: Type has `event` property with union type: `"SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED" | "PASSWORD_RECOVERY"`
-   [x] AC3: Type has `session` property with type `Session | null`
-   [x] AC4: Type is properly documented with JSDoc comments
-   [x] AC5: Type is exported from domain module

**Definition of Done:**

-   [x] Type added to `core/domain/auth.ts`
-   [x] Type exported from domain module
-   [x] JSDoc comments added
-   [x] No TypeScript errors
-   [x] Type follows existing domain patterns

**Estimated Effort:** 1 hour

**Dependencies:** None (foundation)

**Owner:** Backend Developer

**Risk Notes:** Low risk - pure TypeScript type

---

### Sub-Ticket 4.2: Extend AuthRepository Interface

**Title:** Extend AuthRepository port with onAuthStateChange method

**Rationale:**
Repository interface must define the contract before implementing Supabase-specific logic.

**Acceptance Criteria:**

-   [x] AC1: `onAuthStateChange` method added to `AuthRepository` interface
-   [x] AC2: Method signature: `onAuthStateChange(callback: (event: SessionChangeEvent) => void): () => void`
-   [x] AC3: Method returns cleanup function for unsubscribing
-   [x] AC4: Interface is properly documented with JSDoc comments
-   [x] AC5: Method follows existing repository patterns

**Definition of Done:**

-   [x] Interface updated in `core/ports/authRepository.ts`
-   [x] JSDoc comments added
-   [x] No TypeScript errors
-   [x] Interface follows existing port patterns

**Estimated Effort:** 1 hour

**Dependencies:** Sub-Ticket 4.1 (domain type)

**Owner:** Backend Developer

**Risk Notes:** Low risk - interface definition only

---

### Sub-Ticket 4.3: Implement onAuthStateChange in Infrastructure

**Title:** Implement Supabase onAuthStateChange listener in authRepositorySupabase

**Rationale:**
Infrastructure layer must implement the repository interface using Supabase's auth API.

**Acceptance Criteria:**

-   [x] AC1: `onAuthStateChange` implemented in `authRepositorySupabase.ts`
-   [x] AC2: Uses Supabase's `auth.onAuthStateChange()` method
-   [x] AC3: Maps Supabase events to domain `SessionChangeEvent` type
-   [x] AC4: Maps Supabase session to domain `Session` type using existing `mapSupabaseSessionToDomain` mapper
-   [x] AC5: Returns cleanup function that unsubscribes listener
-   [x] AC6: Handles errors gracefully with proper error transformation

**Definition of Done:**

-   [x] Method implemented in `infrastructure/supabase/authRepositorySupabase.ts`
-   [x] Uses existing `mapSupabaseSessionToDomain` mapper
-   [x] Error handling implemented
-   [x] JSDoc comments added
-   [x] No TypeScript errors
-   [x] Follows existing infrastructure patterns

**Estimated Effort:** 2 hours

**Dependencies:** Sub-Ticket 4.1 (domain types), Sub-Ticket 4.2 (repository interface)

**Owner:** Backend Developer

**Risk Notes:** Medium risk - Supabase API integration, need to test event handling

---

### Sub-Ticket 4.4: Subscribe to Auth Changes Usecase

**Title:** Implement usecase for subscribing to auth state changes

**Rationale:**
Business logic for subscribing to auth state changes must be in usecases layer.

**Acceptance Criteria:**

-   [x] AC1: `subscribeToAuthChanges` usecase created in `core/usecases/auth.ts`
-   [x] AC2: Usecase signature: `subscribeToAuthChanges(repo: AuthRepository, callback: (event: SessionChangeEvent) => void): () => void`
-   [x] AC3: Usecase calls repository's `onAuthStateChange` method
-   [x] AC4: Usecase returns cleanup function from repository
-   [x] AC5: Usecase is pure function that takes repository as parameter
-   [x] AC6: Usecase is properly documented with JSDoc comments

**Definition of Done:**

-   [x] Usecase added to `core/usecases/auth.ts`
-   [x] JSDoc comments added
-   [ ] Unit tests written (see Test Spec)
-   [x] No TypeScript errors
-   [x] Follows existing usecase patterns

**Estimated Effort:** 2 hours

**Dependencies:** Sub-Ticket 4.2 (repository interface), Sub-Ticket 4.3 (infrastructure)

**Owner:** Backend Developer

**Risk Notes:** Low risk - thin wrapper around repository method

---

### Sub-Ticket 4.5: AuthStateChange Hook

**Title:** Create React hook for subscribing to auth state changes

**Rationale:**
Presentation layer needs a hook to subscribe to auth state changes and update stores/cache.

**Acceptance Criteria:**

-   [x] AC1: `useAuthStateChange` hook created in `presentation/hooks/useAuthStateChange.ts`
-   [x] AC2: Hook subscribes to auth state changes using `subscribeToAuthChanges` usecase
-   [x] AC3: Hook updates Zustand store (`useAuthStore`) on SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED events
-   [x] AC4: Hook invalidates React Query cache on SIGNED_IN/SIGNED_OUT events
-   [x] AC5: Hook properly cleans up subscription on unmount
-   [x] AC6: Hook handles errors gracefully
-   [x] AC7: Hook follows existing hook patterns

**Definition of Done:**

-   [x] Hook created in `presentation/hooks/useAuthStateChange.ts`
-   [x] Uses `subscribeToAuthChanges` usecase
-   [x] Updates `useAuthStore` appropriately (setSession, setUser, clearAuth)
-   [x] Invalidates React Query cache using queryClient
-   [x] Cleanup implemented in useEffect
-   [x] JSDoc comments added
-   [x] No TypeScript errors

**Estimated Effort:** 3 hours

**Dependencies:** Sub-Ticket 4.4 (usecases)

**Owner:** Frontend Developer

**Risk Notes:** Medium risk - event listener cleanup must be correct

---

### Sub-Ticket 4.6: AuthStateChange Provider

**Title:** Create provider component for global auth state change listener

**Rationale:**
Provider manages global auth state change listener at app level to ensure session synchronization across all pages.

**Acceptance Criteria:**

-   [x] AC1: `AuthStateChangeProvider` created in `presentation/providers/AuthStateChangeProvider.tsx`
-   [x] AC2: Provider uses `useAuthStateChange` hook
-   [x] AC3: Provider wraps children without affecting layout
-   [x] AC4: Provider follows existing provider patterns
-   [x] AC5: Provider is properly documented with JSDoc comments

**Definition of Done:**

-   [x] Provider created in `presentation/providers/AuthStateChangeProvider.tsx`
-   [x] Integrated in `app/layout.tsx` at root level
-   [x] Uses `useAuthStateChange` hook
-   [x] No layout impact
-   [x] JSDoc comments added
-   [x] No TypeScript errors

**Estimated Effort:** 2 hours

**Dependencies:** Sub-Ticket 4.5 (authStateChange hook)

**Owner:** Frontend Developer

**Risk Notes:** Low risk - wrapper component

---

## Unit Test Spec (Test-First Protocol)

### Test Files Structure

```
__tests__/
└── core/
    └── usecases/
        └── auth.test.ts (extend existing)
```

### Test Coverage

#### 1. Usecases Tests (`__tests__/core/usecases/auth.test.ts`)

**Test Suite: `subscribeToAuthChanges`**

-   `describe("subscribeToAuthChanges", () => {`
    -   `it("should subscribe to auth state changes and return cleanup function", ...)`
    -   `it("should call callback with correct event when SIGNED_IN occurs", ...)`
    -   `it("should call callback with correct event when SIGNED_OUT occurs", ...)`
    -   `it("should call callback with null session when SIGNED_OUT occurs", ...)`
    -   `it("should call callback with correct event when TOKEN_REFRESHED occurs", ...)`
    -   `it("should return cleanup function that unsubscribes listener", ...)`
    -   `it("should handle repository errors gracefully", ...)`

### Mocks/Fixtures

**Mock Repository:**

```typescript
// __mocks__/infrastructure/supabase/authRepositorySupabase.ts
const mockAuthRepository = {
    onAuthStateChange: jest.fn(() => () => {}), // Returns cleanup function
    // ... other methods
};
```

**Test Fixtures:**

```typescript
// __tests__/fixtures/sessions.ts
export const mockSessionChangeEvent: SessionChangeEvent = {
    event: "SIGNED_IN",
    session: mockSession,
};

export const mockSessionChangeEventSignedOut: SessionChangeEvent = {
    event: "SIGNED_OUT",
    session: null,
};
```

### Edge Cases

1. **Subscription Failures**: Repository fails to subscribe
2. **Cleanup Failures**: Cleanup function fails to unsubscribe
3. **Null Session Events**: Events with null session (SIGNED_OUT)
4. **Multiple Subscriptions**: Multiple components subscribe simultaneously

### Coverage Target

-   **Usecases**: 90%+ coverage

### Mapping AC → Tests

| AC   | Test Coverage                            |
| ---- | ---------------------------------------- |
| AC1  | `subscribeToAuthChanges` tests           |
| AC2  | `subscribeToAuthChanges` SIGNED_OUT      |
| AC3  | `subscribeToAuthChanges` TOKEN_REFRESHED |
| AC5  | `subscribeToAuthChanges` SIGNED_OUT      |
| AC8  | Cleanup function tests                   |
| AC10 | Error handling tests                     |

### Status

**Status:** `tests: proposed`

**Next Steps:**

1. Unit Test Coach reviews and approves test spec
2. Tests implemented before implementation (TDD)
3. Tests marked as `tests: approved` after review

---

## Agent Prompts

### 1. Unit Test Coach Prompt

```
@Unit Test Coach

Please review and approve the unit test spec for FBC-4: Persistent Session Management with Cross-Tab Synchronization.

**Test Spec Location:** `report/planning/plan-fbc-4-persistent-sessions-multi-browser-detection.md` (Unit Test Spec section)

**Test Files:**
1. `__tests__/core/usecases/auth.test.ts` (extend existing)

**Requirements:**
- Review test coverage for usecase: `subscribeToAuthChanges`
- Verify edge cases are covered (subscription failures, cleanup failures, null sessions)
- Ensure tests follow TDD principles (tests written before implementation)
- Verify mocks/fixtures are appropriate
- Check coverage targets (90%+ for usecases)

**Deliverables:**
1. Approved test spec with any necessary changes
2. Status update: `tests: approved`
3. Test implementation order recommendation

**Context:**
This is for implementing persistent session management with cross-tab synchronization using Supabase's onAuthStateChange. Tests must be written before implementation following Clean Architecture principles.
```

### 2. Architecture-Aware Dev Prompt

```
@Architecture-Aware Dev

Implement FBC-4: Persistent Session Management with Cross-Tab Synchronization following Clean Architecture principles.

**Implementation Order:**
1. Sub-Ticket 4.1: Domain Type
2. Sub-Ticket 4.2: Repository Interface
3. Sub-Ticket 4.3: Infrastructure Implementation
4. Sub-Ticket 4.4: Usecase
5. Sub-Ticket 4.5: Hook
6. Sub-Ticket 4.6: Provider

**Architecture Rules:**
- Domain → Usecases → Infrastructure → Presentation layers
- No business logic in UI components
- React Query for server state, Zustand for UI state only
- Hooks call usecases, not repositories directly
- TypeScript strict mode (no `any` types)

**Files to Create/Modify:**
See "Related Components" section in ticket `jira/4.md`

**Test-First Protocol:**
- Write unit tests BEFORE implementation (see Unit Test Spec)
- Tests must be approved (`tests: approved`) before starting
- Use TDD approach: Red → Green → Refactor

**References:**
- Ticket: `jira/4.md`
- Implementation Plan: `report/planning/plan-fbc-4-persistent-sessions-multi-browser-detection.md`
- Test Spec: See "Unit Test Spec" section in plan

**Key Technical Notes:**
- Use Supabase's `auth.onAuthStateChange()` for real-time session changes
- Supabase automatically handles cross-tab synchronization via localStorage
- When token expires, Supabase triggers `SIGNED_OUT` event automatically
- We listen to events and update Zustand store + React Query cache
- Clean up event listeners properly to prevent memory leaks

**Simplified Approach:**
- Keep it simple: As long as Supabase considers token active, maintain session
- No manual session tracking or multi-session detection needed
- Supabase handles all validation automatically

Start with Sub-Ticket 4.1 after tests are approved.
```

### 3. QA & Test Coach Prompt

```
@QA & Test Coach

Create comprehensive test plan for FBC-4: Persistent Session Management with Cross-Tab Synchronization.

**Test Plan Requirements:**

1. **E2E Test Scenarios:**
   - User signs in and has session persist across browser tabs
   - User signs out in one tab and session invalidates in all tabs
   - Token expiration automatically signs out user across all tabs
   - Token refresh automatically updates session across all tabs

2. **Integration Tests:**
   - Cross-tab session synchronization via Supabase events
   - Zustand store updates on auth state changes
   - React Query cache invalidation on auth state changes
   - Event listener cleanup

3. **Performance Tests:**
   - No memory leaks from event listeners
   - Listener setup doesn't block app initialization
   - Event handling doesn't impact performance

4. **Security Tests:**
   - Session validation handled by Supabase (no manual checks needed)
   - Cross-tab synchronization via Supabase is secure

**Test Data:**
- Mock Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
- Mock session data

**Reference:**
- Ticket: `jira/4.md` (all ACs)
- Implementation Plan: `report/planning/plan-fbc-4-persistent-sessions-multi-browser-detection.md`

**Deliverables:**
1. E2E test scenarios document
2. Integration test plan
3. Performance test criteria
4. Security test checklist

**Priority:**
- High: E2E scenarios, Cross-tab sync, Memory leaks
- Medium: Performance
- Low: Edge cases
```

### 4. Architecture Guardian Prompt

```
@Architecture Guardian

Verify architecture compliance for FBC-4: Persistent Session Management with Cross-Tab Synchronization.

**Architecture Compliance Checklist:**

1. **Layer Separation:**
   - ✅ Domain type in `core/domain/`
   - ✅ Usecase in `core/usecases/`
   - ✅ Repository interface in `core/ports/`
   - ✅ Infrastructure implementation in `infrastructure/supabase/`
   - ✅ Hook in `presentation/hooks/`
   - ✅ Provider in `presentation/providers/`

2. **Dependency Direction:**
   - ✅ Domain: No external dependencies
   - ✅ Usecases: Only depend on Domain and Ports
   - ✅ Infrastructure: Only depend on Domain and Ports
   - ✅ Presentation: Only depend on Domain, Usecases, Infrastructure
   - ❌ No forbidden cross-layer imports

3. **Business Logic:**
   - ✅ No business logic in UI components
   - ✅ Business logic in usecases only
   - ✅ Pure functions in usecases
   - ✅ Repositories passed as parameters to usecases

4. **State Management:**
   - ✅ React Query for server state (session, user)
   - ✅ Zustand for UI state only
   - ✅ No business logic in stores

5. **Code Conventions:**
   - ✅ TypeScript strict mode (no `any` types)
   - ✅ Proper JSDoc comments
   - ✅ Error handling

**Files to Review:**
See "Related Components" section in ticket `jira/4.md`

**Reference:**
- Ticket: `jira/4.md`
- Implementation Plan: `report/planning/plan-fbc-4-persistent-sessions-multi-browser-detection.md`
- Architecture Rules: `.cursor/rules/` directory

**Deliverables:**
1. Architecture compliance report
2. Violation list (if any)
3. Recommendations for fixes
4. Approval/rejection status

**Priority:**
Review after each sub-ticket implementation to catch violations early.
```

---

## Open Questions

1. **Token Expiration Time:**

    - What is the default token expiration time for Supabase sessions?
    - Should we handle custom expiration times or rely on Supabase defaults?

2. **Error Handling:**

    - Should we retry subscription if `onAuthStateChange` fails to subscribe?
    - How should we handle Supabase connection errors during subscription?

3. **Performance:**
    - Should we debounce event handling for rapid state changes?
    - Are there performance implications of invalidating React Query cache on every event?

---

## MVP Cut List

All sub-tickets are part of the MVP - no features to defer.

---

## Timeline Estimate

### Total Effort: ~11 hours

**Week 1:**

-   Day 1: Sub-Tickets 4.1, 4.2, 4.3 (Domain, Ports, Infrastructure) - 4 hours
-   Day 2: Sub-Ticket 4.4 (Usecase) - 2 hours
-   Day 3: Sub-Tickets 4.5, 4.6 (Hook, Provider) - 5 hours

**Note:** Timeline assumes:

-   Tests written in parallel with implementation (TDD)
-   Code reviews after each sub-ticket
-   Simple implementation (no complex session tracking)

---

## Success Criteria

1. ✅ `onAuthStateChange` listener implemented and working
2. ✅ Session changes synchronized in real-time across tabs
3. ✅ Token expiration automatically signs out user across all tabs
4. ✅ Token refresh automatically updates session across all tabs
5. ✅ No memory leaks from event listeners
6. ✅ Error handling for subscription failures
7. ✅ All tests pass (90%+ coverage for usecases)
8. ✅ Architecture compliance verified
9. ✅ Code reviewed and approved

---

**Plan Status:** `draft` → `review` → `approved`

**Next Steps:**

1. Review plan with team
2. Address open questions
3. Approve test spec with Unit Test Coach
4. Begin implementation following sub-ticket order
