import {
	APP_FONT_SAMPLE_TEXT,
	APP_FONT_SPECS,
	FONTS_UNAVAILABLE_MESSAGE
} from '#lib/constants/fonts.js';

/**
 * Loads every app font face, so the files sit in the HTTP cache before the export needs them
 * offline. Rejects with a user-facing message when a face cannot load.
 */
export async function loadAppFonts(): Promise<void> {
	const results = await Promise.allSettled(
		APP_FONT_SPECS.map((spec) => document.fonts.load(spec, APP_FONT_SAMPLE_TEXT))
	);
	const loaded = results.every(
		(r) =>
			r.status === 'fulfilled' && r.value.length > 0 && r.value.every((f) => f.status === 'loaded')
	);
	if (!loaded) throw new Error(FONTS_UNAVAILABLE_MESSAGE);
}
