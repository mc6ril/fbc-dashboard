/**
 * Mock Supabase Client for Testing
 *
 * Provides a mock implementation of the Supabase client for unit testing
 * repository implementations. This mock simulates Supabase API responses
 * without requiring real database connections.
 *
 * Usage:
 * ```typescript
 * jest.mock("@/infrastructure/supabase/client", () => ({
 *   supabaseClient: mockSupabaseClient,
 * }));
 * ```
 */

/**
 * Mock Supabase client that simulates the Supabase API.
 *
 * The mock provides a chainable API similar to the real Supabase client:
 * - `from(table)` returns a query builder
 * - Query builder methods: `select()`, `insert()`, `update()`, `eq()`, `single()`
 * - All methods return `this` for chaining (except `single()` which returns a promise)
 *
 * Tests should configure the mock's return values using `mockResolvedValue()` or `mockReturnValue()`.
 */
export const supabaseClient = {
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    })),
};

