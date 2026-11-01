import { domToPng } from 'modern-screenshot';
import type { Theme } from '#lib/types/index.js';

export interface ExportOptions {
	filename: string;
	scale?: number;
	backgroundColor?: string;
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
	const { filename, scale = 2, backgroundColor = THEME_BACKGROUNDS.neon } = options;

	try {
		const dataUrl = await domToPng(element, {
			// The preview applies a CSS scale transform; size from layout, not the scaled rect.
			width: element.offsetWidth,
			height: element.offsetHeight,
			scale,
			style: { textRendering: 'geometricPrecision' },
			backgroundColor,
			// No font.preferredFormat: modern-screenshot 4.7 then drops the src of every other @font-face.
			filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore)
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

export function getThemeBackgroundColor(theme: Theme): string {
	return THEME_BACKGROUNDS[theme];
}
