export interface DonutSegment {
	/** Fraction of the total, between 0 and 1. */
	share: number;
	/** Arc length already taken by the earlier segments. */
	offset: number;
}

/**
 * Indices of the `count` largest positive values, largest first, plus any value tied with the
 * last one picked. Ties keep the earlier index first.
 */
export function topIndices(values: readonly number[], count: number): number[] {
	const ranked = values
		.map((value, idx) => ({ value, idx }))
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);
	const threshold = ranked[Math.min(count, ranked.length) - 1]?.value ?? Infinity;

	return ranked.filter((item) => item.value >= threshold).map((item) => item.idx);
}

/**
 * Height of a bar scaled against the largest value, never below `minHeight`.
 */
export function scaledBarHeight(
	value: number,
	max: number,
	containerHeight: number,
	minHeight: number
): number {
	const heightPercent = (value / max) * 100;
	return Math.max((heightPercent / 100) * containerHeight, minHeight);
}

/**
 * Splits a donut of the given circumference into one segment per value, in order.
 */
export function donutSegments(values: readonly number[], circumference: number): DonutSegment[] {
	const total = values.reduce((sum, value) => sum + value, 0);
	let offset = 0;

	return values.map((value) => {
		const segment = { share: value / total, offset };
		offset += (value / total) * circumference;
		return segment;
	});
}
