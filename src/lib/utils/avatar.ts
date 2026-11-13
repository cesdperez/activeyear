/** Size that fits a `width` x `height` photo to a `maxShortSide` crop, never enlarging it. */
export function avatarSize(
	width: number,
	height: number,
	maxShortSide: number
): { width: number; height: number } {
	const ratio = Math.min(1, maxShortSide / Math.min(width, height));
	return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}
