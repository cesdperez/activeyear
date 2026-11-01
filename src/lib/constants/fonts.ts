/** Every face imported in the root layout, as `document.fonts.load` specs. */
export const APP_FONT_SPECS = [
	...[400, 500, 600, 700, 800, 900].map((weight) => `${weight} 16px Outfit`),
	...[500, 700].map((weight) => `${weight} 16px "JetBrains Mono"`)
];

/** Covers the latin and latin-ext unicode ranges, so both subsets of each face load. */
export const APP_FONT_SAMPLE_TEXT = 'Aa1 ĀāŁłŐő';

export const FONTS_UNAVAILABLE_MESSAGE =
	'Fonts could not load. Reconnect, reload the page and try again.';
