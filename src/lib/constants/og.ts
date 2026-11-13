// A .ts import because scripts/og-image.ts loads this file in node, which does not map .js to .ts.
import { DEFAULT_LOCALE } from './locales.ts';
import type { Locale } from '#lib/types/index.js';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** The social preview image for a locale, relative to the site root. */
export function ogImageFile(locale: Locale): string {
	return locale === DEFAULT_LOCALE ? 'og-image.png' : `og-image-${locale}.png`;
}
