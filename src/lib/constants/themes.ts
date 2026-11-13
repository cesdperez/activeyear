import type { Theme } from '#lib/types/index.js';

/** Each theme's `--color-surface`, for places CSS cannot reach: the PNG fill and `theme-color`. */
export const THEME_SURFACES: Record<Theme, string> = {
	neon: '#0c1013',
	minimalist: '#f6f7f7',
	retro: '#1c1650'
};
