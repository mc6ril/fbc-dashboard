/**
 * Table Component
 *
 * A reusable table component for displaying structured data in a tabular format.
 * Provides proper accessibility (WCAG 2.1 AA) with semantic HTML and ARIA attributes.
 *
 * The component provides:
 * - Semantic HTML structure using `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
 * - Accessible table caption and labels
 * - Proper scope attributes for headers
 * - Consistent styling using design system tokens
 *
 * @component
 */

import React from "react";
import { useTranslation } from "@/presentation/hooks/useTranslation";
import "@/styles/components/_table.scss";

/**
 * Column definition for table structure.
 */
export type TableColumn<T = Record<string, unknown>> = {
    /** Unique key for the column (used to access data from row objects) */
    key: string;
    /** Header text to display in the table header */
    header: string;
    /** Optional custom render function for cell content */
    render?: (value: unknown, row: T) => React.ReactNode;
    /** Whether this column should be a row header (scope="row") */
    isRowHeader?: boolean;
};

type Props<T = Record<string, unknown>> = {
    /** Array of column definitions */
    columns: TableColumn<T>[];
    /** Array of data objects to display in table rows */
    data: T[];
    /** Optional table caption for accessibility */
    caption?: string;
    /** Optional aria-label for the table (used if caption is not provided) */
    ariaLabel?: string;
    /** Optional additional CSS class names */
    className?: string;
};

const TableComponent = <T extends Record<string, unknown>>({
    columns,
    data,
    caption,
    ariaLabel,
    className,
}: Props<T>) => {
    const t = useTranslation("ui.table");

    const tableClassName = React.useMemo(() => {
        const base = ["table"];
        if (className && className.trim().length > 0) {
            base.push(className);
        }
        return base.join(" ");
    }, [className]);

    // Generate stable caption ID based on caption text (simple hash)
    const captionId = React.useMemo(() => {
        if (!caption) {
            return undefined;
        }
        // Generate a stable ID based on caption text (simple hash)
        const hash = caption
            .split("")
            .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
        return `table-caption-${Math.abs(hash)}`;
    }, [caption]);

    // Determine aria-label or aria-labelledby
    const tableAriaLabel = React.useMemo(
        () => (!caption && ariaLabel ? ariaLabel : undefined),
        [caption, ariaLabel]
    );
    const tableLabelledBy = React.useMemo(
        () => (caption && captionId ? captionId : undefined),
        [caption, captionId]
    );

    return (
        <table
            className={tableClassName}
            aria-label={tableAriaLabel}
            aria-labelledby={tableLabelledBy}
        >
            {caption && (
                <caption id={captionId} className="table__caption">
                    {caption}
                </caption>
            )}
            <thead className="table__head">
                <tr className="table__row">
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            className="table__header"
                            scope="col"
                        >
                            {column.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="table__body">
                {data.length === 0 ? (
                    <tr className="table__row">
                        <td
                            className="table__cell table__cell--empty"
                            colSpan={columns.length}
                        >
                            {t("empty")}
                        </td>
                    </tr>
                ) : (
                    data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="table__row">
                            {columns.map((column) => {
                                const value = row[column.key];
                                const cellContent: React.ReactNode = column.render
                                    ? column.render(value, row)
                                    : (value as React.ReactNode);

                                if (column.isRowHeader) {
                                    return (
                                        <th
                                            key={column.key}
                                            className="table__header table__header--row"
                                            scope="row"
                                        >
                                            {cellContent}
                                        </th>
                                    );
                                }

                                return (
                                    <td key={column.key} className="table__cell">
                                        {cellContent}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

const Table = React.memo(TableComponent) as <T extends Record<string, unknown>>(
    props: Props<T>
) => React.ReactElement;
export default Table;

