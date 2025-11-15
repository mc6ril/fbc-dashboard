/**
 * Usecases Tests - Authentication
 *
 * Tests for authentication usecases to ensure business logic orchestration,
 * validation, error handling, and repository delegation work correctly.
 *
 * These tests verify:
 * - Business logic validation (email format, password requirements)
 * - Repository delegation with proper parameters
 * - Error handling and transformation
 * - Success paths with valid inputs
 * - Edge cases and invalid inputs
 */

import type { AuthRepository } from "@/core/ports/authRepository";
import type {
    AuthError,
    SignInCredentials,
    SignUpCredentials,
} from "@/core/domain/auth";
import {
    signInUser,
    signUpUser,
    signOutUser,
    getCurrentSession,
    getCurrentUser,
} from "@/core/usecases/auth";
import {
    createMockUser,
    createMockSession,
    createMockAuthError,
} from "../../../__mocks__/core/domain/auth";
import { createMockAuthRepository } from "../../../__mocks__/core/ports/authRepository";

describe("Authentication Usecases", () => {
    let mockRepo: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = createMockAuthRepository();
    });

    describe("signInUser", () => {
        const validCredentials: SignInCredentials = {
            email: "user@example.com",
            password: "password123",
        };

        it("should successfully sign in user with valid credentials", async () => {
            // Arrange
            const mockUser = createMockUser({ email: validCredentials.email });
            const mockSession = createMockSession(mockUser);
            mockRepo.signIn.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signInUser(mockRepo, validCredentials);

            // Assert
            expect(mockRepo.signIn).toHaveBeenCalledTimes(1);
            expect(mockRepo.signIn).toHaveBeenCalledWith(validCredentials);
            expect(result.session).toEqual(mockSession);
            expect(result.user).toEqual(mockUser);
        });

        it("should throw validation error for empty email", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "",
                password: "password123",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid email format", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "not-an-email",
                password: "password123",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should accept email with spaces (trimmed before validation)", async () => {
            // Arrange
            // Note: The usecase trims email before validation, so spaces are allowed
            const credentialsWithSpaces: SignInCredentials = {
                email: "  user@example.com  ",
                password: "password123",
            };
            const mockUser = createMockUser({ email: "user@example.com" });
            const mockSession = createMockSession(mockUser);
            mockRepo.signIn.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signInUser(mockRepo, credentialsWithSpaces);

            // Assert
            // The email should be trimmed and accepted
            expect(mockRepo.signIn).toHaveBeenCalledWith(credentialsWithSpaces);
            expect(result.user.email).toBe("user@example.com");
        });

        it("should throw validation error for email without domain", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "user@",
                password: "password123",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should throw validation error for email without @ symbol", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "userexample.com",
                password: "password123",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should throw validation error for empty password", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "user@example.com",
                password: "",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password is required",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should throw validation error for password with only spaces", async () => {
            // Arrange
            const invalidCredentials: SignInCredentials = {
                email: "user@example.com",
                password: "   ",
            };

            // Act & Assert
            await expect(
                signInUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password is required",
            });
            expect(mockRepo.signIn).not.toHaveBeenCalled();
        });

        it("should propagate repository error when sign-in fails", async () => {
            // Arrange
            const repositoryError = createMockAuthError({
                code: "INVALID_CREDENTIALS",
                message: "Invalid email or password",
                status: 401,
            });
            mockRepo.signIn.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                signInUser(mockRepo, validCredentials)
            ).rejects.toEqual(repositoryError);
            expect(mockRepo.signIn).toHaveBeenCalledTimes(1);
            expect(mockRepo.signIn).toHaveBeenCalledWith(validCredentials);
        });

        it("should accept valid email with subdomain", async () => {
            // Arrange
            const credentialsWithSubdomain: SignInCredentials = {
                email: "user@mail.example.com",
                password: "password123",
            };
            const mockUser = createMockUser({
                email: credentialsWithSubdomain.email,
            });
            const mockSession = createMockSession(mockUser);
            mockRepo.signIn.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signInUser(mockRepo, credentialsWithSubdomain);

            // Assert
            expect(mockRepo.signIn).toHaveBeenCalledWith(
                credentialsWithSubdomain
            );
            expect(result.user.email).toBe(credentialsWithSubdomain.email);
        });

        it("should accept valid email with plus sign", async () => {
            // Arrange
            const credentialsWithPlus: SignInCredentials = {
                email: "user+tag@example.com",
                password: "password123",
            };
            const mockUser = createMockUser({ email: credentialsWithPlus.email });
            const mockSession = createMockSession(mockUser);
            mockRepo.signIn.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signInUser(mockRepo, credentialsWithPlus);

            // Assert
            expect(mockRepo.signIn).toHaveBeenCalledWith(credentialsWithPlus);
            expect(result.user.email).toBe(credentialsWithPlus.email);
        });
    });

    describe("signUpUser", () => {
        const validCredentials: SignUpCredentials = {
            email: "newuser@example.com",
            password: "securePassword123",
        };

        it("should successfully sign up user with valid credentials", async () => {
            // Arrange
            const mockUser = createMockUser({ email: validCredentials.email });
            const mockSession = createMockSession(mockUser);
            mockRepo.signUp.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signUpUser(mockRepo, validCredentials);

            // Assert
            expect(mockRepo.signUp).toHaveBeenCalledTimes(1);
            expect(mockRepo.signUp).toHaveBeenCalledWith(validCredentials);
            expect(result.session).toEqual(mockSession);
            expect(result.user).toEqual(mockUser);
        });

        it("should throw validation error for empty email", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "",
                password: "securePassword123",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should throw validation error for invalid email format", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "not-an-email",
                password: "securePassword123",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Invalid email format",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should throw validation error for empty password", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "newuser@example.com",
                password: "",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password is required",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should throw validation error for password with only spaces", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "newuser@example.com",
                password: "   ",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password is required",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should throw validation error for password shorter than 8 characters", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "newuser@example.com",
                password: "short",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password must be at least 8 characters long",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should throw validation error for password with exactly 7 characters", async () => {
            // Arrange
            const invalidCredentials: SignUpCredentials = {
                email: "newuser@example.com",
                password: "1234567",
            };

            // Act & Assert
            await expect(
                signUpUser(mockRepo, invalidCredentials)
            ).rejects.toMatchObject({
                code: "VALIDATION_ERROR",
                message: "Password must be at least 8 characters long",
            });
            expect(mockRepo.signUp).not.toHaveBeenCalled();
        });

        it("should accept password with exactly 8 characters", async () => {
            // Arrange
            const credentialsWithMinPassword: SignUpCredentials = {
                email: "newuser@example.com",
                password: "12345678",
            };
            const mockUser = createMockUser({
                email: credentialsWithMinPassword.email,
            });
            const mockSession = createMockSession(mockUser);
            mockRepo.signUp.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signUpUser(mockRepo, credentialsWithMinPassword);

            // Assert
            expect(mockRepo.signUp).toHaveBeenCalledWith(
                credentialsWithMinPassword
            );
            expect(result.user.email).toBe(credentialsWithMinPassword.email);
        });

        it("should accept password longer than 8 characters", async () => {
            // Arrange
            const credentialsWithLongPassword: SignUpCredentials = {
                email: "newuser@example.com",
                password: "verySecurePassword123!@#",
            };
            const mockUser = createMockUser({
                email: credentialsWithLongPassword.email,
            });
            const mockSession = createMockSession(mockUser);
            mockRepo.signUp.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signUpUser(
                mockRepo,
                credentialsWithLongPassword
            );

            // Assert
            expect(mockRepo.signUp).toHaveBeenCalledWith(
                credentialsWithLongPassword
            );
            expect(result.user.email).toBe(credentialsWithLongPassword.email);
        });

        it("should propagate repository error when sign-up fails", async () => {
            // Arrange
            const repositoryError = createMockAuthError({
                code: "EMAIL_ALREADY_EXISTS",
                message: "Email already registered",
                status: 400,
            });
            mockRepo.signUp.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(
                signUpUser(mockRepo, validCredentials)
            ).rejects.toEqual(repositoryError);
            expect(mockRepo.signUp).toHaveBeenCalledTimes(1);
            expect(mockRepo.signUp).toHaveBeenCalledWith(validCredentials);
        });

        it("should accept valid email with subdomain", async () => {
            // Arrange
            const credentialsWithSubdomain: SignUpCredentials = {
                email: "newuser@mail.example.com",
                password: "securePassword123",
            };
            const mockUser = createMockUser({
                email: credentialsWithSubdomain.email,
            });
            const mockSession = createMockSession(mockUser);
            mockRepo.signUp.mockResolvedValue({
                session: mockSession,
                user: mockUser,
            });

            // Act
            const result = await signUpUser(mockRepo, credentialsWithSubdomain);

            // Assert
            expect(mockRepo.signUp).toHaveBeenCalledWith(
                credentialsWithSubdomain
            );
            expect(result.user.email).toBe(credentialsWithSubdomain.email);
        });
    });

    describe("signOutUser", () => {
        it("should successfully sign out user", async () => {
            // Arrange
            mockRepo.signOut.mockResolvedValue(undefined);

            // Act
            await signOutUser(mockRepo);

            // Assert
            expect(mockRepo.signOut).toHaveBeenCalledTimes(1);
            expect(mockRepo.signOut).toHaveBeenCalledWith();
        });

        it("should propagate repository error when sign-out fails", async () => {
            // Arrange
            const repositoryError = createMockAuthError({
                code: "SIGN_OUT_ERROR",
                message: "Failed to sign out",
                status: 500,
            });
            mockRepo.signOut.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(signOutUser(mockRepo)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.signOut).toHaveBeenCalledTimes(1);
        });

        it("should be idempotent (safe to call multiple times)", async () => {
            // Arrange
            mockRepo.signOut.mockResolvedValue(undefined);

            // Act
            await signOutUser(mockRepo);
            await signOutUser(mockRepo);
            await signOutUser(mockRepo);

            // Assert
            expect(mockRepo.signOut).toHaveBeenCalledTimes(3);
        });
    });

    describe("getCurrentSession", () => {
        it("should return session when user is authenticated", async () => {
            // Arrange
            const mockUser = createMockUser();
            const mockSession = createMockSession(mockUser);
            mockRepo.getSession.mockResolvedValue(mockSession);

            // Act
            const result = await getCurrentSession(mockRepo);

            // Assert
            expect(mockRepo.getSession).toHaveBeenCalledTimes(1);
            expect(mockRepo.getSession).toHaveBeenCalledWith();
            expect(result).toEqual(mockSession);
        });

        it("should return null when no session exists", async () => {
            // Arrange
            mockRepo.getSession.mockResolvedValue(null);

            // Act
            const result = await getCurrentSession(mockRepo);

            // Assert
            expect(mockRepo.getSession).toHaveBeenCalledTimes(1);
            expect(mockRepo.getSession).toHaveBeenCalledWith();
            expect(result).toBeNull();
        });

        it("should propagate repository error when session retrieval fails", async () => {
            // Arrange
            const repositoryError = createMockAuthError({
                code: "SESSION_ERROR",
                message: "Failed to retrieve session",
                status: 500,
            });
            mockRepo.getSession.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(getCurrentSession(mockRepo)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.getSession).toHaveBeenCalledTimes(1);
        });

        it("should return session with null refreshToken when refresh token is not available", async () => {
            // Arrange
            const mockUser = createMockUser();
            const mockSession = createMockSession(mockUser, {
                refreshToken: null,
            });
            mockRepo.getSession.mockResolvedValue(mockSession);

            // Act
            const result = await getCurrentSession(mockRepo);

            // Assert
            expect(result).toEqual(mockSession);
            expect(result?.refreshToken).toBeNull();
        });
    });

    describe("getCurrentUser", () => {
        it("should return user when user is authenticated", async () => {
            // Arrange
            const mockUser = createMockUser();
            mockRepo.getUser.mockResolvedValue(mockUser);

            // Act
            const result = await getCurrentUser(mockRepo);

            // Assert
            expect(mockRepo.getUser).toHaveBeenCalledTimes(1);
            expect(mockRepo.getUser).toHaveBeenCalledWith();
            expect(result).toEqual(mockUser);
        });

        it("should return null when no user is authenticated", async () => {
            // Arrange
            mockRepo.getUser.mockResolvedValue(null);

            // Act
            const result = await getCurrentUser(mockRepo);

            // Assert
            expect(mockRepo.getUser).toHaveBeenCalledTimes(1);
            expect(mockRepo.getUser).toHaveBeenCalledWith();
            expect(result).toBeNull();
        });

        it("should propagate repository error when user retrieval fails", async () => {
            // Arrange
            const repositoryError = createMockAuthError({
                code: "USER_ERROR",
                message: "Failed to retrieve user",
                status: 500,
            });
            mockRepo.getUser.mockRejectedValue(repositoryError);

            // Act & Assert
            await expect(getCurrentUser(mockRepo)).rejects.toEqual(
                repositoryError
            );
            expect(mockRepo.getUser).toHaveBeenCalledTimes(1);
        });

        it("should return user with all required fields", async () => {
            // Arrange
            const mockUser = createMockUser({
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "test@example.com",
                createdAt: "2025-01-01T00:00:00.000Z",
                updatedAt: "2025-01-27T14:00:00.000Z",
            });
            mockRepo.getUser.mockResolvedValue(mockUser);

            // Act
            const result = await getCurrentUser(mockRepo);

            // Assert
            expect(result).toHaveProperty("id");
            expect(result).toHaveProperty("email");
            expect(result).toHaveProperty("createdAt");
            expect(result).toHaveProperty("updatedAt");
            expect(result?.id).toBe(mockUser.id);
            expect(result?.email).toBe(mockUser.email);
        });
    });

    describe("Error Handling", () => {
        it("should preserve error structure from repository", async () => {
            // Arrange
            const repositoryError: AuthError = {
                code: "CUSTOM_ERROR",
                message: "Custom error message",
                status: 403,
            };
            mockRepo.signIn.mockRejectedValue(repositoryError);

            // Act & Assert
            try {
                await signInUser(mockRepo, {
                    email: "user@example.com",
                    password: "password123",
                });
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toEqual(repositoryError);
                expect((error as AuthError).code).toBe("CUSTOM_ERROR");
                expect((error as AuthError).status).toBe(403);
            }
        });

        it("should handle errors without status code", async () => {
            // Arrange
            const repositoryError: AuthError = {
                code: "ERROR_WITHOUT_STATUS",
                message: "Error without status",
            };
            mockRepo.getSession.mockRejectedValue(repositoryError);

            // Act & Assert
            try {
                await getCurrentSession(mockRepo);
                fail("Expected error to be thrown");
            } catch (error) {
                expect(error).toEqual(repositoryError);
                expect((error as AuthError).status).toBeUndefined();
            }
        });
    });
});

