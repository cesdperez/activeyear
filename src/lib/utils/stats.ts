import type {
	Activity,
	ActivityType,
	PersonalRecord,
	PersonalRecords,
	SportBreakdown,
	WeeklyPattern,
	YearStats
} from '../types/index.js';

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

/**
 * Calculate the longest streak of consecutive days with activities
 */
export function calculateLongestStreak(activities: Activity[]): number {
	if (activities.length === 0) return 0;

	const days = Array.from(new Set(activities.map((a) => localDayNumber(a.date)))).sort(
		(a, b) => a - b
	);

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
		// JavaScript getDay() returns 0 for Sunday, 1 for Monday, etc.
		// We want Monday = 0, Sunday = 6
		const jsDay = activity.date.getDay();
		const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
		pattern[dayIndex]++;
	}

	return pattern;
}
