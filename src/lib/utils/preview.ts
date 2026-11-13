import {
	PREVIEW_CHROME_HEIGHT,
	PREVIEW_DESKTOP_PADDING,
	PREVIEW_MAX_SCALE,
	PREVIEW_MAX_WIDTH,
	PREVIEW_MIN_WIDTH,
	PREVIEW_MOBILE_BREAKPOINT,
	PREVIEW_MOBILE_PADDING,
	PREVIEW_STACKED_HEIGHT_SHARE
} from '#lib/constants/preview.js';

export interface PreviewViewport {
	width: number;
	height: number;
	/** The preview sits beside the controls rather than above them. */
	twoColumn: boolean;
}

/** Scale that fits a card into the on-screen preview for this viewport. */
export function getPreviewScale(
	viewport: PreviewViewport,
	card: { width: number; height: number }
): number {
	const padding =
		viewport.width < PREVIEW_MOBILE_BREAKPOINT ? PREVIEW_MOBILE_PADDING : PREVIEW_DESKTOP_PADDING;
	const availableWidth = Math.min(viewport.width - padding, PREVIEW_MAX_WIDTH);
	const availableHeight = viewport.twoColumn
		? viewport.height - PREVIEW_CHROME_HEIGHT
		: viewport.height * PREVIEW_STACKED_HEIGHT_SHARE;
	const fitToWidth = Math.min(PREVIEW_MAX_SCALE, availableWidth / card.width);
	const fitToHeight = Math.max(PREVIEW_MIN_WIDTH / card.width, availableHeight / card.height);
	return Math.min(fitToWidth, fitToHeight);
}
