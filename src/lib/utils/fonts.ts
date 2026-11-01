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

let inlinedFontCss: Promise<string> | undefined;

/**
 * The app's @font-face CSS with every font file inlined as a data URL, so an export makes no
 * font requests. Fetched once; a failed fetch rejects with a user-facing message and is retried
 * on the next call.
 */
export function inlinedFontFaceCss(): Promise<string> {
	inlinedFontCss ??= Promise.all(appFontFaces().map(inlineFontFace))
		.then((faces) => faces.join('\n'))
		.catch((error) => {
			inlinedFontCss = undefined;
			throw new Error(FONTS_UNAVAILABLE_MESSAGE, { cause: error });
		});
	return inlinedFontCss;
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
