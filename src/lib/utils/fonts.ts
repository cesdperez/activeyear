import {
	APP_FONT_FAMILIES,
	FONTS_UNAVAILABLE_MESSAGE,
	THEME_FONT_FAMILIES
} from '#lib/constants/fonts.js';
import type { Theme } from '#lib/types/index.js';

export class FontsUnavailableError extends Error {
	readonly type = 'fonts-unavailable';

	constructor(options?: ErrorOptions) {
		super(FONTS_UNAVAILABLE_MESSAGE, options);
	}
}

/**
 * Loads every app font face, so the dashboard keeps its fonts offline. Rejects with a
 * FontsUnavailableError when a face cannot load.
 */
export async function loadAppFonts(): Promise<void> {
	// Each face on its own: a subset file without unicode-range claims every code point, so
	// document.fonts.load() would load only the last such face of a weight.
	const faces = [...document.fonts].filter((face) =>
		APP_FONT_FAMILIES.includes(face.family.replace(/["']/g, ''))
	);
	const results = await Promise.allSettled(faces.map((face) => face.load()));
	if (faces.length === 0 || results.some((r) => r.status === 'rejected')) {
		throw new FontsUnavailableError();
	}
}

const inlinedFontCss = new Map<Theme, Promise<string>>();

/** Inlines the theme's font files. Failed fetches are retried on the next call. */
export function inlinedFontFaceCss(theme: Theme): Promise<string> {
	let css = inlinedFontCss.get(theme);
	if (!css) {
		css = Promise.all(
			appFontFaces()
				.filter((rule) =>
					THEME_FONT_FAMILIES[theme].includes(
						rule.style.getPropertyValue('font-family').replace(/["']/g, '')
					)
				)
				.map(inlineFontFace)
		)
			.then((faces) => faces.join('\n'))
			.catch((error) => {
				inlinedFontCss.delete(theme);
				throw new FontsUnavailableError({ cause: error });
			});
		inlinedFontCss.set(theme, css);
	}
	return css;
}

function appFontFaces(): CSSFontFaceRule[] {
	return [...document.styleSheets].flatMap((sheet) => fontFaceRules(sheet.cssRules));
}

function fontFaceRules(rules: CSSRuleList): CSSFontFaceRule[] {
	return [...rules].flatMap((rule) => {
		if (rule instanceof CSSFontFaceRule) return [rule];
		return rule instanceof CSSGroupingRule ? fontFaceRules(rule.cssRules) : [];
	});
}

async function inlineFontFace(rule: CSSFontFaceRule): Promise<string> {
	const { style } = rule;
	const file = firstFontUrl(style.getPropertyValue('src'), rule.parentStyleSheet?.href);
	const dataUrl = await fetchAsDataUrl(file);
	const descriptors = ['font-family', 'font-style', 'font-weight', 'unicode-range']
		.filter((name) => style.getPropertyValue(name))
		.map((name) => `${name}: ${style.getPropertyValue(name)};`)
		.join(' ');
	return `@font-face { ${descriptors} src: url("${dataUrl}"); }`;
}

// The first source is the woff2 file the browser itself picks.
function firstFontUrl(src: string, sheetHref: string | null | undefined): string {
	const url = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(src)?.[1];
	if (!url) throw new Error(`No font file in src: ${src}`);
	return new URL(url, sheetHref ?? document.baseURI).href;
}

async function fetchAsDataUrl(url: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Font request failed: ${response.status} ${url}`);
	const blob = await response.blob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}
