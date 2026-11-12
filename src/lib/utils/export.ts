import { domToPng } from 'modern-screenshot';
import type { Theme } from '#lib/types/index.js';
import { NAME_FONT_SIZE, NAME_LONG_AFTER_CHARS, TIMELINE_GAP } from '#lib/constants/export.js';
import { inlinedFontFaceCss } from './fonts.js';

export interface ExportOptions {
	filename: string;
	backgroundColor?: string;
	/** Export even when the app fonts cannot be embedded, letting the image fall back. */
	allowFallbackFonts?: boolean;
}

const THEME_BACKGROUNDS: Record<Theme, string> = {
	neon: '#0a0a0b',
	minimalist: '#fdfdfd',
	retro: '#1e1b4b'
};

/**
 * Export an HTML element to PNG and trigger download
 */
export async function exportToPng(element: HTMLElement, options: ExportOptions): Promise<void> {
	const {
		filename,
		backgroundColor = THEME_BACKGROUNDS.neon,
		allowFallbackFonts = false
	} = options;

	// Left to itself, modern-screenshot refetches every font file and silently skips failures.
	const fontCss = await inlinedFontFaceCss().catch((error) => {
		if (allowFallbackFonts) return undefined;
		throw error;
	});

	try {
		const dataUrl = await domToPng(element, {
			// The preview applies a CSS scale transform; size from layout, not the scaled rect.
			width: element.offsetWidth,
			height: element.offsetHeight,
			scale: 1,
			style: { textRendering: 'geometricPrecision' },
			backgroundColor,
			font: fontCss ? { cssText: fontCss } : undefined,
			filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore),
			onCloneEachNode: keepLineClamp
		});

		// Create download link
		const link = document.createElement('a');
		link.download = `${filename}.png`;
		link.href = dataUrl;
		link.click();
	} catch (error) {
		console.error('Failed to export image:', error);
		throw new Error('Failed to generate image. Please try again.', { cause: error });
	}
}

// Chrome computes a line-clamped box as display: flow-root, and that copied inline style turns the clamp and its ellipsis off.
function keepLineClamp(cloned: Node): void {
	if (cloned.nodeType !== Node.ELEMENT_NODE) return;
	const { style } = cloned as HTMLElement;
	const clamp = style?.getPropertyValue('-webkit-line-clamp');
	if (clamp && clamp !== 'none') style.setProperty('display', '-webkit-box');
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
	return name ? `${name.toLowerCase().replace(/\s+/g, '-')}-${year}` : `activeyear-${year}`;
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

export function getThemeBackgroundColor(theme: Theme): string {
	return THEME_BACKGROUNDS[theme];
}
