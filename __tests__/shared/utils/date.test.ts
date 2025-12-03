/**
 * Date Utilities Tests
 *
 * Tests for date utility functions to ensure correct calculation of
 * current month boundaries, ISO 8601 string formatting, and date formatting.
 */

import {
    getCurrentMonthStart,
    getCurrentMonthEnd,
    formatDate,
    getMonthsInRange,
} from "@/shared/utils/date";

describe("Date Utilities", () => {
    // Mock Date to have consistent test results
    const mockDate = (dateString: string) => {
        const date = new Date(dateString);
        jest.useFakeTimers();
        jest.setSystemTime(date);
        return date;
    };

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("getCurrentMonthStart", () => {
        it("should return first day of current month at 00:00:00", () => {
            // Arrange
            const testDate = mockDate("2025-01-15T14:30:00.000Z");
            const expectedYear = testDate.getFullYear();
            const expectedMonth = testDate.getMonth();

            // Act
            const result = getCurrentMonthStart();

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getFullYear()).toBe(expectedYear);
            expect(resultDate.getMonth()).toBe(expectedMonth);
            expect(resultDate.getDate()).toBe(1);
            expect(resultDate.getHours()).toBe(0);
            expect(resultDate.getMinutes()).toBe(0);
            expect(resultDate.getSeconds()).toBe(0);
            expect(resultDate.getMilliseconds()).toBe(0);
        });

        it("should return ISO 8601 format string", () => {
            // Arrange
            mockDate("2025-01-15T14:30:00.000Z");

            // Act
            const result = getCurrentMonthStart();

            // Assert
            // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(() => new Date(result)).not.toThrow(); // Valid date string
        });

        it("should handle month boundaries correctly", () => {
            // Test that the function returns a valid ISO string for different months
            // The exact value depends on timezone, but it should be a valid date string

            // Test January
            mockDate("2025-01-15T12:00:00.000Z");
            let result = getCurrentMonthStart();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            const resultDate = new Date(result);
            expect(resultDate.getTime()).toBeLessThanOrEqual(new Date("2025-01-15T12:00:00.000Z").getTime());

            // Test February
            mockDate("2025-02-15T12:00:00.000Z");
            result = getCurrentMonthStart();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            const resultDate2 = new Date(result);
            expect(resultDate2.getTime()).toBeLessThanOrEqual(new Date("2025-02-15T12:00:00.000Z").getTime());

            // Test December
            mockDate("2025-12-15T12:00:00.000Z");
            result = getCurrentMonthStart();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            const resultDate3 = new Date(result);
            expect(resultDate3.getTime()).toBeLessThanOrEqual(new Date("2025-12-15T12:00:00.000Z").getTime());
        });

        it("should handle year boundaries correctly", () => {
            // Test end of year
            mockDate("2025-12-15T12:00:00.000Z");
            let result = getCurrentMonthStart();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            const resultDate = new Date(result);
            expect(resultDate.getTime()).toBeLessThanOrEqual(new Date("2025-12-15T12:00:00.000Z").getTime());
            // The result should represent a date before or equal to the test date
            // (exact date string depends on timezone, but timestamp comparison is correct)

            // Test start of year
            mockDate("2026-01-15T12:00:00.000Z");
            result = getCurrentMonthStart();
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            const resultDate2 = new Date(result);
            expect(resultDate2.getTime()).toBeLessThanOrEqual(new Date("2026-01-15T12:00:00.000Z").getTime());
            // The result should represent a date before or equal to the test date
        });
    });

    describe("getCurrentMonthEnd", () => {
        it("should return last day of current month at 23:59:59.999", () => {
            // Arrange
            const testDate = mockDate("2025-01-15T14:30:00.000Z");
            const expectedYear = testDate.getFullYear();
            const expectedMonth = testDate.getMonth();

            // Act
            const result = getCurrentMonthEnd();

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getFullYear()).toBe(expectedYear);
            expect(resultDate.getMonth()).toBe(expectedMonth);
            // Check that it's the last day of the month (January has 31 days)
            expect(resultDate.getDate()).toBe(31);
            expect(resultDate.getHours()).toBe(23);
            expect(resultDate.getMinutes()).toBe(59);
            expect(resultDate.getSeconds()).toBe(59);
            expect(resultDate.getMilliseconds()).toBe(999);
        });

        it("should return ISO 8601 format string", () => {
            // Arrange
            mockDate("2025-01-15T14:30:00.000Z");

            // Act
            const result = getCurrentMonthEnd();

            // Assert
            // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
            expect(() => new Date(result)).not.toThrow(); // Valid date string
        });

        it("should handle different month lengths correctly", () => {
            // Test January (31 days)
            mockDate("2025-01-15T12:00:00.000Z");
            let result = getCurrentMonthEnd();
            let resultDate = new Date(result);
            expect(resultDate.getMonth()).toBe(0); // January
            expect(resultDate.getDate()).toBe(31);

            // Test February in non-leap year (28 days)
            mockDate("2025-02-15T12:00:00.000Z");
            result = getCurrentMonthEnd();
            resultDate = new Date(result);
            expect(resultDate.getMonth()).toBe(1); // February
            expect(resultDate.getDate()).toBe(28);

            // Test February in leap year (29 days)
            mockDate("2024-02-15T12:00:00.000Z");
            result = getCurrentMonthEnd();
            resultDate = new Date(result);
            expect(resultDate.getMonth()).toBe(1); // February
            expect(resultDate.getDate()).toBe(29);

            // Test April (30 days)
            mockDate("2025-04-15T12:00:00.000Z");
            result = getCurrentMonthEnd();
            resultDate = new Date(result);
            expect(resultDate.getMonth()).toBe(3); // April
            expect(resultDate.getDate()).toBe(30);
        });

        it("should handle year boundaries correctly", () => {
            // Test end of year (December)
            mockDate("2025-12-15T12:00:00.000Z");
            let result = getCurrentMonthEnd();
            let resultDate = new Date(result);
            expect(resultDate.getFullYear()).toBe(2025);
            expect(resultDate.getMonth()).toBe(11); // December
            expect(resultDate.getDate()).toBe(31);

            // Test start of year (January)
            mockDate("2026-01-15T12:00:00.000Z");
            result = getCurrentMonthEnd();
            resultDate = new Date(result);
            expect(resultDate.getFullYear()).toBe(2026);
            expect(resultDate.getMonth()).toBe(0); // January
            expect(resultDate.getDate()).toBe(31);
        });

        it("should return time at 23:59:59.999", () => {
            // Arrange
            mockDate("2025-06-15T12:00:00.000Z");

            // Act
            const result = getCurrentMonthEnd();

            // Assert
            const resultDate = new Date(result);
            expect(resultDate.getHours()).toBe(23);
            expect(resultDate.getMinutes()).toBe(59);
            expect(resultDate.getSeconds()).toBe(59);
            expect(resultDate.getMilliseconds()).toBe(999);
        });
    });

    describe("formatDate", () => {
        it("should format ISO 8601 date string to French locale format", () => {
            // Arrange
            const isoDate = "2025-01-27T14:30:00.000Z";

            // Act
            const result = formatDate(isoDate);

            // Assert
            // French locale format: "27 janv. 2025" (day month year)
            expect(result).toMatch(/^\d{1,2}\s\w+\.\s\d{4}$/);
            expect(result).toContain("2025");
        });

        it("should format date with correct day", () => {
            // Arrange
            const isoDate = "2025-01-27T14:30:00.000Z";

            // Act
            const result = formatDate(isoDate);

            // Assert
            expect(result).toMatch(/^27\s/);
        });

        it("should format date with abbreviated month name in French", () => {
            // Arrange
            const isoDate = "2025-01-27T14:30:00.000Z";

            // Act
            const result = formatDate(isoDate);

            // Assert
            // January in French abbreviated is "janv."
            expect(result).toMatch(/\sjanv\.\s/);
        });

        it("should format date with correct year", () => {
            // Arrange
            const isoDate = "2025-01-27T14:30:00.000Z";

            // Act
            const result = formatDate(isoDate);

            // Assert
            expect(result).toMatch(/\s2025$/);
        });

        it("should handle different months correctly", () => {
            // Test February
            const febDate = "2025-02-15T10:00:00.000Z";
            let result = formatDate(febDate);
            expect(result).toMatch(/\sfévr\.\s/);

            // Test March
            const marDate = "2025-03-15T10:00:00.000Z";
            result = formatDate(marDate);
            expect(result).toMatch(/\smars\s/);

            // Test December
            const decDate = "2025-12-15T10:00:00.000Z";
            result = formatDate(decDate);
            expect(result).toMatch(/\sdéc\.\s/);
        });

        it("should handle different days correctly", () => {
            // Test single digit day
            const singleDigitDay = "2025-01-05T10:00:00.000Z";
            let result = formatDate(singleDigitDay);
            expect(result).toMatch(/^5\s/);

            // Test double digit day
            const doubleDigitDay = "2025-01-27T10:00:00.000Z";
            result = formatDate(doubleDigitDay);
            expect(result).toMatch(/^27\s/);
        });

        it("should handle different years correctly", () => {
            // Test different year
            const isoDate = "2024-01-27T14:30:00.000Z";
            const result = formatDate(isoDate);
            expect(result).toMatch(/\s2024$/);
        });

        it("should handle dates at different times of day", () => {
            // Test morning
            const morning = "2025-01-27T08:00:00.000Z";
            let result = formatDate(morning);
            expect(result).toMatch(/^27\sjanv\.\s2025$/);

            // Test evening
            const evening = "2025-01-27T20:00:00.000Z";
            result = formatDate(evening);
            expect(result).toMatch(/^27\sjanv\.\s2025$/);
        });

        it("should handle edge case dates", () => {
            // Test first day of year
            const firstDay = "2025-01-01T12:00:00.000Z";
            let result = formatDate(firstDay);
            // Should format to January 2025 (exact day may vary by timezone)
            expect(result).toMatch(/\sjanv\.\s2025$/);

            // Test last day of year (use noon to avoid timezone issues)
            const lastDay = "2025-12-31T12:00:00.000Z";
            result = formatDate(lastDay);
            // Should format to December 2025 (exact day may vary by timezone)
            expect(result).toMatch(/\sdéc\.\s2025$/);
        });

        it("should format date consistently for same day at different times", () => {
            // Use times that are less likely to cross day boundaries in different timezones
            // Use noon UTC which is less likely to cause timezone issues
            const date1 = "2025-01-27T12:00:00.000Z";
            const date2 = "2025-01-27T14:00:00.000Z";
            const date3 = "2025-01-27T16:00:00.000Z";

            const result1 = formatDate(date1);
            const result2 = formatDate(date2);
            const result3 = formatDate(date3);

            // All should format to the same date string (day month year)
            // Since we're using noon UTC, timezone differences are less likely
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        it("should handle date-only format (YYYY-MM-DD) and parse in local timezone", () => {
            // Arrange - date-only format used by PeriodStatistics.period for DAILY period
            const dateOnly = "2025-01-27";

            // Act
            const result = formatDate(dateOnly);

            // Assert
            // Should format correctly regardless of timezone
            // The date should be parsed in local timezone, not UTC
            expect(result).toMatch(/^27\sjanv\.\s2025$/);
        });

        it("should parse date-only format correctly to avoid timezone bugs", () => {
            // This test verifies that date-only strings are parsed in local timezone
            // If parsed as UTC, "2025-01-27" would be interpreted as UTC midnight,
            // which could be the previous day in some timezones (e.g., UTC+1)
            
            // Arrange
            const dateOnly = "2025-01-27";

            // Act
            const result = formatDate(dateOnly);

            // Assert
            // Should always show January 27, not January 26 (which would happen if parsed as UTC in UTC+ timezones)
            expect(result).toMatch(/^27\sjanv\.\s2025$/);
        });

        it("should handle both ISO 8601 and date-only formats correctly", () => {
            // Arrange
            const isoDate = "2025-01-27T14:30:00.000Z";
            const dateOnly = "2025-01-27";

            // Act
            const isoResult = formatDate(isoDate);
            const dateOnlyResult = formatDate(dateOnly);

            // Assert
            // Both should format to the same day/month/year (formatting may differ slightly based on timezone)
            // But both should contain the same date components
            expect(isoResult).toMatch(/janv\.\s2025$/);
            expect(dateOnlyResult).toMatch(/janv\.\s2025$/);
            // Both should show day 27
            expect(isoResult).toMatch(/^27\s/);
            expect(dateOnlyResult).toMatch(/^27\s/);
        });

        it("should handle date-only format for different dates", () => {
            // Test various dates to ensure date-only parsing works correctly
            const testCases = [
                { input: "2025-01-01", expectedDay: "1" },
                { input: "2025-01-15", expectedDay: "15" },
                { input: "2025-12-31", expectedDay: "31" },
            ];

            testCases.forEach(({ input, expectedDay }) => {
                const result = formatDate(input);
                expect(result).toMatch(new RegExp(`^${expectedDay}\\s`));
            });
        });
    });

    describe("getMonthsInRange", () => {
        it("should return all months in a date range", () => {
            // Arrange
            const startDate = "2025-01-15T00:00:00.000Z";
            const endDate = "2025-03-20T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual(["2025-01", "2025-02", "2025-03"]);
        });

        it("should return single month when range is within one month", () => {
            // Arrange
            const startDate = "2025-01-01T00:00:00.000Z";
            const endDate = "2025-01-31T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual(["2025-01"]);
        });

        it("should handle date arithmetic bug: start on 31st of month", () => {
            // Arrange
            // Starting on Jan 31, old implementation would skip February
            // when using setMonth() because Feb 31 doesn't exist
            const startDate = "2025-01-31T00:00:00.000Z";
            const endDate = "2025-03-15T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            // Should include all months: January, February, March
            expect(result).toEqual(["2025-01", "2025-02", "2025-03"]);
        });

        it("should handle date arithmetic bug: start on 30th of month", () => {
            // Arrange
            // Starting on Jan 30, should correctly include February
            const startDate = "2025-01-30T00:00:00.000Z";
            const endDate = "2025-02-28T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual(["2025-01", "2025-02"]);
        });

        it("should handle year rollover", () => {
            // Arrange
            const startDate = "2024-11-15T00:00:00.000Z";
            const endDate = "2025-02-20T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual([
                "2024-11",
                "2024-12",
                "2025-01",
                "2025-02",
            ]);
        });

        it("should handle quarter range", () => {
            // Arrange
            const startDate = "2025-01-01T00:00:00.000Z";
            const endDate = "2025-03-31T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual(["2025-01", "2025-02", "2025-03"]);
        });

        it("should handle full year range", () => {
            // Arrange
            const startDate = "2025-01-01T00:00:00.000Z";
            const endDate = "2025-12-31T23:59:59.999Z";

            // Act
            const result = getMonthsInRange(startDate, endDate);

            // Assert
            expect(result).toEqual([
                "2025-01",
                "2025-02",
                "2025-03",
                "2025-04",
                "2025-05",
                "2025-06",
                "2025-07",
                "2025-08",
                "2025-09",
                "2025-10",
                "2025-11",
                "2025-12",
            ]);
        });
    });
});

