/**
 * Chart Theme Constants
 *
 * Chart color constants matching SCSS variables from `styles/variables/_colors.scss`.
 * These constants are used by Recharts components which require JavaScript color values.
 *
 * Colors match the design system:
 * - Primary color: $color-primary (#667eea)
 * - Success color: $color-success (#10b981)
 *
 * When updating colors, ensure both SCSS variables and these TypeScript constants are updated.
 */

/**
 * Primary chart color matching $color-primary SCSS variable.
 * Used for main chart lines and bars.
 */
export const CHART_COLOR_PRIMARY = "#667eea";

/**
 * Success chart color matching $color-success SCSS variable.
 * Used for secondary chart lines (e.g., margin/profit indicators).
 */
export const CHART_COLOR_SUCCESS = "#10b981";

