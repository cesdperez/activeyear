import { GARMIN_PAGE_SIZE } from '#lib/constants/parsing.js';
import type { ParseResult } from '#lib/types/index.js';

/** Returns the earliest activity date if the Garmin export may be cut short, otherwise null. */
export function cutShortFrom(result: ParseResult, year: number): Date | null {
	if (
		result.source !== 'garmin' ||
		result.rowCount <= 0 ||
		result.rowCount % GARMIN_PAGE_SIZE !== 0 ||
		result.yearsInFile.some((value) => value < year)
	)
		return null;
	const dates = result.activities
		.map((activity) => activity.date)
		.filter((date) => date.getFullYear() === year);
	if (dates.length === 0) return null;
	const earliest = dates.reduce((a, b) => (a < b ? a : b));
	return earliest.getMonth() > 0 || earliest.getDate() > 14 ? earliest : null;
}
