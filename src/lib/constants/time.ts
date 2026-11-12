export const ONE_MINUTE_IN_SECONDS = 60;
export const ONE_HOUR_IN_SECONDS = 3600;

export const TARGET_YEAR = 2026;

/** A fast parse would otherwise blink the loading state straight into an error. */
export const MIN_UPLOAD_LOADING_MS = 400;

/** Monday first, matching the order of `WeeklyPattern`. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
