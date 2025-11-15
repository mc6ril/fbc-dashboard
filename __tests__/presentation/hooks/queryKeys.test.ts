/**
 * Query Key Factory Tests
 *
 * Tests for the centralized query key factory to ensure:
 * - Query keys return correct arrays
 * - Keys are properly typed with `as const`
 * - Hierarchical structure is maintained
 * - Type safety is preserved
 */

import { queryKeys } from "@/presentation/hooks/queryKeys";

describe("queryKeys", () => {
    describe("auth", () => {
        describe("session", () => {
            it("should return correct session key", () => {
                const key = queryKeys.auth.session();
                expect(key).toEqual(["auth", "session"]);
            });

            it("should return key as readonly tuple", () => {
                const key = queryKeys.auth.session();
                // TypeScript should infer readonly tuple type
                // Runtime check: verify it's an array
                expect(Array.isArray(key)).toBe(true);
                expect(key.length).toBe(2);
            });

            it("should return same key on multiple calls", () => {
                const key1 = queryKeys.auth.session();
                const key2 = queryKeys.auth.session();
                expect(key1).toEqual(key2);
            });
        });

        describe("user", () => {
            it("should return correct user key", () => {
                const key = queryKeys.auth.user();
                expect(key).toEqual(["auth", "user"]);
            });

            it("should return key as readonly tuple", () => {
                const key = queryKeys.auth.user();
                // TypeScript should infer readonly tuple type
                // Runtime check: verify it's an array
                expect(Array.isArray(key)).toBe(true);
                expect(key.length).toBe(2);
            });

            it("should return same key on multiple calls", () => {
                const key1 = queryKeys.auth.user();
                const key2 = queryKeys.auth.user();
                expect(key1).toEqual(key2);
            });
        });

        it("should have different keys for session and user", () => {
            const sessionKey = queryKeys.auth.session();
            const userKey = queryKeys.auth.user();
            expect(sessionKey).not.toEqual(userKey);
        });
    });
});

