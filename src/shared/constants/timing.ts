/**
 * Shared timing constants for delays and timeouts.
 *
 * These constants provide consistent timing values across the application
 * for accessibility, UX, and async operations.
 */

/**
 * Delay in milliseconds to allow screen readers to announce success messages
 * before redirecting to another page.
 *
 * This delay ensures that users relying on assistive technologies have time
 * to hear the success announcement before navigation occurs.
 * Set to 2.5 seconds to accommodate slower devices and verbose screen reader settings.
 */
export const ACCESSIBILITY_ANNOUNCEMENT_DELAY_MS = 2500;

