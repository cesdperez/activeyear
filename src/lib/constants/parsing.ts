import type { ActivityType, RowErrorType } from '#lib/types/index.js';

/** Bounds a quoted field that spans lines, so an unclosed quote cannot swallow the rest of the file. */
export const MAX_RECORD_LINES = 50;
export const MAX_RECORD_CHARS = 10_000;

/** Completes "row 4: ..." in upload errors. Never quote cell contents, titles and notes are private. */
export const ROW_ERROR_REASONS: Record<RowErrorType, string> = {
	'invalid-date': 'the date is not valid',
	'malformed-quotes': 'the quote marks do not match',
	'missing-column': 'the activity type or date is missing'
};

export const TYPES_WITHOUT_DISTANCE: ReadonlySet<ActivityType> = new Set(['climbing']);
