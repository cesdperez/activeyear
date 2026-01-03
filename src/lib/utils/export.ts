import { toPng } from 'html-to-image';
import type { Theme } from '$lib/types/index.js';

export interface ExportOptions {
    filename?: string;
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
export async function exportToPng(
    element: HTMLElement,
    options: ExportOptions = {}
): Promise<void> {
    const { filename = 'activeyear-2025', scale = 2, backgroundColor = THEME_BACKGROUNDS.neon } = options;

    try {
        const dataUrl = await toPng(element, {
            // High quality settings
            pixelRatio: scale,
            style: {
                'text-rendering': 'geometricPrecision',
                '-webkit-font-smoothing': 'antialiased',
                '-moz-osx-font-smoothing': 'grayscale'
            } as any,
            // Ensure background is captured
            backgroundColor,
            // Proper font handling
            fontEmbedCSS: '@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap");',
            cacheBust: true,
            // Skip elements that shouldn't be in export
            filter: (node) => {
                // Skip hidden elements
                if (node instanceof HTMLElement && node.dataset.exportIgnore) {
                    return false;
                }
                return true;
            },
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Failed to export image:', error);
        throw new Error('Failed to generate image. Please try again.');
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
