import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
import type {
	Activity,
	ActivitySource,
	ActivityBreak,
	QuarterTotals,
	SportAverage,
	WeekdayTotals,
	ActivityType,
	PersonalRecord,
	PersonalRecords,
	SportBreakdown,
	SummaryMetric,
	Unit,
	WeeklyPattern,
	YearStats
} from '../types/index.js';
import {
	formatCalories,
	formatDistance,
	formatDuration,
	formatElevation,
	showsValue
} from './format.js';

/**
 * Calculate aggregate year stats from activities
 */
export function calculateYearStats(activities: Activity[]): YearStats {
	if (activities.length === 0) {
		return {
			totalDistance: 0,
			totalDuration: 0,
			totalCalories: 0,
			totalElevation: 0,
			activeDays: 0,
			longestStreak: 0,
			activityCount: 0
		};
	}

	let totalDistance = 0;
	let totalDuration = 0;
	let totalCalories = 0;
	let totalElevation = 0;
	const uniqueDays = new Set<number>();

	for (const a of activities) {
		totalDistance += a.distance;
		totalDuration += a.duration;
		totalCalories += a.calories;
		totalElevation += a.elevation;
		uniqueDays.add(localDayNumber(a.date));
	}

	const activeDays = uniqueDays.size;
	const longestStreak = calculateLongestStreak(activities);

	return {
		totalDistance,
		totalDuration,
		totalCalories,
		totalElevation,
		activeDays,
		longestStreak,
		activityCount: activities.length
	};
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Dates hold the CSV's local wall-clock time, so the day is the local calendar date.
// Date.UTC keeps consecutive dates exactly one apart across DST changes.
function localDayNumber(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

function sortedActiveDays(activities: Activity[]): number[] {
	return Array.from(new Set(activities.map((activity) => localDayNumber(activity.date)))).sort(
		(a, b) => a - b
	);
}

/**
 * Calculate the longest streak of consecutive days with activities
 */
export function calculateLongestStreak(activities: Activity[]): number {
	if (activities.length === 0) return 0;

	const days = sortedActiveDays(activities);

	let maxStreak = 1;
	let currentStreak = 1;

	for (let i = 1; i < days.length; i++) {
		currentStreak = days[i] - days[i - 1] === 1 ? currentStreak + 1 : 1;
		maxStreak = Math.max(maxStreak, currentStreak);
	}

	return maxStreak;
}

/**
 * Calculate personal records from activities
 */
export function calculatePersonalRecords(activities: Activity[]): PersonalRecords {
	if (activities.length === 0) {
		return {
			longestDistance: null,
			longestDuration: null,
			biggestBurn: null
		};
	}

	let longestDistance: PersonalRecord | null = null;
	let longestDuration: PersonalRecord | null = null;
	let biggestBurn: PersonalRecord | null = null;

	for (const activity of activities) {
		if (activity.distance > 0) {
			if (!longestDistance || activity.distance > longestDistance.value) {
				longestDistance = { value: activity.distance, activity };
			}
		}

		if (activity.duration > 0) {
			if (!longestDuration || activity.duration > longestDuration.value) {
				longestDuration = { value: activity.duration, activity };
			}
		}

		if (activity.calories > 0) {
			if (!biggestBurn || activity.calories > biggestBurn.value) {
				biggestBurn = { value: activity.calories, activity };
			}
		}
	}

	return { longestDistance, longestDuration, biggestBurn };
}

/**
 * Calculate breakdown by sport type
 */
export function calculateSportBreakdown(activities: Activity[]): SportBreakdown[] {
	const breakdownMap = new Map<ActivityType, SportBreakdown>();

	for (const activity of activities) {
		const existing = breakdownMap.get(activity.type);
		if (existing) {
			existing.distance += activity.distance;
			existing.duration += activity.duration;
			existing.count += 1;
		} else {
			breakdownMap.set(activity.type, {
				type: activity.type,
				distance: activity.distance,
				duration: activity.duration,
				count: 1
			});
		}
	}

	// Sort by count descending
	return Array.from(breakdownMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Calculate weekly activity pattern (count per day of week)
 * Returns an array of 7 numbers: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 */
export function calculateWeeklyPattern(activities: Activity[]): WeeklyPattern {
	const pattern: WeeklyPattern = [0, 0, 0, 0, 0, 0, 0];

	for (const activity of activities) {
		pattern[mondayFirstDayIndex(activity.date)]++;
	}

	return pattern;
}

const SUMMARY_METRIC_DISPLAY: [SummaryMetric, (stats: YearStats, unit: Unit) => string][] = [
	['distance', (stats, unit) => formatDistance('en', stats.totalDistance, unit)],
	['elevation', (stats, unit) => formatElevation('en', stats.totalElevation, unit)],
	['duration', (stats) => formatDuration('en', stats.totalDuration)],
	['calories', (stats) => formatCalories('en', stats.totalCalories)]
];

/**
 * Keeps `current` when it displays a non-zero value, otherwise the first summary stat, in panel
 * order, that does.
 */
export function summaryMetricWithValue(
	stats: YearStats,
	current: SummaryMetric,
	unit: Unit
): SummaryMetric {
	const withValue = SUMMARY_METRIC_DISPLAY.filter(([, display]) =>
		showsValue(display(stats, unit))
	).map(([metric]) => metric);
	return withValue.includes(current) ? current : (withValue[0] ?? current);
}

export function selectHighlights(
	activities: Activity[],
	source: ActivitySource | null
): Activity[] {
	const byDate = (a: Activity, b: Activity) => a.date.getTime() - b.date.getTime();
	const selected =
		source === 'strava'
			? [...activities]
					.sort((a, b) => b.duration - a.duration || byDate(a, b))
					.slice(0, HIGHLIGHTS_LIMIT)
			: activities.filter((activity) => activity.favorite);
	return selected.sort(byDate);
}

function mondayFirstDayIndex(date: Date): number {
	return (date.getDay() + 6) % 7;
}

export function calculateQuarterTotals(activities: Activity[]): QuarterTotals[] {
	const totals: QuarterTotals[] = ([1, 2, 3, 4] as const).map((quarter) => ({
		quarter,
		distance: 0,
		duration: 0,
		count: 0
	}));
	for (const activity of activities) {
		const quarter = totals[Math.floor(activity.date.getMonth() / 3)];
		quarter.distance += activity.distance;
		quarter.duration += activity.duration;
		quarter.count++;
	}
	return totals;
}

export function calculateLongestBreak(activities: Activity[]): ActivityBreak | null {
	const days = sortedActiveDays(activities);
	let longest: ActivityBreak | null = null;
	for (let i = 1; i < days.length; i++) {
		const gap = days[i] - days[i - 1] - 1;
		if (gap > (longest?.days ?? 0)) {
			longest = {
				days: gap,
				start: localDateFromDayNumber(days[i - 1] + 1),
				end: localDateFromDayNumber(days[i] - 1)
			};
		}
	}
	return longest;
}

function localDateFromDayNumber(day: number): Date {
	const utc = new Date(day * MS_PER_DAY);
	return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function calculateWeekdayTotals(activities: Activity[]): WeekdayTotals {
	const totals: WeekdayTotals = {
		distance: [0, 0, 0, 0, 0, 0, 0],
		duration: [0, 0, 0, 0, 0, 0, 0]
	};
	for (const activity of activities) {
		const day = mondayFirstDayIndex(activity.date);
		totals.distance[day] += activity.distance;
		totals.duration[day] += activity.duration;
	}
	return totals;
}

export function calculateSportAverages(breakdown: SportBreakdown[]): SportAverage[] {
	return breakdown
		.filter((sport) => sport.count !== 0)
		.map((sport) => ({
			type: sport.type,
			count: sport.count,
			averageDistance: sport.distance / sport.count,
			averageDuration: sport.duration / sport.count
		}));
}
