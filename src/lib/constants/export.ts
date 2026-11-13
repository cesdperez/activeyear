import type { Theme } from '#lib/types/index.js';

export const THEME_OPTIONS = [
	{ value: 'neon', label: 'Neon' },
	{ value: 'minimalist', label: 'Minimal' },
	{ value: 'retro', label: 'Retro' },
	{ value: 'classic', label: 'Classic' },
	{ value: 'synthwave', label: 'Synthwave' }
] as const satisfies readonly { value: Theme; label: string }[];

export const UPCOMING_THEMES = [{ label: 'Lightmile' }] as const;

export const USER_NAME_MAX_LENGTH = 40;
export const NAME_LONG_AFTER_CHARS = 16;
export const NAME_FONT_SIZE = { short: 42, long: 32 };

export const HIGHLIGHTS_LIMIT = 10;
export const TIMELINE_GAP = { min: 32, max: 160 };
