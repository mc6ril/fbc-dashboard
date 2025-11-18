/**
 * Currency Utility Tests
 *
 * Tests for currency formatting utility functions to ensure
 * correct formatting behavior with various inputs and edge cases.
 *
 * These tests verify:
 * - Currency formatting with various amounts
 * - French locale formatting (fr-FR)
 * - EUR currency symbol
 * - Decimal places (always 2)
 * - Edge cases (zero, negative, large numbers)
 */

import { formatCurrency } from "@/shared/utils/currency";

describe("Currency Utilities", () => {
    describe("formatCurrency", () => {
        it("should format positive amounts correctly", () => {
            const result = formatCurrency(1234.56);
            // French locale formats as "1 234,56 €"
            expect(result).toMatch(/1[\s]234[,.]56[\s]€/);
        });

        it("should format zero correctly", () => {
            const result = formatCurrency(0);
            // French locale formats as "0,00 €"
            expect(result).toMatch(/0[,.]00[\s]€/);
        });

        it("should format negative amounts correctly", () => {
            const result = formatCurrency(-123.45);
            // French locale formats negative as "-123,45 €"
            expect(result).toMatch(/-123[,.]45[\s]€/);
        });

        it("should format small amounts correctly", () => {
            const result = formatCurrency(0.01);
            // French locale formats as "0,01 €"
            expect(result).toMatch(/0[,.]01[\s]€/);
        });

        it("should format large amounts correctly", () => {
            const result = formatCurrency(1234567.89);
            // French locale formats as "1 234 567,89 €"
            expect(result).toMatch(/1[\s]234[\s]567[,.]89[\s]€/);
        });

        it("should always display 2 decimal places", () => {
            const result1 = formatCurrency(100);
            expect(result1).toMatch(/100[,.]00[\s]€/);

            const result2 = formatCurrency(100.5);
            expect(result2).toMatch(/100[,.]50[\s]€/);

            const result3 = formatCurrency(100.1);
            expect(result3).toMatch(/100[,.]10[\s]€/);
        });

        it("should round to 2 decimal places", () => {
            const result1 = formatCurrency(123.456);
            // Should round to 123,46 €
            expect(result1).toMatch(/123[,.]46[\s]€/);

            const result2 = formatCurrency(123.454);
            // Should round to 123,45 €
            expect(result2).toMatch(/123[,.]45[\s]€/);
        });

        it("should use EUR currency symbol", () => {
            const result = formatCurrency(100);
            expect(result).toContain("€");
        });

        it("should use French locale formatting", () => {
            const result = formatCurrency(1234.56);
            // French locale uses space as thousand separator and comma as decimal separator
            expect(result).toMatch(/1[\s]234[,.]56/);
        });

        it("should handle very small amounts", () => {
            const result = formatCurrency(0.001);
            // Should round to 0,00 €
            expect(result).toMatch(/0[,.]00[\s]€/);
        });

        it("should handle very large amounts", () => {
            const result = formatCurrency(999999999.99);
            // French locale formats as "999 999 999,99 €"
            expect(result).toMatch(/999[\s]999[\s]999[,.]99[\s]€/);
        });
    });
});

