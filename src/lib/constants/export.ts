import type { Theme } from '#lib/types/index.js';

export const THEME_OPTIONS = [
	{ value: 'neon', label: 'Neon' },
	{ value: 'minimalist', label: 'Minimal' },
	{ value: 'retro', label: 'Retro' },
	{ value: 'classic', label: 'Classic' },
	{ value: 'synthwave', label: 'Synthwave' },
	{ value: 'lightmile', label: 'Lightmile' }
] as const satisfies readonly { value: Theme; label: string }[];

export const USER_NAME_MAX_LENGTH = 40;
export const NAME_LONG_AFTER_CHARS = 16;
export const NAME_FONT_SIZE = { short: 42, long: 32 };

export const HIGHLIGHTS_LIMIT = 10;
export const TIMELINE_GAP = { min: 32, max: 160 };

// Twice the largest avatar a card draws (320px on the Summary card), so the preview stays sharp.
export const AVATAR_MAX_SIDE = 640;
