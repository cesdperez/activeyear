import { i18n } from '#lib/i18n/i18n.svelte.js';
import { domToPng } from 'modern-screenshot';
import type { Theme } from '#lib/types/index.js';
import { THEME_SURFACES } from '#lib/constants/themes.js';
import { NAME_FONT_SIZE, NAME_LONG_AFTER_CHARS, TIMELINE_GAP } from '#lib/constants/export.js';
import { inlinedFontFaceCss } from './fonts.js';
import { flipShadowY } from './shadow.js';

export interface ExportOptions {
	filename: string;
	theme: Theme;
	/** Export even when the app fonts cannot be embedded, letting the image fall back. */
	allowFallbackFonts?: boolean;
}

/**
 * Export an HTML element to PNG and trigger download
 */
export async function exportToPng(element: HTMLElement, options: ExportOptions): Promise<void> {
	const { filename, theme, allowFallbackFonts = false } = options;

	// Left to itself, modern-screenshot refetches every font file and silently skips failures.
	const fontCss = await inlinedFontFaceCss(theme).catch((error) => {
		if (allowFallbackFonts) return undefined;
		throw error;
	});

	const flipShadows = await foreignObjectFlipsShadows();

	try {
		const dataUrl = await domToPng(element, {
			// The preview applies a CSS scale transform; size from layout, not the scaled rect.
			width: element.offsetWidth,
			height: element.offsetHeight,
			scale: 1,
			style: { textRendering: 'geometricPrecision' },
			backgroundColor: THEME_SURFACES[theme],
			font: fontCss ? { cssText: fontCss } : undefined,
			filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore),
			onCloneEachNode: (cloned) => {
				keepLineClamp(cloned);
				if (flipShadows) flipShadowsOf(cloned);
			}
		});

		// Create download link
		const link = document.createElement('a');
		link.download = `${filename}.png`;
		link.href = dataUrl;
		link.click();
	} catch (error) {
		console.error('Failed to export image:', error);
		throw new Error(i18n.m.export.filenameError, { cause: error });
	}
}

// Chrome computes a line-clamped box as display: flow-root, and that copied inline style turns the clamp and its ellipsis off.
function keepLineClamp(cloned: Node): void {
	if (cloned.nodeType !== Node.ELEMENT_NODE) return;
	const { style } = cloned as HTMLElement;
	const clamp = style?.getPropertyValue('-webkit-line-clamp');
	if (clamp && clamp !== 'none') style.setProperty('display', '-webkit-box');
}

let shadowProbe: Promise<boolean> | undefined;

// WebKit draws shadow offsets upside down inside an SVG foreignObject, which modern-screenshot renders through.
function foreignObjectFlipsShadows(): Promise<boolean> {
	shadowProbe ??= shadowLandsAbove().catch(() => false);
	return shadowProbe;
}

// A box 6-14px down with a 4px shadow; WebKit draws no shadow for a box without a background.
async function shadowLandsAbove(): Promise<boolean> {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="20"><foreignObject width="8" height="20"><div xmlns="http://www.w3.org/1999/xhtml" style="margin-top:6px;height:8px;background:#000;box-shadow:0 4px #000"></div></foreignObject></svg>`;
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await image.decode();
	const canvas = document.createElement('canvas');
	canvas.width = 8;
	canvas.height = 20;
	const context = canvas.getContext('2d', { willReadFrequently: true });
	if (!context) return false;
	context.drawImage(image, 0, 0);
	const alphaAt = (y: number) => context.getImageData(4, y, 1, 1).data[3];
	return alphaAt(3) > 0 && alphaAt(16) === 0;
}

function flipShadowsOf(cloned: Node): void {
	if (cloned.nodeType !== Node.ELEMENT_NODE) return;
	const { style } = cloned as HTMLElement;
	if (!style) return;
	for (const property of ['box-shadow', 'text-shadow']) {
		const value = style.getPropertyValue(property);
		if (value) style.setProperty(property, flipShadowY(value), style.getPropertyPriority(property));
	}
}

/**
 * Get dimensions for a given aspect ratio
 * Base width is 1080px (standard for social media)
 */
export function getExportDimensions(): {
	width: number;
	height: number;
} {
	const baseWidth = 1080;
	return { width: baseWidth, height: Math.round((baseWidth * 16) / 9) };
}

/** File name stem for the downloaded cards. `name` must already be trimmed. */
export function exportFileStem(name: string, year: number): string {
	const safeName = name
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${safeName || 'activeyear'}-${year}`;
}

export function nameFontSize(name: string): number {
	return name.length > NAME_LONG_AFTER_CHARS ? NAME_FONT_SIZE.long : NAME_FONT_SIZE.short;
}

/** Gap between timeline items so they spread over `available` height, within sensible bounds. */
export function timelineGap(available: number, itemsHeight: number, count: number): number {
	if (count < 2) return TIMELINE_GAP.min;
	const gap = (available - itemsHeight) / (count - 1);
	return Math.min(TIMELINE_GAP.max, Math.max(TIMELINE_GAP.min, gap));
}
