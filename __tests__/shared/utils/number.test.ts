/**
 * Number Validation and Parsing Utilities Tests
 *
 * Tests for number validation and parsing utility functions to ensure
 * correct validation behavior with various inputs and edge cases.
 *
 * These tests verify:
 * - Number validation (NaN, Infinity checks)
 * - Safe number parsing with validation
 * - String number validation for Zod schemas
 * - Positive number validation
 * - Optional positive number validation
 */

import {
    validateNumber,
    isValidNumber,
    parseValidNumber,
    isValidNumberString,
    isValidPositiveNumberString,
    isValidOptionalPositiveNumberString,
} from "@/shared/utils/number";

describe("Number Utilities", () => {
    describe("validateNumber", () => {
        it("should not throw for valid positive numbers", () => {
            expect(() => {
                validateNumber(1, "test");
                validateNumber(100, "test");
                validateNumber(0.5, "test");
                validateNumber(1234.56, "test");
            }).not.toThrow();
        });

        it("should not throw for valid negative numbers", () => {
            expect(() => {
                validateNumber(-1, "test");
                validateNumber(-100, "test");
                validateNumber(-0.5, "test");
                validateNumber(-1234.56, "test");
            }).not.toThrow();
        });

        it("should not throw for zero", () => {
            expect(() => {
                validateNumber(0, "test");
            }).not.toThrow();
        });

        it("should throw error for NaN", () => {
            expect(() => {
                validateNumber(NaN, "quantity");
            }).toThrow("quantity must be a valid number");
        });

        it("should throw error for Infinity", () => {
            expect(() => {
                validateNumber(Infinity, "amount");
            }).toThrow("amount must be a finite number");
        });

        it("should throw error for -Infinity", () => {
            expect(() => {
                validateNumber(-Infinity, "value");
            }).toThrow("value must be a finite number");
        });

        it("should include field name in error message", () => {
            expect(() => {
                validateNumber(NaN, "myField");
            }).toThrow("myField must be a valid number");

            expect(() => {
                validateNumber(Infinity, "myField");
            }).toThrow("myField must be a finite number");
        });
    });

    describe("isValidNumber", () => {
        it("should return true for valid positive numbers", () => {
            expect(isValidNumber(1)).toBe(true);
            expect(isValidNumber(100)).toBe(true);
            expect(isValidNumber(0.5)).toBe(true);
            expect(isValidNumber(1234.56)).toBe(true);
        });

        it("should return true for valid negative numbers", () => {
            expect(isValidNumber(-1)).toBe(true);
            expect(isValidNumber(-100)).toBe(true);
            expect(isValidNumber(-0.5)).toBe(true);
            expect(isValidNumber(-1234.56)).toBe(true);
        });

        it("should return true for zero", () => {
            expect(isValidNumber(0)).toBe(true);
        });

        it("should return false for NaN", () => {
            expect(isValidNumber(NaN)).toBe(false);
        });

        it("should return false for Infinity", () => {
            expect(isValidNumber(Infinity)).toBe(false);
        });

        it("should return false for -Infinity", () => {
            expect(isValidNumber(-Infinity)).toBe(false);
        });
    });

    describe("parseValidNumber", () => {
        describe("with string inputs", () => {
            it("should parse valid positive number strings", () => {
                expect(parseValidNumber("1", "test")).toBe(1);
                expect(parseValidNumber("100", "test")).toBe(100);
                expect(parseValidNumber("0.5", "test")).toBe(0.5);
                expect(parseValidNumber("1234.56", "test")).toBe(1234.56);
            });

            it("should parse valid negative number strings", () => {
                expect(parseValidNumber("-1", "test")).toBe(-1);
                expect(parseValidNumber("-100", "test")).toBe(-100);
                expect(parseValidNumber("-0.5", "test")).toBe(-0.5);
                expect(parseValidNumber("-1234.56", "test")).toBe(-1234.56);
            });

            it("should parse zero string", () => {
                expect(parseValidNumber("0", "test")).toBe(0);
            });

            it("should parse decimal strings", () => {
                expect(parseValidNumber("0.1", "test")).toBe(0.1);
                expect(parseValidNumber("0.01", "test")).toBe(0.01);
                expect(parseValidNumber("10.99", "test")).toBe(10.99);
            });

            it("should parse scientific notation strings", () => {
                expect(parseValidNumber("1e2", "test")).toBe(100);
                expect(parseValidNumber("1.5e2", "test")).toBe(150);
            });

            it("should throw error for invalid string (NaN)", () => {
                expect(() => {
                    parseValidNumber("abc", "quantity");
                }).toThrow("Invalid quantity value: abc");

                expect(() => {
                    parseValidNumber("not a number", "amount");
                }).toThrow("Invalid amount value: not a number");
            });

            it("should throw error for empty string", () => {
                expect(() => {
                    parseValidNumber("", "test");
                }).toThrow("Invalid test value: ");
            });

            it("should throw error for string that parses to Infinity", () => {
                // Note: parseFloat("Infinity") returns Infinity
                expect(() => {
                    parseValidNumber("Infinity", "test");
                }).toThrow("test must be a finite number: Infinity");
            });
        });

        describe("with number inputs", () => {
            it("should return valid positive numbers as-is", () => {
                expect(parseValidNumber(1, "test")).toBe(1);
                expect(parseValidNumber(100, "test")).toBe(100);
                expect(parseValidNumber(0.5, "test")).toBe(0.5);
                expect(parseValidNumber(1234.56, "test")).toBe(1234.56);
            });

            it("should return valid negative numbers as-is", () => {
                expect(parseValidNumber(-1, "test")).toBe(-1);
                expect(parseValidNumber(-100, "test")).toBe(-100);
                expect(parseValidNumber(-0.5, "test")).toBe(-0.5);
            });

            it("should return zero as-is", () => {
                expect(parseValidNumber(0, "test")).toBe(0);
            });

            it("should throw error for NaN number", () => {
                expect(() => {
                    parseValidNumber(NaN, "quantity");
                }).toThrow("quantity must be a valid number");
            });

            it("should throw error for Infinity number", () => {
                expect(() => {
                    parseValidNumber(Infinity, "amount");
                }).toThrow("amount must be a finite number");
            });

            it("should throw error for -Infinity number", () => {
                expect(() => {
                    parseValidNumber(-Infinity, "value");
                }).toThrow("value must be a finite number");
            });
        });
    });

    describe("isValidNumberString", () => {
        it("should return true for valid positive number strings", () => {
            expect(isValidNumberString("1")).toBe(true);
            expect(isValidNumberString("100")).toBe(true);
            expect(isValidNumberString("0.5")).toBe(true);
            expect(isValidNumberString("1234.56")).toBe(true);
        });

        it("should return true for valid negative number strings", () => {
            expect(isValidNumberString("-1")).toBe(true);
            expect(isValidNumberString("-100")).toBe(true);
            expect(isValidNumberString("-0.5")).toBe(true);
            expect(isValidNumberString("-1234.56")).toBe(true);
        });

        it("should return true for zero string", () => {
            expect(isValidNumberString("0")).toBe(true);
        });

        it("should return true for decimal strings", () => {
            expect(isValidNumberString("0.1")).toBe(true);
            expect(isValidNumberString("0.01")).toBe(true);
            expect(isValidNumberString("10.99")).toBe(true);
        });

        it("should return false for invalid strings", () => {
            expect(isValidNumberString("abc")).toBe(false);
            expect(isValidNumberString("not a number")).toBe(false);
            expect(isValidNumberString("")).toBe(false);
        });

        it("should return false for strings that parse to NaN", () => {
            expect(isValidNumberString("NaN")).toBe(false);
        });

        it("should return false for strings that parse to Infinity", () => {
            expect(isValidNumberString("Infinity")).toBe(false);
            expect(isValidNumberString("-Infinity")).toBe(false);
        });

        it("should handle strings with leading/trailing spaces", () => {
            // parseFloat ignores leading spaces, but trailing spaces might cause issues
            // This test verifies current behavior
            expect(isValidNumberString("  123  ")).toBe(true); // parseFloat handles leading spaces
        });
    });

    describe("isValidPositiveNumberString", () => {
        it("should return true for valid positive number strings", () => {
            expect(isValidPositiveNumberString("1")).toBe(true);
            expect(isValidPositiveNumberString("100")).toBe(true);
            expect(isValidPositiveNumberString("0.5")).toBe(true);
            expect(isValidPositiveNumberString("1234.56")).toBe(true);
            expect(isValidPositiveNumberString("0.01")).toBe(true);
        });

        it("should return false for zero string", () => {
            expect(isValidPositiveNumberString("0")).toBe(false);
        });

        it("should return false for negative number strings", () => {
            expect(isValidPositiveNumberString("-1")).toBe(false);
            expect(isValidPositiveNumberString("-100")).toBe(false);
            expect(isValidPositiveNumberString("-0.5")).toBe(false);
        });

        it("should return false for invalid strings", () => {
            expect(isValidPositiveNumberString("abc")).toBe(false);
            expect(isValidPositiveNumberString("not a number")).toBe(false);
            expect(isValidPositiveNumberString("")).toBe(false);
        });

        it("should return false for strings that parse to NaN", () => {
            expect(isValidPositiveNumberString("NaN")).toBe(false);
        });

        it("should return false for strings that parse to Infinity", () => {
            expect(isValidPositiveNumberString("Infinity")).toBe(false);
        });
    });

    describe("isValidOptionalPositiveNumberString", () => {
        it("should return true for undefined", () => {
            expect(isValidOptionalPositiveNumberString(undefined)).toBe(true);
        });

        it("should return true for null", () => {
            expect(isValidOptionalPositiveNumberString(null)).toBe(true);
        });

        it("should return true for empty string", () => {
            expect(isValidOptionalPositiveNumberString("")).toBe(true);
        });

        it("should return true for whitespace-only string", () => {
            expect(isValidOptionalPositiveNumberString("   ")).toBe(true);
        });

        it("should return true for valid positive number strings", () => {
            expect(isValidOptionalPositiveNumberString("1")).toBe(true);
            expect(isValidOptionalPositiveNumberString("100")).toBe(true);
            expect(isValidOptionalPositiveNumberString("0.5")).toBe(true);
            expect(isValidOptionalPositiveNumberString("1234.56")).toBe(true);
            expect(isValidOptionalPositiveNumberString("0.01")).toBe(true);
        });

        it("should return false for zero string", () => {
            expect(isValidOptionalPositiveNumberString("0")).toBe(false);
        });

        it("should return false for negative number strings", () => {
            expect(isValidOptionalPositiveNumberString("-1")).toBe(false);
            expect(isValidOptionalPositiveNumberString("-100")).toBe(false);
            expect(isValidOptionalPositiveNumberString("-0.5")).toBe(false);
        });

        it("should return false for invalid strings", () => {
            expect(isValidOptionalPositiveNumberString("abc")).toBe(false);
            expect(isValidOptionalPositiveNumberString("not a number")).toBe(false);
        });

        it("should return false for strings that parse to NaN", () => {
            expect(isValidOptionalPositiveNumberString("NaN")).toBe(false);
        });

        it("should return false for strings that parse to Infinity", () => {
            expect(isValidOptionalPositiveNumberString("Infinity")).toBe(false);
        });

        it("should handle strings with leading/trailing spaces", () => {
            // Empty/whitespace should be valid (optional)
            expect(isValidOptionalPositiveNumberString("   ")).toBe(true);
            
            // Valid numbers with spaces should still validate the number
            // parseFloat handles leading spaces, so "  123" should work
            expect(isValidOptionalPositiveNumberString("  123")).toBe(true);
        });
    });

    describe("Edge cases and integration", () => {
        it("should handle very large numbers", () => {
            expect(() => {
                validateNumber(Number.MAX_SAFE_INTEGER, "test");
            }).not.toThrow();

            expect(isValidNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(parseValidNumber(Number.MAX_SAFE_INTEGER, "test")).toBe(Number.MAX_SAFE_INTEGER);
        });

        it("should handle very small numbers", () => {
            expect(() => {
                validateNumber(Number.MIN_VALUE, "test");
            }).not.toThrow();

            expect(isValidNumber(Number.MIN_VALUE)).toBe(true);
            expect(parseValidNumber(Number.MIN_VALUE, "test")).toBe(Number.MIN_VALUE);
        });

        it("should handle numbers close to zero", () => {
            expect(() => {
                validateNumber(0.0000001, "test");
            }).not.toThrow();

            expect(isValidNumber(0.0000001)).toBe(true);
            expect(parseValidNumber("0.0000001", "test")).toBe(0.0000001);
        });

        it("should consistently validate the same number across all functions", () => {
            const validNumber = 123.45;

            // All validation functions should agree
            expect(() => validateNumber(validNumber, "test")).not.toThrow();
            expect(isValidNumber(validNumber)).toBe(true);
            expect(parseValidNumber(validNumber, "test")).toBe(validNumber);
            expect(isValidNumberString("123.45")).toBe(true);
            expect(isValidPositiveNumberString("123.45")).toBe(true);
        });

        it("should consistently reject NaN across all functions", () => {
            // All validation functions should reject NaN
            expect(() => validateNumber(NaN, "test")).toThrow();
            expect(isValidNumber(NaN)).toBe(false);
            expect(() => parseValidNumber(NaN, "test")).toThrow();
            expect(isValidNumberString("NaN")).toBe(false);
            expect(isValidPositiveNumberString("NaN")).toBe(false);
        });

        it("should consistently reject Infinity across all functions", () => {
            // All validation functions should reject Infinity
            expect(() => validateNumber(Infinity, "test")).toThrow();
            expect(isValidNumber(Infinity)).toBe(false);
            expect(() => parseValidNumber(Infinity, "test")).toThrow();
            expect(isValidNumberString("Infinity")).toBe(false);
            expect(isValidPositiveNumberString("Infinity")).toBe(false);
        });
    });
});

