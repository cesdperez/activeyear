import type { Theme } from '#lib/types/index.js';

export const THEME_FONT_FAMILIES: Record<Theme, readonly string[]> = {
	neon: ['Big Shoulders Display', 'Archivo'],
	minimalist: ['Big Shoulders Display', 'Archivo'],
	retro: ['Press Start 2P', 'VT323', 'Big Shoulders Display'],
	classic: ['Outfit', 'Big Shoulders Display'],
	synthwave: ['Outfit', 'Big Shoulders Display'],
	lightmile: ['Archivo', 'Geist Mono']
};

export const APP_FONT_FAMILIES = [...new Set(Object.values(THEME_FONT_FAMILIES).flat())];

export const FONTS_UNAVAILABLE_MESSAGE =
	'The card fonts could not be loaded, so the images would use fallback fonts.';
