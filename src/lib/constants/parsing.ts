import type { ActivityType } from '#lib/types/index.js';

// Garmin loads activities in pages of 20 before exporting.
export const GARMIN_PAGE_SIZE = 20;

/** Bounds a quoted field that spans lines, so an unclosed quote cannot swallow the rest of the file. */
export const MAX_RECORD_LINES = 50;
export const MAX_RECORD_CHARS = 10_000;

export const TYPES_WITHOUT_DISTANCE: ReadonlySet<ActivityType> = new Set(['climbing']);
