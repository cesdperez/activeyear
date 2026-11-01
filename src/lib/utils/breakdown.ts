import type {
	BreakdownMetric,
	SportBreakdown,
	WeeklyPattern,
	WidgetVariant
} from '#lib/types/index.js';
import {
	DONUT_SEGMENT_GAP,
	MIN_WEEKLY_BAR_HEIGHT,
	TOP_DAYS_COUNT,
	TOP_SPORTS_LIMIT
} from '#lib/constants/breakdown.js';
import { OTHER_SPORT_COLOR, sportColors } from '#lib/constants/sports.js';
import { ONE_HOUR_IN_SECONDS } from '#lib/constants/time.js';
import { consolidateBreakdown, mergeIntoOther } from './activity.js';
import { donutSegments, scaledBarHeight, topIndices } from './charts.js';
import { daysInYear } from './date.js';
import { pluralize } from './format.js';

export interface SportDonutSegment {
	dashArray: string;
	offset: number;
	color: string;
}

export interface DonutCentre {
	value: string;
	label: string;
}

export interface WeeklyBar {
	heightPercent: number;
	barHeight: number;
	isTopDay: boolean;
}

export function rankSports(breakdown: SportBreakdown[], metric: BreakdownMetric): SportBreakdown[] {
	return consolidateBreakdown(breakdown).sort((a, b) => b[metric] - a[metric]);
}

/**
 * The top sports by `metric`, at most `TOP_SPORTS_LIMIT` entries. Past the limit the rest are
 * folded into "other", so the entries still add up to the whole year.
 */
export function selectTopSports(
	breakdown: SportBreakdown[],
	metric: BreakdownMetric
): SportBreakdown[] {
	const ranked = rankSports(breakdown, metric);
	if (ranked.length <= TOP_SPORTS_LIMIT) return ranked;

	const named = ranked.filter((s) => s.type !== 'other');
	const kept = named.slice(0, TOP_SPORTS_LIMIT - 1);
	const other = mergeIntoOther(ranked.filter((s) => !kept.includes(s)));

	return [...kept, other].sort((a, b) => b[metric] - a[metric]);
}

/** One colour per sport, matching between the donut and the bars. "Other" is always neutral. */
export function sportColorsFor(sports: SportBreakdown[]): string[] {
	let named = 0;
	return sports.map((s) =>
		s.type === 'other' ? OTHER_SPORT_COLOR : sportColors[named++ % sportColors.length]
	);
}

/**
 * Donut segments sized by `metric`, each starting where the previous one ends.
 * Slices shorter than the gap are left out.
 */
export function sportDonutSegments(
	sports: SportBreakdown[],
	metric: BreakdownMetric,
	circumference: number,
	variant: WidgetVariant
): SportDonutSegment[] {
	const colors = sportColorsFor(sports);

	return donutSegments(
		sports.map((s) => s[metric]),
		circumference
	)
		.map(({ share, offset }, i) => ({
			length: share * circumference - DONUT_SEGMENT_GAP[variant],
			offset,
			color: colors[i]
		}))
		.filter(({ length }) => length > 0)
		.map(({ length, offset, color }) => ({
			dashArray: `${length} ${circumference}`,
			offset,
			color
		}));
}

/** The total the donut is split by, shown in its centre. */
export function donutCentre(sports: SportBreakdown[], metric: BreakdownMetric): DonutCentre {
	const total = sports.reduce((sum, s) => sum + s[metric], 0);

	if (metric === 'duration') {
		const hours = Math.round(total / ONE_HOUR_IN_SECONDS);
		return { value: hours.toLocaleString('en-US'), label: pluralize(hours, 'Hour', 'Hours') };
	}
	return {
		value: total.toLocaleString('en-US'),
		label: pluralize(total, 'Activity', 'Activities')
	};
}

/** Bar heights scaled to the busiest weekday, with the busiest days flagged. */
export function weeklyBars(pattern: WeeklyPattern, containerHeight: number): WeeklyBar[] {
	const maxDay = Math.max(...pattern, 1);
	const topDays = topIndices(pattern, TOP_DAYS_COUNT);

	return pattern.map((count, i) => ({
		heightPercent: (count / maxDay) * 100,
		barHeight: scaledBarHeight(count, maxDay, containerHeight, MIN_WEEKLY_BAR_HEIGHT),
		isTopDay: topDays.includes(i)
	}));
}

export function activeDaysPercent(activeDays: number, year: number): number {
	return Math.min((activeDays / daysInYear(year)) * 100, 100);
}
