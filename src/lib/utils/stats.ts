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

    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
    const totalElevation = activities.reduce((sum, a) => sum + a.elevation, 0);

    // Calculate active days (unique dates)
    const uniqueDates = new Set(
        activities.map((a) => a.date.toISOString().split('T')[0])
    );
    const activeDays = uniqueDates.size;

    // Calculate longest streak
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

/**
 * Calculate the longest streak of consecutive days with activities
 */
export function calculateLongestStreak(activities: Activity[]): number {
    if (activities.length === 0) return 0;

    // Get unique sorted dates
    const uniqueDates = Array.from(
        new Set(activities.map((a) => a.date.toISOString().split('T')[0]))
    ).sort();

    if (uniqueDates.length === 0) return 0;
    if (uniqueDates.length === 1) return 1;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);

        // Check if dates are consecutive (difference of 1 day)
        const diffMs = currDate.getTime() - prevDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
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
