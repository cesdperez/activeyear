import type { Theme } from '#lib/types/index.js';

export const THEME_OPTIONS = [
	{ value: 'neon', label: 'Neon', description: 'Cyberpunk' },
	{ value: 'minimalist', label: 'Minimal', description: 'Swiss' },
	{ value: 'retro', label: 'Retro', description: '8-bit' }
] as const satisfies readonly { value: Theme; label: string; description: string }[];

export const USER_NAME_MAX_LENGTH = 40;
export const NAME_LONG_AFTER_CHARS = 16;
export const NAME_FONT_SIZE = { short: 42, long: 32 };

export const HIGHLIGHTS_LIMIT = 10;
export const TIMELINE_GAP = { min: 32, max: 160 };
