/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import type { Activity } from "@/core/domain/activity";
import { ActivityType } from "@/core/domain/activity";
import { useRecentActivities } from "@/presentation/hooks/useDashboard";
import frMessages from "@/shared/i18n/messages/fr.json";
import { createActivityId, createProductId } from "../../../utils/brandedIds";

// Mock Supabase client before importing components
jest.mock("@/infrastructure/supabase/client", () => ({
    supabaseClient: {
        from: jest.fn(),
    },
}));

jest.mock("@/presentation/hooks/useDashboard");

import RecentActivitiesWidget from "@/presentation/components/dashboardOverview/RecentActivitiesWidget/RecentActivitiesWidget";

const mockUseRecentActivities = useRecentActivities as jest.MockedFunction<typeof useRecentActivities>;

describe("RecentActivitiesWidget", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render loading state", () => {
        mockUseRecentActivities.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByText(frMessages.common.loading)).toBeInTheDocument();
    });

    it("should render error state", () => {
        mockUseRecentActivities.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Failed to load"),
        } as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByText(frMessages.errors.dashboard.activities)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render empty state when no activities", () => {
        mockUseRecentActivities.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            isError: false,
            isPending: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByText(frMessages.empty.dashboard.recentActivities)).toBeInTheDocument();
    });

    it("should render list of recent activities", () => {
        const mockActivities: Activity[] = [
            {
                id: createActivityId("1"),
                type: ActivityType.SALE,
                date: "2025-01-27T10:00:00.000Z",
                amount: 100.5,
                quantity: -1,
                productId: createProductId("prod1"),
            },
            {
                id: createActivityId("2"),
                type: ActivityType.CREATION,
                date: "2025-01-26T15:30:00.000Z",
                amount: 50.25,
                quantity: 1,
                productId: createProductId("prod2"),
            },
        ];

        mockUseRecentActivities.mockReturnValue({
            data: mockActivities,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByText("Vente")).toBeInTheDocument();
        expect(screen.getByText("Création")).toBeInTheDocument();
        // Check for formatted currency (French locale)
        expect(screen.getByText(/100[,.]50[\s]€/)).toBeInTheDocument();
        expect(screen.getByText(/50[,.]25[\s]€/)).toBeInTheDocument();
    });

    it("should render card with correct title", () => {
        mockUseRecentActivities.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            isError: false,
            isPending: false,
            isSuccess: true,
        } as unknown as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByRole("heading", { name: "Activités récentes", level: 2 })).toBeInTheDocument();
    });

    it("should use semantic HTML structure with list", () => {
        const mockActivities: Activity[] = [
            {
                id: createActivityId("1"),
                type: ActivityType.SALE,
                date: "2025-01-27T10:00:00.000Z",
                amount: 100,
                quantity: -1,
                productId: createProductId("prod1"),
            },
        ];

        mockUseRecentActivities.mockReturnValue({
            data: mockActivities,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        const list = screen.getByRole("list");
        expect(list).toBeInTheDocument();
        expect(list.querySelectorAll("li")).toHaveLength(1);
    });

    it("should format activity types correctly", () => {
        const mockActivities: Activity[] = [
            {
                id: createActivityId("1"),
                type: ActivityType.SALE,
                date: "2025-01-27T10:00:00.000Z",
                amount: 100,
                quantity: -1,
                productId: createProductId("prod1"),
            },
            {
                id: createActivityId("2"),
                type: ActivityType.STOCK_CORRECTION,
                date: "2025-01-27T10:00:00.000Z",
                amount: 50,
                quantity: 5,
                productId: createProductId("prod2"),
            },
            {
                id: createActivityId("3"),
                type: ActivityType.OTHER,
                date: "2025-01-27T10:00:00.000Z",
                amount: 25,
                quantity: 0,
                productId: createProductId("prod3"),
            },
        ];

        mockUseRecentActivities.mockReturnValue({
            data: mockActivities,
            isLoading: false,
            error: null,
        } as ReturnType<typeof useRecentActivities>);

        render(<RecentActivitiesWidget />);
        expect(screen.getByText("Vente")).toBeInTheDocument();
        expect(screen.getByText("Correction de stock")).toBeInTheDocument();
        expect(screen.getByText("Autre")).toBeInTheDocument();
    });
});

