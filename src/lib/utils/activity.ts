import type { SportBreakdown } from '#lib/types/index.js';
import { ONE_HOUR_IN_SECONDS } from '../constants/time.js';

/** Sums the given entries into one "other" entry, flagged as a roll-up when it holds named sports. */
export function mergeIntoOther(sports: SportBreakdown[]): SportBreakdown {
	const other: SportBreakdown = sports.reduce<SportBreakdown>(
		(sum, s) => ({
			type: 'other',
			distance: sum.distance + s.distance,
			duration: sum.duration + s.duration,
			count: sum.count + s.count
		}),
		{ type: 'other', distance: 0, duration: 0, count: 0 }
	);
	return sports.some((s) => s.type !== 'other' || s.rollup) ? { ...other, rollup: true } : other;
}

function outranks(entry: SportBreakdown, sports: SportBreakdown[]): boolean {
	return sports.some((s) => entry.count > s.count || entry.duration > s.duration);
}

/**
 * Folds the smallest sports with less than 1 hour of total duration into an "other" category,
 * while the folded part stays no bigger than any named sport it leaves, and never a single sport
 * alone. Garmin's own Other is kept whatever its size.
 */
export function consolidateBreakdown(breakdown: SportBreakdown[]): SportBreakdown[] {
	const named = breakdown.filter((s) => s.type !== 'other');
	const existingOther = breakdown.filter((s) => s.type === 'other');
	const minor = named
		.filter((s) => s.duration < ONE_HOUR_IN_SECONDS)
		.sort((a, b) => a.duration - b.duration || a.count - b.count);

	let folded: SportBreakdown[] = [];
	for (const sport of minor) {
		const next = [...folded, sport];
		const kept = named.filter((s) => !next.includes(s));
		if (kept.length === 0 || outranks(mergeIntoOther(next), kept)) break;
		folded = next;
	}
	if (folded.length < 2) folded = [];

	const kept = named.filter((s) => !folded.includes(s)).map((s) => ({ ...s }));
	const other = mergeIntoOther([...existingOther, ...folded]);

	return other.count > 0 ? [...kept, other] : kept;
}
