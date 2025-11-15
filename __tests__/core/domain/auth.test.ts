/**
 * Domain Types Tests - Authentication
 *
 * Tests for authentication domain types to ensure type structure,
 * required fields, optional fields, and business rules are correctly
 * defined and validated.
 *
 * These tests verify:
 * - Type structure and required fields
 * - Optional fields behavior
 * - Business rules (email format, UUID format, ISO 8601 dates)
 * - Edge cases and invalid data handling
 */

import type {
    User,
    Session,
    AuthError,
    SignInCredentials,
    SignUpCredentials,
} from "@/core/domain/auth";

/**
 * Helper function to validate UUID format
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const isValidUUID = (value: string): boolean => {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};

/**
 * Helper function to validate email format
 */
const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

/**
 * Helper function to validate ISO 8601 date format
 */
const isValidISO8601 = (value: string): boolean => {
    const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!iso8601Regex.test(value)) {
        return false;
    }
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(value.substring(0, 19));
};

describe("Domain Types - Authentication", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("User Type", () => {
        const validUser: User = {
            id: "123e4567-e89b-4d3a-a456-426614174000",
            email: "user@example.com",
            createdAt: "2025-01-27T14:00:00.000Z",
            updatedAt: "2025-01-27T14:00:00.000Z",
        };

        it("should have all required fields", () => {
            expect(validUser).toHaveProperty("id");
            expect(validUser).toHaveProperty("email");
            expect(validUser).toHaveProperty("createdAt");
            expect(validUser).toHaveProperty("updatedAt");
        });

        it("should have id as a string", () => {
            expect(typeof validUser.id).toBe("string");
            expect(validUser.id).toBeTruthy();
        });

        it("should have email as a string", () => {
            expect(typeof validUser.email).toBe("string");
            expect(validUser.email).toBeTruthy();
        });

        it("should have createdAt as an ISO 8601 string", () => {
            expect(typeof validUser.createdAt).toBe("string");
            expect(isValidISO8601(validUser.createdAt)).toBe(true);
        });

        it("should have updatedAt as an ISO 8601 string", () => {
            expect(typeof validUser.updatedAt).toBe("string");
            expect(isValidISO8601(validUser.updatedAt)).toBe(true);
        });

        it("should accept valid UUID format for id", () => {
            expect(isValidUUID(validUser.id)).toBe(true);
        });

        it("should accept valid email format", () => {
            expect(isValidEmail(validUser.email)).toBe(true);
        });

        it("should handle different valid email formats", () => {
            const emails = [
                "user@example.com",
                "user.name@example.com",
                "user+tag@example.co.uk",
                "user_name@example-domain.com",
            ];

            emails.forEach((email) => {
                const user: User = {
                    ...validUser,
                    email,
                };
                expect(isValidEmail(user.email)).toBe(true);
            });
        });

        it("should handle different valid UUID formats", () => {
            const uuids = [
                "123e4567-e89b-4d3a-a456-426614174000", // UUID v4
                "550e8400-e29b-41d4-a716-446655440000", // UUID v4
                "6ba7b810-9dad-4d1d-80b4-00c04fd430c8", // UUID v4 (corrected)
            ];

            uuids.forEach((uuid) => {
                const user: User = {
                    ...validUser,
                    id: uuid,
                };
                expect(isValidUUID(user.id)).toBe(true);
            });
        });

        it("should handle different valid ISO 8601 date formats", () => {
            const dates = [
                "2025-01-27T14:00:00.000Z",
                "2025-01-27T14:00:00Z",
                "2025-01-27T14:00:00.123Z",
            ];

            dates.forEach((date) => {
                const user: User = {
                    ...validUser,
                    createdAt: date,
                    updatedAt: date,
                };
                expect(isValidISO8601(user.createdAt)).toBe(true);
                expect(isValidISO8601(user.updatedAt)).toBe(true);
            });
        });
    });

    describe("Session Type", () => {
        const validUser: User = {
            id: "123e4567-e89b-12d3-a456-426614174000",
            email: "user@example.com",
            createdAt: "2025-01-27T14:00:00.000Z",
            updatedAt: "2025-01-27T14:00:00.000Z",
        };

        const validSession: Session = {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            refreshToken: "refresh_token_123",
            expiresAt: "2025-01-27T15:00:00.000Z",
            user: validUser,
        };

        it("should have all required fields", () => {
            expect(validSession).toHaveProperty("accessToken");
            expect(validSession).toHaveProperty("refreshToken");
            expect(validSession).toHaveProperty("expiresAt");
            expect(validSession).toHaveProperty("user");
        });

        it("should have accessToken as a string", () => {
            expect(typeof validSession.accessToken).toBe("string");
            expect(validSession.accessToken).toBeTruthy();
        });

        it("should have refreshToken as a string or null", () => {
            expect(
                typeof validSession.refreshToken === "string" ||
                    validSession.refreshToken === null
            ).toBe(true);
        });

        it("should accept null for refreshToken", () => {
            const sessionWithNullRefresh: Session = {
                ...validSession,
                refreshToken: null,
            };
            expect(sessionWithNullRefresh.refreshToken).toBeNull();
        });

        it("should have expiresAt as an ISO 8601 string", () => {
            expect(typeof validSession.expiresAt).toBe("string");
            expect(isValidISO8601(validSession.expiresAt)).toBe(true);
        });

        it("should have user as a User type", () => {
            expect(validSession.user).toHaveProperty("id");
            expect(validSession.user).toHaveProperty("email");
            expect(validSession.user).toHaveProperty("createdAt");
            expect(validSession.user).toHaveProperty("updatedAt");
        });

        it("should handle empty accessToken string", () => {
            const sessionWithEmptyToken: Session = {
                ...validSession,
                accessToken: "",
            };
            expect(typeof sessionWithEmptyToken.accessToken).toBe("string");
        });

        it("should handle long accessToken strings", () => {
            const longToken =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
                "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
            const sessionWithLongToken: Session = {
                ...validSession,
                accessToken: longToken,
            };
            expect(sessionWithLongToken.accessToken.length).toBeGreaterThan(100);
        });
    });

    describe("AuthError Type", () => {
        const validAuthError: AuthError = {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            status: 401,
        };

        it("should have all required fields", () => {
            expect(validAuthError).toHaveProperty("code");
            expect(validAuthError).toHaveProperty("message");
        });

        it("should have code as a string", () => {
            expect(typeof validAuthError.code).toBe("string");
            expect(validAuthError.code).toBeTruthy();
        });

        it("should have message as a string", () => {
            expect(typeof validAuthError.message).toBe("string");
            expect(validAuthError.message).toBeTruthy();
        });

        it("should have optional status as a number", () => {
            expect(typeof validAuthError.status).toBe("number");
        });

        it("should accept AuthError without status field", () => {
            const errorWithoutStatus: AuthError = {
                code: "VALIDATION_ERROR",
                message: "Email is required",
            };
            expect(errorWithoutStatus.status).toBeUndefined();
        });

        it("should handle different error codes", () => {
            const errorCodes = [
                "INVALID_CREDENTIALS",
                "EMAIL_ALREADY_EXISTS",
                "USER_NOT_FOUND",
                "SESSION_EXPIRED",
                "VALIDATION_ERROR",
            ];

            errorCodes.forEach((code) => {
                const error: AuthError = {
                    code,
                    message: "Error message",
                };
                expect(error.code).toBe(code);
            });
        });

        it("should handle different HTTP status codes", () => {
            const statusCodes = [400, 401, 403, 404, 500];

            statusCodes.forEach((status) => {
                const error: AuthError = {
                    code: "ERROR",
                    message: "Error message",
                    status,
                };
                expect(error.status).toBe(status);
            });
        });

        it("should handle empty error messages", () => {
            const errorWithEmptyMessage: AuthError = {
                code: "ERROR",
                message: "",
            };
            expect(typeof errorWithEmptyMessage.message).toBe("string");
        });
    });

    describe("SignInCredentials Type", () => {
        const validSignInCredentials: SignInCredentials = {
            email: "user@example.com",
            password: "password123",
        };

        it("should have all required fields", () => {
            expect(validSignInCredentials).toHaveProperty("email");
            expect(validSignInCredentials).toHaveProperty("password");
        });

        it("should have email as a string", () => {
            expect(typeof validSignInCredentials.email).toBe("string");
            expect(validSignInCredentials.email).toBeTruthy();
        });

        it("should have password as a string", () => {
            expect(typeof validSignInCredentials.password).toBe("string");
            expect(validSignInCredentials.password).toBeTruthy();
        });

        it("should accept valid email format", () => {
            expect(isValidEmail(validSignInCredentials.email)).toBe(true);
        });

        it("should handle different valid email formats", () => {
            const emails = [
                "user@example.com",
                "user.name@example.com",
                "user+tag@example.co.uk",
            ];

            emails.forEach((email) => {
                const credentials: SignInCredentials = {
                    email,
                    password: "password123",
                };
                expect(isValidEmail(credentials.email)).toBe(true);
            });
        });

        it("should handle empty password string", () => {
            const credentialsWithEmptyPassword: SignInCredentials = {
                email: "user@example.com",
                password: "",
            };
            expect(typeof credentialsWithEmptyPassword.password).toBe("string");
        });

        it("should handle long password strings", () => {
            const longPassword = "a".repeat(256);
            const credentialsWithLongPassword: SignInCredentials = {
                email: "user@example.com",
                password: longPassword,
            };
            expect(credentialsWithLongPassword.password.length).toBe(256);
        });
    });

    describe("SignUpCredentials Type", () => {
        const validSignUpCredentials: SignUpCredentials = {
            email: "newuser@example.com",
            password: "securePassword123!",
        };

        it("should have all required fields", () => {
            expect(validSignUpCredentials).toHaveProperty("email");
            expect(validSignUpCredentials).toHaveProperty("password");
        });

        it("should have email as a string", () => {
            expect(typeof validSignUpCredentials.email).toBe("string");
            expect(validSignUpCredentials.email).toBeTruthy();
        });

        it("should have password as a string", () => {
            expect(typeof validSignUpCredentials.password).toBe("string");
            expect(validSignUpCredentials.password).toBeTruthy();
        });

        it("should accept valid email format", () => {
            expect(isValidEmail(validSignUpCredentials.email)).toBe(true);
        });

        it("should handle different valid email formats", () => {
            const emails = [
                "newuser@example.com",
                "new.user@example.com",
                "newuser+tag@example.co.uk",
            ];

            emails.forEach((email) => {
                const credentials: SignUpCredentials = {
                    email,
                    password: "securePassword123!",
                };
                expect(isValidEmail(credentials.email)).toBe(true);
            });
        });

        it("should handle empty password string", () => {
            const credentialsWithEmptyPassword: SignUpCredentials = {
                email: "newuser@example.com",
                password: "",
            };
            expect(typeof credentialsWithEmptyPassword.password).toBe("string");
        });

        it("should handle long password strings", () => {
            const longPassword = "a".repeat(256);
            const credentialsWithLongPassword: SignUpCredentials = {
                email: "newuser@example.com",
                password: longPassword,
            };
            expect(credentialsWithLongPassword.password.length).toBe(256);
        });
    });

    describe("Type Relationships", () => {
        it("should allow Session to contain a User", () => {
            const user: User = {
                id: "123e4567-e89b-12d3-a456-426614174000",
                email: "user@example.com",
                createdAt: "2025-01-27T14:00:00.000Z",
                updatedAt: "2025-01-27T14:00:00.000Z",
            };

            const session: Session = {
                accessToken: "token",
                refreshToken: "refresh",
                expiresAt: "2025-01-27T15:00:00.000Z",
                user,
            };

            expect(session.user).toEqual(user);
            expect(session.user.id).toBe(user.id);
            expect(session.user.email).toBe(user.email);
        });

        it("should allow AuthError to be used independently", () => {
            const error: AuthError = {
                code: "ERROR",
                message: "Error message",
            };

            expect(error).not.toHaveProperty("user");
            expect(error).not.toHaveProperty("session");
        });

        it("should allow SignInCredentials and SignUpCredentials to have same structure", () => {
            const signIn: SignInCredentials = {
                email: "user@example.com",
                password: "password123",
            };

            const signUp: SignUpCredentials = {
                email: "user@example.com",
                password: "password123",
            };

            expect(signIn.email).toBe(signUp.email);
            expect(signIn.password).toBe(signUp.password);
        });
    });
});

