import type { SportBreakdown } from '#lib/types/index.js';
import { ONE_HOUR_IN_SECONDS } from '../constants/time.js';

/** Sums the given entries into one "other" entry. */
export function mergeIntoOther(sports: SportBreakdown[]): SportBreakdown {
	return sports.reduce<SportBreakdown>(
		(sum, s) => ({
			type: 'other',
			distance: sum.distance + s.distance,
			duration: sum.duration + s.duration,
			count: sum.count + s.count
		}),
		{ type: 'other', distance: 0, duration: 0, count: 0 }
	);
}

/**
 * Folds sports with less than 1 hour of total duration into an "other" category, unless that
 * would fold a single sport or leave no named sport.
 */
export function consolidateBreakdown(breakdown: SportBreakdown[]): SportBreakdown[] {
	const named = breakdown.filter((s) => s.type !== 'other');
	const minor = named.filter((s) => s.duration < ONE_HOUR_IN_SECONDS);
	const folded = minor.length > 1 && minor.length < named.length ? minor : [];

	const kept = named.filter((s) => !folded.includes(s)).map((s) => ({ ...s }));
	const other = mergeIntoOther([...breakdown.filter((s) => s.type === 'other'), ...folded]);

	return other.count > 0 ? [...kept, other] : kept;
}
