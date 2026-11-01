import type { BreakdownMetric, SportBreakdown, WeeklyPattern } from '#lib/types/index.js';
import {
	DONUT_SEGMENT_GAP,
	MIN_WEEKLY_BAR_HEIGHT,
	TOP_DAYS_COUNT,
	TOP_SPORTS_LIMIT
} from '#lib/constants/breakdown.js';
import { DAYS_IN_YEAR } from '#lib/constants/time.js';
import { consolidateBreakdown } from './activity.js';
import { donutSegments, scaledBarHeight, topIndices } from './charts.js';

export interface SportDonutSegment {
	dashArray: string;
	offset: number;
}

export interface WeeklyBar {
	heightPercent: number;
	barHeight: number;
	isTopDay: boolean;
}

export function rankSports(breakdown: SportBreakdown[], metric: BreakdownMetric): SportBreakdown[] {
	return consolidateBreakdown(breakdown).sort((a, b) => b[metric] - a[metric]);
}

export function selectTopSports(
	breakdown: SportBreakdown[],
	metric: BreakdownMetric
): SportBreakdown[] {
	return rankSports(breakdown, metric).slice(0, TOP_SPORTS_LIMIT);
}

/** Donut segments sized by activity count, each starting where the previous one ends. */
export function sportDonutSegments(
	sports: SportBreakdown[],
	circumference: number
): SportDonutSegment[] {
	return donutSegments(
		sports.map((s) => s.count),
		circumference
	).map(({ share, offset }) => ({
		dashArray: `${share * circumference - DONUT_SEGMENT_GAP} ${circumference}`,
		offset
	}));
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

export function activeDaysPercent(activeDays: number): number {
	return Math.min((activeDays / DAYS_IN_YEAR) * 100, 100);
}
