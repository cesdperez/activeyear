import type { Theme } from '#lib/types/index.js';

/** Each theme's `--color-surface`, for places CSS cannot reach: the PNG fill and `theme-color`. */
export const THEME_SURFACES: Record<Theme, string> = {
	neon: '#0c1013',
	minimalist: '#f6f7f7',
	retro: '#1c1650',
	classic: '#0a0a0b',
	synthwave: '#1e1b4b',
	lightmile: '#f4f3ef'
};

export const CENTERED_AVATAR_THEMES: readonly Theme[] = ['classic', 'synthwave'];
