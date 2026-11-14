import type { Locale, SummaryMetric, Unit, YearStats } from '#lib/types/index.js';
import { messages } from '#lib/i18n/messages/index.js';
import {
	formatCalories,
	formatDistance,
	formatDuration,
	formatEarthLaps,
	formatElevation,
	formatEverests,
	formatLotRMarathons,
	formatPizzaSlices
} from './format.js';

export interface TotalStat {
	id: SummaryMetric;
	label: string;
	total: number;
	value: string;
	funFact: string;
	/** Formats any amount of this stat, so a count-up shows the same units as the total. */
	format: (amount: number) => string;
}

/** Size of a unit ("km", "h") against its number, for each place a total is drawn. */
export const UNIT_SCALE = {
	dashboardHeadline: 0.42,
	cardHeadline: 0.38,
	board: 0.6
} as const;

export interface ValuePart {
	number: string;
	unit: string;
}

export function totalStats(locale: Locale, stats: YearStats, unit: Unit): TotalStat[] {
	const labels = messages(locale).dashboard;
	const stat = (
		id: SummaryMetric,
		label: string,
		total: number,
		format: (amount: number) => string,
		funFact: string
	): TotalStat => ({ id, label, total, value: format(total), funFact, format });

	return [
		stat(
			'distance',
			labels.totalDistance,
			stats.totalDistance,
			(km) => formatDistance(locale, km, unit),
			formatEarthLaps(locale, stats.totalDistance)
		),
		stat(
			'elevation',
			labels.elevationGained,
			stats.totalElevation,
			(m) => formatElevation(locale, m, unit),
			formatEverests(locale, stats.totalElevation)
		),
		stat(
			'duration',
			labels.timeActive,
			stats.totalDuration,
			(seconds) => formatDuration(locale, seconds),
			formatLotRMarathons(locale, stats.totalDuration)
		),
		stat(
			'calories',
			labels.caloriesBurned,
			stats.totalCalories,
			(calories) => formatCalories(locale, calories),
			formatPizzaSlices(locale, stats.totalCalories)
		)
	];
}

/**
 * Width of `value` in characters once each unit is set at `unitScale` of the number size,
 * for sizing a value whose units are drawn smaller.
 */
export function scaledLength(value: string, unitScale: number): number {
	const parts = splitUnits(value);
	const units = parts.reduce((sum, part) => sum + part.unit.length, 0);
	return value.length - units + units * unitScale;
}

/** "150h 30m" as [150, h] and [30, m], so units can be set smaller than their numbers. */
export function splitUnits(value: string): ValuePart[] {
	// Some locales group thousands with a no-break or narrow no-break space, which \s also matches.
	return [...value.matchAll(/(\d[\d.,\u00a0\u202f]*)([^\d\s]*)/g)].map(([, number, unit]) => ({
		number,
		unit
	}));
}
