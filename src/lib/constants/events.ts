import { THEME_OPTIONS } from '#lib/constants/export.js';

const THEMES = THEME_OPTIONS.map((theme) => theme.value);

export const EVENT_VALUES = {
	upload_success: ['1-10', '11-50', '51-200', '200+'],
	upload_error: [
		'unsupported-file-type',
		'unsupported-format',
		'rows-rejected',
		'no-activities-in-year',
		'invalid-saved-year',
		'read-failed'
	],
	theme_selected: THEMES,
	export: THEMES,
	more_stats_opened: [''],
	sports_count: ['1', '2', '3-5', '6+']
} as const;

export const MAX_EVENT_BODY_LENGTH = 256;
export type EventName = keyof typeof EVENT_VALUES;
export type EventValue<E extends EventName> = (typeof EVENT_VALUES)[E][number];
