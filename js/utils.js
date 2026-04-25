/**
 * Utility functions for the Learning Companion app.
 * @module utils
 */

/**
 * Creates a debounced function that delays invoking the provided function until after wait milliseconds have elapsed.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Creates a throttled function that only invokes the provided function at most once per every limit milliseconds.
 * @param {Function} func - The function to throttle.
 * @param {number} limit - The number of milliseconds to throttle invocations to.
 * @returns {Function} The throttled function.
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Sanitizes an input string to prevent XSS attacks by escaping HTML entities.
 * @param {string} input - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return input.replace(reg, (match) => (map[match]));
}

/**
 * Generates a unique identifier string.
 * @returns {string} A unique ID.
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Formats a Date object into a readable localized string.
 * @param {Date|number|string} date - The date to format.
 * @param {string} [locale='en-US'] - The locale string.
 * @returns {string} The formatted date string.
 */
export function formatDate(date, locale = 'en-US') {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(d);
}
