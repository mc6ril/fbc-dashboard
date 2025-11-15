---
Generated: 2025-01-27 16:30:00
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-2
---

# Implementation Plan: Install Supabase with Authentication System and Database Connection

## Summary

### Goal

Install and configure Supabase client with a complete authentication system following Clean Architecture principles. This provides the foundation for all future database operations and user authentication in the FBC Dashboard.

### User Value

-   Secure authentication infrastructure ready for user management
-   Database connection foundation for all future features
-   Clean Architecture compliance ensuring maintainable, testable code
-   Type-safe authentication operations with proper error handling

### Constraints

-   Must follow strict Clean Architecture layer separation
-   No direct Supabase calls from UI components
-   All operations must flow: UI → Hook → Usecase → Repository → Supabase
-   Environment variables must be validated at runtime
-   TypeScript strict mode (no `any` types)
-   All code must follow project conventions (arrow functions, type for props, etc.)

### Non-Goals

-   UI components for authentication forms (separate ticket)
-   Password reset functionality (future enhancement)
-   Social authentication providers (future enhancement)
-   Database schema creation (separate ticket)
-   Authorization/permissions system (separate ticket)

---

## Assumptions & Risks

### Assumptions

1. ✅ `.env.local` and `.env.local.example` files have been created by the user
2. Supabase project exists and credentials are available
3. User has access to Supabase dashboard to retrieve URL and anon key
4. All required dependencies are already installed (`@supabase/supabase-js`, `@tanstack/react-query`, `zustand`)
5. React Query provider will be set up in a separate ticket (or needs to be added)

### Risks

1. **High**: Missing React Query provider setup - hooks will fail without `QueryClientProvider`
    - **Mitigation**: Verify provider exists or create it as part of sub-ticket 7
2. **Medium**: Environment variable validation might fail in build time vs runtime
    - **Mitigation**: Use runtime validation with clear error messages
3. **Low**: Supabase client singleton might be created multiple times in development
    - **Mitigation**: Use module-level singleton pattern
4. **Low**: Type mismatches between Supabase types and domain types
    - **Mitigation**: Create proper type mappings in repository layer

---

## Solution Outline (Aligned with Architecture)

### Architecture Flow

```
UI Component (Presentation)
    ↓ calls
React Query Hook (presentation/hooks/useAuth.ts)
    ↓ calls
Usecase (core/usecases/auth.ts)
    ↓ calls
Repository Interface (core/ports/authRepository.ts)
    ↓ implemented by
Repository Implementation (infrastructure/supabase/authRepositorySupabase.ts)
    ↓ uses
Supabase Client (infrastructure/supabase/client.ts)
    ↓ calls
Supabase API
```

### Layer Responsibilities

1. **Domain Layer** (`core/domain/auth.ts`):

    - Pure TypeScript types: `User`, `Session`, `AuthError`, `SignInCredentials`, `SignUpCredentials`
    - No external dependencies
    - Business rules and validation logic

2. **Ports Layer** (`core/ports/authRepository.ts`):

    - Repository interface contract
    - Methods: `signIn()`, `signUp()`, `signOut()`, `getSession()`, `getUser()`
    - Returns domain types only

3. **Usecases Layer** (`core/usecases/auth.ts`):

    - Pure functions that orchestrate authentication logic
    - Take `AuthRepository` as parameter
    - Return domain types
    - Handle business logic (validation, error transformation)

4. **Infrastructure Layer** (`infrastructure/supabase/`):

    - `client.ts`: Supabase client singleton with environment variable validation
    - `authRepositorySupabase.ts`: Implementation of `AuthRepository` interface
    - Only layer that imports `@supabase/supabase-js`
    - Maps Supabase types to domain types

5. **Presentation Layer**:
    - `hooks/useAuth.ts`: React Query hooks for authentication operations
    - `stores/useAuthStore.ts`: Zustand store for UI state (session, user, loading)
    - No direct Supabase calls

---

## Sub-Tickets

### Sub-Ticket 2.1: Create Authentication Domain Types

**Status**: ✅ Completed  
**Estimated Effort**: 2 hours  
**Priority**: High  
**Dependencies**: None

#### Rationale

Foundation layer for all authentication operations. Defines the core business types that will be used throughout the application. Must be created first as all other layers depend on these types.

#### Acceptance Criteria

-   [x] AC1: `core/domain/auth.ts` file created with all authentication domain types
-   [x] AC2: `User` type defined with: `id: string`, `email: string`, `createdAt: string` (ISO 8601), `updatedAt: string` (ISO 8601)
-   [x] AC3: `Session` type defined with: `accessToken: string`, `refreshToken: string | null`, `expiresAt: string` (ISO 8601), `user: User`
-   [x] AC4: `AuthError` type defined with: `code: string`, `message: string`, `status?: number` (optional)
-   [x] AC5: `SignInCredentials` type defined with: `email: string`, `password: string`
-   [x] AC6: `SignUpCredentials` type defined with: `email: string`, `password: string`
-   [x] AC7: All types are pure TypeScript (no external dependencies)
-   [x] AC8: All types are properly documented with JSDoc comments explaining serialization choices (ISO 8601 strings for dates, optional status, nullable refreshToken)
-   [x] AC9: No `any` types used
-   [x] AC10: Date fields use ISO 8601 strings (not Date objects) for compatibility with Supabase, React Query, Zustand, and Next.js hydration

#### Definition of Done

-   [x] All domain types created in `core/domain/auth.ts`
-   [x] Types follow TypeScript strict mode
-   [x] JSDoc comments explain business context for each type and serialization choices
-   [x] Date fields use ISO 8601 strings (not Date objects) for serialization compatibility
-   [x] `refreshToken` is nullable (`string | null`) to handle different authentication flows
-   [x] `status` in `AuthError` is optional to support local validation errors
-   [x] Types exported and ready for use in other layers
-   [x] No linter errors
-   [x] Code follows project conventions (arrow functions if applicable, proper naming)

#### Risk Notes

-   Low risk - pure TypeScript types with no dependencies
-   Date fields use ISO 8601 strings to ensure compatibility with Supabase responses, React Query serialization, Zustand state persistence, and Next.js server-side hydration
-   `refreshToken` nullable to handle authentication flows where refresh token may not be present
-   `status` optional in `AuthError` to support local validation errors that don't have HTTP status codes
-   Types match Supabase response structure (will be verified in sub-ticket 2.4)

---

### Sub-Ticket 2.2: Create Authentication Repository Port Interface

**Status**: ✅ Completed  
**Estimated Effort**: 1.5 hours  
**Priority**: High  
**Dependencies**: Sub-Ticket 2.1 (Domain Types)

#### Rationale

Defines the contract for authentication operations. This interface will be implemented by the Supabase repository and used by usecases. Ensures proper abstraction and testability.

#### Acceptance Criteria

-   [x] AC1: `core/ports/authRepository.ts` file created
-   [x] AC2: `AuthRepository` interface defined with all required methods
-   [x] AC3: `signIn(credentials: SignInCredentials): Promise<{ session: Session; user: User }>` method defined
-   [x] AC4: `signUp(credentials: SignUpCredentials): Promise<{ session: Session; user: User }>` method defined
-   [x] AC5: `signOut(): Promise<void>` method defined
-   [x] AC6: `getSession(): Promise<Session | null>` method defined
-   [x] AC7: `getUser(): Promise<User | null>` method defined
-   [x] AC8: All methods return domain types (from `core/domain/auth.ts`)
-   [x] AC9: All methods properly documented with JSDoc comments
-   [x] AC10: Error handling contract defined (methods throw `AuthError` on failure)

#### Definition of Done

-   [x] `AuthRepository` interface created in `core/ports/authRepository.ts`
-   [x] Interface uses domain types from `core/domain/auth.ts`
-   [x] All methods have JSDoc documentation
-   [x] Error handling contract documented
-   [x] No linter errors
-   [x] Interface exported for use in usecases and infrastructure

#### Risk Notes

-   Low risk - interface definition only
-   Ensure method signatures match Supabase client capabilities

---

### Sub-Ticket 2.3: Create Supabase Client with Environment Variable Validation

**Status**: ✅ Completed  
**Estimated Effort**: 2 hours  
**Priority**: High  
**Dependencies**: None (but requires `.env.local` to be set up by user)

#### Rationale

Core infrastructure component. Creates the Supabase client singleton that will be used by all repository implementations. Must validate environment variables to fail fast with clear error messages.

#### Acceptance Criteria

-   [x] AC1: `infrastructure/supabase/client.ts` file created
-   [x] AC2: Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are validated
-   [x] AC3: Validation throws clear error messages if variables are missing
-   [x] AC4: Supabase client is created using `createClient()` from `@supabase/supabase-js`
-   [x] AC5: Client is configured as singleton (single instance exported)
-   [x] AC6: Client configured with proper options (auth persistence, etc.)
-   [x] AC7: Client instance exported for use in repository implementations
-   [x] AC8: Error messages are user-friendly and indicate which variable is missing
-   [x] AC9: Code properly documented with JSDoc comments

#### Definition of Done

-   [x] Supabase client created in `infrastructure/supabase/client.ts`
-   [x] Environment variable validation implemented with clear error messages
-   [x] Client is singleton instance
-   [x] Client properly configured with auth options
-   [x] No linter errors
-   [x] Code follows project conventions
-   [ ] Manual test: Verify client creation fails gracefully if env vars missing
-   [ ] Manual test: Verify client creation succeeds with valid env vars

#### Risk Notes

-   **Medium**: Environment variables might not be available in build time
    -   **Mitigation**: Use runtime validation, not build-time checks
-   **Low**: Multiple client instances might be created
    -   **Mitigation**: Use module-level singleton pattern

---

### Sub-Ticket 2.4: Implement Authentication Repository (Supabase)

**Status**: ✅ Completed  
**Estimated Effort**: 4 hours  
**Priority**: High  
**Dependencies**: Sub-Ticket 2.1 (Domain Types), Sub-Ticket 2.2 (Port Interface), Sub-Ticket 2.3 (Supabase Client)

#### Rationale

Concrete implementation of the authentication repository. This is the only layer that directly interacts with Supabase. Maps Supabase types to domain types and handles all Supabase-specific logic.

#### Acceptance Criteria

-   [x] AC1: `infrastructure/supabase/authRepositorySupabase.ts` file created
-   [x] AC2: Repository implements `AuthRepository` interface from `core/ports/authRepository.ts`
-   [x] AC3: Repository uses Supabase client from `infrastructure/supabase/client.ts`
-   [x] AC4: `signIn()` method implemented using `supabase.auth.signInWithPassword()`
-   [x] AC5: `signUp()` method implemented using `supabase.auth.signUp()`
-   [x] AC6: `signOut()` method implemented using `supabase.auth.signOut()`
-   [x] AC7: `getSession()` method implemented using `supabase.auth.getSession()`
-   [x] AC8: `getUser()` method implemented using `supabase.auth.getUser()`
-   [x] AC9: All Supabase responses are mapped to domain types (`User`, `Session`)
-   [x] AC10: Supabase errors are transformed to `AuthError` domain type
-   [x] AC11: All methods properly handle errors and throw `AuthError` on failure
-   [x] AC12: Code properly documented with JSDoc comments
-   [x] AC13: No `any` types used

#### Definition of Done

-   [x] `authRepositorySupabase` implementation created
-   [x] All interface methods implemented
-   [x] Supabase types mapped to domain types
-   [x] Error handling implemented with `AuthError` transformation
-   [x] No linter errors
-   [x] Code follows project conventions
-   [x] JSDoc documentation complete

#### Risk Notes

-   **Medium**: Type mismatches between Supabase types and domain types
    -   **Mitigation**: Create proper mapping functions, test thoroughly
-   **Low**: Supabase API changes might break implementation
    -   **Mitigation**: Use stable Supabase client methods, follow official docs

---

### Sub-Ticket 2.5: Create Authentication Usecases

**Status**: ✅ Completed  
**Estimated Effort**: 3 hours  
**Priority**: High  
**Dependencies**: Sub-Ticket 2.1 (Domain Types), Sub-Ticket 2.2 (Port Interface)

#### Rationale

Business logic orchestration layer. Pure functions that coordinate authentication operations. These usecases will be called by React Query hooks and contain any business logic (validation, error handling, etc.).

#### Acceptance Criteria

-   [x] AC1: `core/usecases/auth.ts` file created
-   [x] AC2: `signInUser(repo: AuthRepository, credentials: SignInCredentials): Promise<{ session: Session; user: User }>` function created
-   [x] AC3: `signUpUser(repo: AuthRepository, credentials: SignUpCredentials): Promise<{ session: Session; user: User }>` function created
-   [x] AC4: `signOutUser(repo: AuthRepository): Promise<void>` function created
-   [x] AC5: `getCurrentSession(repo: AuthRepository): Promise<Session | null>` function created
-   [x] AC6: `getCurrentUser(repo: AuthRepository): Promise<User | null>` function created
-   [x] AC7: All usecases take `AuthRepository` as first parameter (dependency injection)
-   [x] AC8: All usecases return domain types
-   [x] AC9: Input validation implemented (e.g., email format, password requirements)
-   [x] AC10: Error handling implemented (catch repository errors, transform if needed)
-   [x] AC11: All functions properly documented with JSDoc comments
-   [x] AC12: No `any` types used
-   [x] AC13: No external dependencies (React, Supabase, etc.)

#### Definition of Done

-   [x] All authentication usecases created in `core/usecases/auth.ts`
-   [x] All usecases take repository as parameter (dependency injection)
-   [x] Input validation implemented
-   [x] Error handling implemented
-   [x] JSDoc documentation complete
-   [x] No linter errors
-   [x] Code follows project conventions
-   [ ] Unit tests written (see Test Spec section)

#### Risk Notes

-   **Low**: Business logic might need to be extended later
    -   **Mitigation**: Keep usecases focused and extensible
-   **Low**: Validation logic might duplicate frontend validation
    -   **Mitigation**: Keep validation minimal in usecases, focus on business rules

---

### Sub-Ticket 2.6: Create Authentication Zustand Store

**Status**: ✅ Completed  
**Estimated Effort**: 2 hours  
**Priority**: Medium  
**Dependencies**: Sub-Ticket 2.1 (Domain Types)

#### Rationale

UI state management for authentication. Stores session, user, and loading states for UI components. This is UI state only, not business logic. Business logic remains in usecases.

#### Acceptance Criteria

-   [x] AC1: `presentation/stores/useAuthStore.ts` file created
-   [x] AC2: Store created using Zustand `create()` function
-   [x] AC3: Store state includes: `session: Session | null`, `user: User | null`, `isLoading: boolean`
-   [x] AC4: Store actions include: `setSession()`, `setUser()`, `setLoading()`, `clearAuth()`
-   [x] AC5: Store uses domain types from `core/domain/auth.ts`
-   [x] AC6: Store does NOT contain business logic (no Supabase calls, no usecase calls)
-   [x] AC7: Store is properly typed with TypeScript
-   [x] AC8: Store properly documented with JSDoc comments
-   [x] AC9: No `any` types used

#### Definition of Done

-   [x] Zustand store created in `presentation/stores/useAuthStore.ts`
-   [x] Store contains only UI state (session, user, loading)
-   [x] Store actions implemented
-   [x] Store uses domain types
-   [x] No business logic in store
-   [x] JSDoc documentation complete
-   [x] No linter errors
-   [x] Code follows project conventions

#### Risk Notes

-   **Low**: Store might be used incorrectly (calling usecases from store)
    -   **Mitigation**: Clear documentation, code review
-   **Low**: State might get out of sync with actual session
    -   **Mitigation**: Hooks will manage state synchronization

---

### Sub-Ticket 2.7: Create Authentication React Query Hooks

**Status**: ✅ Completed  
**Estimated Effort**: 4 hours  
**Priority**: High  
**Dependencies**: Sub-Ticket 2.5 (Usecases), Sub-Ticket 2.6 (Zustand Store), Sub-Ticket 2.4 (Repository Implementation)

#### Rationale

React Query hooks for authentication operations. These hooks connect the UI to usecases and manage async state, caching, and error handling. They also sync state with the Zustand store.

#### Acceptance Criteria

-   [x] AC1: `presentation/hooks/useAuth.ts` file created
-   [x] AC2: `useSignIn()` mutation hook created using `useMutation` from React Query
-   [x] AC3: `useSignUp()` mutation hook created using `useMutation` from React Query
-   [x] AC4: `useSignOut()` mutation hook created using `useMutation` from React Query
-   [x] AC5: `useSession()` query hook created using `useQuery` from React Query
-   [x] AC6: `useUser()` query hook created using `useQuery` from React Query
-   [x] AC7: All hooks call usecases from `core/usecases/auth.ts`
-   [x] AC8: All hooks use `authRepositorySupabase` from `infrastructure/supabase/authRepositorySupabase.ts`
-   [x] AC9: Hooks sync state with Zustand store (`useAuthStore`)
-   [x] AC10: Hooks return: `data`, `isLoading`, `error` (standard React Query pattern)
-   [x] AC11: Mutation hooks invalidate session/user queries on success
-   [x] AC12: Query hooks have appropriate `queryKey` and `queryFn`
-   [x] AC13: Hooks properly handle errors
-   [x] AC14: All hooks properly documented with JSDoc comments
-   [x] AC15: No `any` types used
-   [x] AC16: React Query provider is set up (verify or create in `presentation/providers/`)

#### Definition of Done

-   [x] All authentication hooks created in `presentation/hooks/useAuth.ts`
-   [x] Hooks use usecases (not direct repository calls)
-   [x] Hooks sync with Zustand store
-   [x] React Query patterns followed (queryKey, queryFn, mutations)
-   [x] Error handling implemented
-   [x] JSDoc documentation complete
-   [x] No linter errors
-   [x] Code follows project conventions
-   [x] React Query provider verified/created

#### Risk Notes

-   **High**: React Query provider might not be set up
    -   **Mitigation**: Verify provider exists, create if missing in `presentation/providers/ReactQueryProvider.tsx`
-   **Medium**: State synchronization between React Query and Zustand might be complex
    -   **Mitigation**: Use `onSuccess` callbacks in mutations, `onSettled` for queries

---

### Sub-Ticket 2.8: Update README with Environment Variable Setup Instructions

**Status**: ✅ Completed  
**Estimated Effort**: 1 hour  
**Priority**: Low  
**Dependencies**: None

#### Rationale

Documentation for developers setting up the project. Ensures new developers know how to configure environment variables for Supabase.

#### Acceptance Criteria

-   [x] AC1: README.md updated with environment variable setup section
-   [x] AC2: Instructions include how to create `.env.local` file
-   [x] AC3: Instructions include required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
-   [x] AC4: Instructions include where to find Supabase credentials (Supabase dashboard)
-   [x] AC5: Instructions include example values format
-   [x] AC6: Security note included (never commit `.env.local` to git)
-   [x] AC7: Instructions are clear and easy to follow

#### Definition of Done

-   [x] README.md updated with environment variable setup section
-   [x] Instructions are clear and complete
-   [x] Security notes included
-   [x] Formatting is consistent with existing README

#### Risk Notes

-   None - documentation only

---

## Unit Test Spec (Test-First Protocol)

### Status: `tests: approved` ✅

**Completed**: All test files have been created and meet all requirements:

-   ✅ `__tests__/core/domain/auth.test.ts` - Domain types tests (35 test cases)
-   ✅ `__tests__/core/usecases/auth.test.ts` - Usecases tests (35 test cases)

### Test Files & Paths

#### 1. Domain Types Tests

**File**: `__tests__/core/domain/auth.test.ts`

**Test Structure**:

```typescript
describe("Authentication Domain Types", () => {
    describe("User type", () => {
        it("should have required fields: id, email, createdAt, updatedAt", () => {});
        it("should use ISO 8601 strings for date fields (createdAt, updatedAt)", () => {});
        it("should allow optional fields if defined", () => {});
    });

    describe("Session type", () => {
        it("should have required fields: accessToken, refreshToken, expiresAt, user", () => {});
        it("should allow refreshToken to be null", () => {});
        it("should use ISO 8601 string for expiresAt", () => {});
        it("should validate token format if needed", () => {});
    });

    describe("AuthError type", () => {
        it("should have required fields: code, message", () => {});
        it("should have optional status field", () => {});
        it("should work without status for local validation errors", () => {});
    });

    describe("SignInCredentials type", () => {
        it("should have required fields: email, password", () => {});
    });

    describe("SignUpCredentials type", () => {
        it("should have required fields: email, password", () => {});
    });
});
```

**Mocks/Fixtures**: None needed (pure types)

**Edge Cases**: Type validation, optional fields, nullable refreshToken, optional status in AuthError, ISO 8601 date string format

**Coverage Target**: 100% (type definitions)

**Mapping AC → Tests**:

-   AC2-AC6 (Domain Types) → All test cases above
-   AC10 (ISO 8601 strings for dates) → Date format test cases
-   AC3 (nullable refreshToken) → refreshToken null test case
-   AC4 (optional status) → Optional status test cases

---

#### 2. Usecases Tests

**File**: `__tests__/core/usecases/auth.test.ts`

**Test Structure**:

```typescript
describe("Authentication Usecases", () => {
    let mockRepository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        mockRepository = {
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
            getUser: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe("signInUser", () => {
        it("should call repository signIn with credentials", async () => {});
        it("should return session and user on success", async () => {});
        it("should throw AuthError on repository error", async () => {});
        it("should validate email format", async () => {});
        it("should validate password is not empty", async () => {});
    });

    describe("signUpUser", () => {
        it("should call repository signUp with credentials", async () => {});
        it("should return session and user on success", async () => {});
        it("should throw AuthError on repository error", async () => {});
        it("should validate email format", async () => {});
        it("should validate password requirements", async () => {});
    });

    describe("signOutUser", () => {
        it("should call repository signOut", async () => {});
        it("should not throw on success", async () => {});
        it("should throw AuthError on repository error", async () => {});
    });

    describe("getCurrentSession", () => {
        it("should call repository getSession", async () => {});
        it("should return session if exists", async () => {});
        it("should return null if no session", async () => {});
        it("should throw AuthError on repository error", async () => {});
    });

    describe("getCurrentUser", () => {
        it("should call repository getUser", async () => {});
        it("should return user if exists", async () => {});
        it("should return null if no user", async () => {});
        it("should throw AuthError on repository error", async () => {});
    });
});
```

**Mocks/Fixtures**:

-   Mock `AuthRepository` interface
-   Mock domain types (User, Session, AuthError)
-   Mock credentials (SignInCredentials, SignUpCredentials)

**Edge Cases**:

-   Invalid email format
-   Empty password
-   Repository errors
-   Null responses (no session/user)
-   Network errors

**Coverage Target**: 90%+ (all usecases, all error paths)

**Mapping AC → Tests**:

-   AC2-AC6 (Usecases) → All test cases above
-   AC9 (Input validation) → Validation test cases
-   AC10 (Error handling) → Error test cases

---

### Test Implementation Notes

1. **Mock Strategy**:

    - Mock `AuthRepository` interface using `jest.Mocked<>`
    - Create mock implementations for each method
    - Use `jest.fn()` for all repository methods

2. **Fixtures**:

    - Create factory functions for test data (e.g., `createMockUser()`, `createMockSession()`)
    - Place fixtures in `__mocks__/core/domain/auth.ts` if reusable

3. **Error Testing**:

    - Test all error scenarios (network errors, auth errors, validation errors)
    - Verify error types are `AuthError`
    - Verify error messages are user-friendly

4. **Validation Testing**:

    - Test email format validation
    - Test password requirements (if any)
    - Test empty/null inputs

5. **Integration Points**:
    - Verify usecases call repository methods with correct parameters
    - Verify usecases return correct domain types
    - Verify error transformation works correctly

---

## Agent Prompts

### Unit Test Coach (Test-First Protocol)

```
@Unit Test Coach

Generate unit test specifications and test scaffolds for the authentication usecases following TDD principles.

**Context:**
- Ticket: FBC-2 (Install Supabase with Authentication)
- Sub-Ticket: 2.5 (Create Authentication Usecases)
- Test file: `__tests__/core/usecases/auth.test.ts`

**Requirements:**
1. Create comprehensive test specifications for all authentication usecases:
   - `signInUser(repo: AuthRepository, credentials: SignInCredentials)`
   - `signUpUser(repo: AuthRepository, credentials: SignUpCredentials)`
   - `signOutUser(repo: AuthRepository)`
   - `getCurrentSession(repo: AuthRepository)`
   - `getCurrentUser(repo: AuthRepository)`

2. Test coverage must include:
   - Success paths (repository returns data)
   - Error paths (repository throws AuthError)
   - Validation paths (invalid email, empty password)
   - Edge cases (null responses, network errors)

3. Mock strategy:
   - Mock `AuthRepository` interface using `jest.Mocked<>`
   - Use `jest.fn()` for all repository methods
   - Create mock fixtures for User, Session, AuthError types

4. Follow project conventions:
   - Tests in `__tests__/` directory (not in `src/`)
   - TypeScript for all test files
   - Use `describe()` and `it()` blocks
   - Use `beforeEach()` for setup
   - Use `jest.clearAllMocks()` in `beforeEach()`

5. Test structure:
   - Group tests by usecase function
   - Test success, error, and validation scenarios
   - Verify repository method calls with correct parameters
   - Verify return types match domain types

**Files to create:**
- `__tests__/core/usecases/auth.test.ts` - Main test file
- `__mocks__/core/domain/auth.ts` - Mock fixtures for domain types (User, Session, AuthError)
- `__mocks__/core/ports/authRepository.ts` - Mock repository implementation

**Dependencies:**
- Domain types from `core/domain/auth.ts` (Sub-Ticket 2.1)
- Port interface from `core/ports/authRepository.ts` (Sub-Ticket 2.2)

**Status**: ✅ **COMPLETED** - Test files and mocks created
- Test file: `__tests__/core/usecases/auth.test.ts`
- Mock fixtures: `__mocks__/core/domain/auth.ts` (createMockUser, createMockSession, createMockAuthError)
- Mock repository: `__mocks__/core/ports/authRepository.ts` (createMockAuthRepository)
- All 5 usecases tested (signInUser, signUpUser, signOutUser, getCurrentSession, getCurrentUser)
- 35 comprehensive test cases covering success paths, validation errors, repository errors, and edge cases
- Mock strategy implemented using `jest.Mocked<AuthRepository>` with `jest.fn()` for all methods
- Mocks centralized in `__mocks__/` directory following DRY principles
- All project conventions followed (TypeScript, describe/it blocks, beforeEach with jest.clearAllMocks())
- Tests grouped by usecase function with proper Arrange-Act-Assert pattern
```

---

### Architecture-Aware Dev (Implementation)

```
@Architecture-Aware Dev

Implement the Supabase authentication system following Clean Architecture principles.

**Context:**
- Ticket: FBC-2 (Install Supabase with Authentication)
- Branch: `feat/fbc-2-install-supabase-auth-db`

**Implementation Order:**
1. Sub-Ticket 2.1: Create Authentication Domain Types (`core/domain/auth.ts`)
2. Sub-Ticket 2.2: Create Authentication Repository Port Interface (`core/ports/authRepository.ts`)
3. Sub-Ticket 2.3: Create Supabase Client (`infrastructure/supabase/client.ts`)
4. Sub-Ticket 2.4: Implement Authentication Repository (`infrastructure/supabase/authRepositorySupabase.ts`)
5. Sub-Ticket 2.5: Create Authentication Usecases (`core/usecases/auth.ts`)
6. Sub-Ticket 2.6: Create Authentication Zustand Store (`presentation/stores/useAuthStore.ts`)
7. Sub-Ticket 2.7: Create Authentication React Query Hooks (`presentation/hooks/useAuth.ts`)
8. Sub-Ticket 2.8: Update README (`README.md`)

**Critical Architecture Rules:**
- ✅ Domain layer: Pure TypeScript types, no external dependencies
- ✅ Ports layer: Interface contracts only, no implementations
- ✅ Usecases layer: Pure functions, take repository as parameter, no external dependencies
- ✅ Infrastructure layer: Only layer that imports `@supabase/supabase-js`
- ✅ Presentation layer: React Query hooks call usecases, Zustand for UI state only
- ✅ Data flow: UI → Hook → Usecase → Repository → Supabase (NEVER reversed)
- ✅ No `any` types - use TypeScript strict mode
- ✅ All code follows project conventions (arrow functions, type for props, JSDoc comments)

**Environment Variables:**
- `.env.local` and `.env.local.example` already created by user
- Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Validate environment variables in `infrastructure/supabase/client.ts`

**Dependencies:**
- `@supabase/supabase-js` (^2.81.1) - already installed
- `@tanstack/react-query` (^5.90.9) - already installed
- `zustand` (^5.0.8) - already installed

**Test-First Protocol:**
- Unit tests for usecases already approved (see Unit Test Spec section)
- Implement usecases to pass tests
- Write tests before implementation where applicable

**Files to Create:**
- `core/domain/auth.ts`
- `core/ports/authRepository.ts`
- `infrastructure/supabase/client.ts`
- `infrastructure/supabase/authRepositorySupabase.ts`
- `core/usecases/auth.ts`
- `presentation/stores/useAuthStore.ts`
- `presentation/hooks/useAuth.ts`

**Files to Modify:**
- `README.md` (add environment variable setup instructions)
- `presentation/providers/ReactQueryProvider.tsx` (create if missing)

**Security Checklist:**
- ✅ No hardcoded credentials
- ✅ Environment variables validated
- ✅ Error messages don't expose sensitive information
- ✅ Authentication tokens handled securely

Start with Sub-Ticket 2.1 and proceed in order. Verify each sub-ticket's AC and DoD before moving to the next.
```

---

### UI Designer (Not Applicable)

```
@UI Designer

**Note**: This ticket does not include UI components. Authentication forms and UI will be created in a separate ticket. No UI work needed for FBC-2.
```

---

### QA & Test Coach (Post-Implementation Testing)

```
@QA & Test Coach

Create comprehensive test plan and manual testing scenarios for the Supabase authentication system.

**Context:**
- Ticket: FBC-2 (Install Supabase with Authentication)
- Implementation: Complete (all sub-tickets done)

**Test Plan Requirements:**

1. **Unit Test Verification:**
   - Verify all unit tests pass for authentication usecases
   - Verify test coverage meets targets (90%+ for usecases)
   - Review test quality and edge case coverage

2. **Integration Test Scenarios:**
   - Test complete authentication flow: Sign Up → Sign In → Get Session → Sign Out
   - Test error scenarios: Invalid credentials, network errors, missing session
   - Test state synchronization: React Query ↔ Zustand store

3. **Manual Testing Scenarios:**
   - **Environment Variables:**
     - Test with missing `NEXT_PUBLIC_SUPABASE_URL` (should show clear error)
     - Test with missing `NEXT_PUBLIC_SUPABASE_ANON_KEY` (should show clear error)
     - Test with invalid URL/key (should handle gracefully)

   - **Sign Up Flow:**
     - Sign up with valid email/password (should succeed)
     - Sign up with invalid email (should show error)
     - Sign up with weak password (should show error if validation exists)
     - Sign up with existing email (should show error)

   - **Sign In Flow:**
     - Sign in with valid credentials (should succeed, session created)
     - Sign in with invalid email (should show error)
     - Sign in with invalid password (should show error)
     - Sign in with non-existent user (should show error)

   - **Session Management:**
     - Get session when logged in (should return session)
     - Get session when logged out (should return null)
     - Get user when logged in (should return user)
     - Get user when logged out (should return null)

   - **Sign Out Flow:**
     - Sign out when logged in (should clear session)
     - Sign out when logged out (should not error)

   - **State Management:**
     - Verify Zustand store updates on sign in
     - Verify Zustand store clears on sign out
     - Verify React Query cache invalidates on mutations
     - Verify loading states work correctly

4. **Architecture Compliance Verification:**
   - Verify no direct Supabase calls from UI components
   - Verify all operations follow: UI → Hook → Usecase → Repository → Supabase
   - Verify no business logic in Zustand store
   - Verify no external dependencies in domain/usecases layers

5. **Security Testing:**
   - Verify no hardcoded credentials in source code
   - Verify environment variables not exposed in client bundle
   - Verify error messages don't expose sensitive information
   - Verify authentication tokens handled securely

6. **Accessibility Testing:**
   - N/A for this ticket (no UI components)

**Test Execution:**
- Run unit tests: `yarn test` (or equivalent)
- Manual testing in browser with React DevTools
- Verify network requests in browser DevTools
- Check console for errors/warnings

**Test Report:**
- Document all test results
- Note any issues or edge cases found
- Verify all AC and DoD items completed

Generate the test plan and manual testing checklist now.
```

---

### Architecture Guardian (Architecture Compliance)

```
@Architecture Guardian

Verify architecture compliance for the Supabase authentication system implementation.

**Context:**
- Ticket: FBC-2 (Install Supabase with Authentication)
- Implementation: Complete (all sub-tickets done)

**Architecture Compliance Checklist:**

1. **Layer Separation:**
   - ✅ Domain layer (`core/domain/auth.ts`): Pure TypeScript types, no external dependencies
   - ✅ Ports layer (`core/ports/authRepository.ts`): Interface only, no implementation
   - ✅ Usecases layer (`core/usecases/auth.ts`): Pure functions, repository as parameter, no external dependencies
   - ✅ Infrastructure layer (`infrastructure/supabase/`): Only layer importing `@supabase/supabase-js`
   - ✅ Presentation layer: Hooks call usecases, Zustand for UI state only

2. **Data Flow Verification:**
   - ✅ Verify: UI → Hook → Usecase → Repository → Supabase (correct direction)
   - ✅ Verify: No reverse flow (Infrastructure → Presentation)
   - ✅ Verify: No direct Supabase calls from UI components
   - ✅ Verify: No business logic in presentation layer

3. **Import Rules:**
   - ✅ Domain: No external imports (except `shared/` if needed)
   - ✅ Usecases: Import Domain and Ports only (except `shared/` if needed)
   - ✅ Infrastructure: Import Domain and Ports only (except `shared/` if needed)
   - ✅ Presentation: Import Domain, Usecases, Infrastructure (except `shared/` if needed)
   - ✅ No forbidden cross-layer imports

4. **Type Safety:**
   - ✅ No `any` types used
   - ✅ All types properly defined
   - ✅ Domain types used throughout (not Supabase types in UI)

5. **Code Conventions:**
   - ✅ Arrow functions for components
   - ✅ `type` for props (not `interface`)
   - ✅ JSDoc comments for all public functions
   - ✅ Proper naming conventions

6. **Security:**
   - ✅ No hardcoded credentials
   - ✅ Environment variables validated
   - ✅ Error messages don't expose sensitive information

**Files to Review:**
- `core/domain/auth.ts`
- `core/ports/authRepository.ts`
- `core/usecases/auth.ts`
- `infrastructure/supabase/client.ts`
- `infrastructure/supabase/authRepositorySupabase.ts`
- `presentation/hooks/useAuth.ts`
- `presentation/stores/useAuthStore.ts`

**Verification Method:**
- Review import statements in each file
- Verify layer dependencies
- Check for architecture violations
- Verify data flow direction

Generate architecture compliance report with findings and recommendations.
```

---

## Open Questions

1. **React Query Provider Setup:**

    - Question: Is React Query provider already set up in the project?
    - Impact: Sub-Ticket 2.7 (React Query Hooks) requires provider
    - Action: Verify in `src/presentation/providers/` or `src/app/layout.tsx`
    - Resolution: If missing, create as part of Sub-Ticket 2.7

2. **Password Validation Requirements:**

    - Question: What are the password requirements for sign up?
    - Impact: Sub-Ticket 2.5 (Usecases) validation logic
    - Action: Check with product owner or use default (min length, etc.)
    - Resolution: Implement basic validation (min 8 chars), can be extended later

3. **Email Validation:**

    - Question: Should email validation be strict (regex) or basic (Supabase handles it)?
    - Impact: Sub-Ticket 2.5 (Usecases) validation logic
    - Action: Use basic validation, let Supabase handle strict validation
    - Resolution: Basic email format check in usecase, Supabase does final validation

4. **Session Refresh Strategy:**

    - Question: How should session refresh be handled? Automatic or manual?
    - Impact: Sub-Ticket 2.7 (React Query Hooks) and 2.4 (Repository)
    - Action: Use Supabase's automatic token refresh (default behavior)
    - Resolution: Rely on Supabase client's built-in refresh mechanism

5. **Error Message Localization:**
    - Question: Should error messages be localized or English-only for now?
    - Impact: All error handling
    - Action: Use English for now, can be localized later
    - Resolution: English error messages, structure allows future localization

---

## MVP Cut List

If time is constrained, the following can be deferred:

### Can Defer (Lower Priority):

1. **Sub-Ticket 2.8 (README Update)**: Documentation can be added later
2. **Advanced Error Handling**: Basic error handling is sufficient for MVP
3. **Comprehensive Input Validation**: Basic validation is sufficient, Supabase handles strict validation

### Must Have (Critical):

1. **Sub-Ticket 2.1-2.5**: Core authentication infrastructure (Domain, Ports, Client, Repository, Usecases)
2. **Sub-Ticket 2.7**: React Query hooks (required for UI integration)
3. **Sub-Ticket 2.6**: Zustand store (required for UI state management)

### MVP Scope:

-   ✅ Basic authentication (sign in, sign up, sign out)
-   ✅ Session management
-   ✅ User state management
-   ✅ Error handling (basic)
-   ⏸️ Advanced validation (defer)
-   ⏸️ Comprehensive documentation (defer)

---

## Implementation Timeline

### Estimated Total Effort: 19.5 hours

### Recommended Sprint Breakdown:

**Sprint 1 (Day 1-2): Foundation**

-   Sub-Ticket 2.1: Domain Types (2h)
-   Sub-Ticket 2.2: Port Interface (1.5h)
-   Sub-Ticket 2.3: Supabase Client (2h)
-   **Subtotal: 5.5 hours**

**Sprint 2 (Day 3-4): Implementation**

-   Sub-Ticket 2.4: Repository Implementation (4h)
-   Sub-Ticket 2.5: Usecases (3h)
-   **Subtotal: 7 hours**

**Sprint 3 (Day 5): Presentation Layer**

-   Sub-Ticket 2.6: Zustand Store (2h)
-   Sub-Ticket 2.7: React Query Hooks (4h)
-   **Subtotal: 6 hours**

**Sprint 4 (Day 6): Documentation & Testing**

-   Sub-Ticket 2.8: README Update (1h)
-   Manual testing and bug fixes (estimated 2-3h)
-   **Subtotal: 3-4 hours**

### Critical Path:

1. Domain Types → Port Interface → Supabase Client (can be parallel)
2. Repository Implementation (depends on 1-3)
3. Usecases (depends on 1-2)
4. React Query Hooks (depends on 3, 2.4, 2.6)
5. Zustand Store (can be parallel with 4)

---

## Success Criteria

### Technical Success:

-   ✅ All sub-tickets completed with AC and DoD met
-   ✅ All unit tests passing
-   ✅ No architecture violations
-   ✅ No security vulnerabilities
-   ✅ TypeScript strict mode compliance

### Functional Success:

-   ✅ Sign up flow works end-to-end
-   ✅ Sign in flow works end-to-end
-   ✅ Sign out flow works end-to-end
-   ✅ Session management works correctly
-   ✅ Error handling provides clear feedback

### Quality Success:

-   ✅ Code reviewed and approved
-   ✅ Documentation complete
-   ✅ Manual testing completed
-   ✅ No critical bugs
-   ✅ Performance acceptable

---

**Plan Status**: ✅ Complete  
**Next Steps**: Begin implementation with Sub-Ticket 2.1 (Domain Types)  
**Owner**: Development Team  
**Review Date**: Before implementation start
