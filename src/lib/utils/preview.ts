import {
	PREVIEW_DESKTOP_PADDING,
	PREVIEW_MAX_SCALE,
	PREVIEW_MAX_WIDTH,
	PREVIEW_MOBILE_BREAKPOINT,
	PREVIEW_MOBILE_PADDING
} from '#lib/constants/preview.js';

/** Scale that fits a card of `cardWidth` into the on-screen preview for this viewport. */
export function getPreviewScale(viewportWidth: number, cardWidth: number): number {
	const padding =
		viewportWidth < PREVIEW_MOBILE_BREAKPOINT ? PREVIEW_MOBILE_PADDING : PREVIEW_DESKTOP_PADDING;
	const availableWidth = Math.min(viewportWidth - padding, PREVIEW_MAX_WIDTH);
	return Math.min(PREVIEW_MAX_SCALE, availableWidth / cardWidth);
}
