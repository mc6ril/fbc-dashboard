/**
 * ActivityPagination Component
 *
 * Pagination controls component for navigating between pages of activities.
 * Provides Previous/Next buttons and page number indicators.
 * Optimized with memoization to prevent unnecessary re-renders.
 */

"use client";

import React from "react";
import Button from "@/presentation/components/ui/Button";
import styles from "./ActivityPagination.module.scss";

type Props = {
    /** Current page number (1-based) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback function called when page changes */
    onPageChange: (page: number) => void;
};

/**
 * Page button component for pagination.
 * Memoized to prevent unnecessary re-renders.
 */
type PageButtonProps = {
    page: number;
    isCurrentPage: boolean;
    onPageClick: (page: number) => void;
};

const PageButton = React.memo(({ page, isCurrentPage, onPageClick }: PageButtonProps) => {
    const handleClick = React.useCallback(() => {
        onPageClick(page);
    }, [page, onPageClick]);

    return (
        <button
            type="button"
            className={`${styles.activityPagination__page} ${
                isCurrentPage ? styles.activityPagination__pageActive : ""
            }`}
            onClick={handleClick}
            disabled={isCurrentPage}
            aria-label={
                isCurrentPage ? `Current page, page ${page}` : `Go to page ${page}`
            }
            aria-current={isCurrentPage ? "page" : undefined}
        >
            {page}
        </button>
    );
});

PageButton.displayName = "PageButton";

const ActivityPaginationComponent = ({
    currentPage,
    totalPages,
    onPageChange,
}: Props) => {
    // Calculate if buttons should be disabled
    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= totalPages;

    // Generate page numbers to display
    // Show up to 7 page numbers: current page, 3 before, 3 after
    // If near start/end, adjust accordingly
    const pageNumbers = React.useMemo(() => {
        if (totalPages === 0) {
            return [];
        }

        const pages: number[] = [];
        const maxVisible = 7;
        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, currentPage + 3);

        // Adjust if we're near the start
        if (currentPage <= 4) {
            startPage = 1;
            endPage = Math.min(maxVisible, totalPages);
        }

        // Adjust if we're near the end
        if (currentPage >= totalPages - 3) {
            startPage = Math.max(1, totalPages - maxVisible + 1);
            endPage = totalPages;
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    // Event handlers with useCallback to prevent unnecessary re-renders
    const handlePrevious = React.useCallback(() => {
        if (!isFirstPage) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, isFirstPage, onPageChange]);

    const handleNext = React.useCallback(() => {
        if (!isLastPage) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, isLastPage, onPageChange]);

    const handlePageClick = React.useCallback(
        (page: number) => {
            if (page !== currentPage && page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        },
        [currentPage, totalPages, onPageChange]
    );

    // Don't render if there are no pages
    if (totalPages === 0) {
        return null;
    }

    return (
        <nav
            className={styles.activityPagination}
            aria-label="Activities pagination"
        >
            <div className={styles.activityPagination__controls}>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={isFirstPage}
                    ariaLabel={`Go to previous page (page ${currentPage - 1})`}
                >
                    Previous
                </Button>

                <div className={styles.activityPagination__pages} role="list">
                    {pageNumbers.map((page) => (
                        <PageButton
                            key={page}
                            page={page}
                            isCurrentPage={page === currentPage}
                            onPageClick={handlePageClick}
                        />
                    ))}
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNext}
                    disabled={isLastPage}
                    ariaLabel={`Go to next page (page ${currentPage + 1})`}
                >
                    Next
                </Button>
            </div>
        </nav>
    );
};

const ActivityPagination = React.memo(ActivityPaginationComponent);
export default ActivityPagination;

