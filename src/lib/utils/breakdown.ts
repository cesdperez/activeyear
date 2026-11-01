import type { BreakdownMetric, SportBreakdown, WeeklyPattern } from '#lib/types/index.js';
import {
    DONUT_SEGMENT_GAP,
    MIN_WEEKLY_BAR_HEIGHT,
    TOP_DAYS_COUNT,
    TOP_SPORTS_LIMIT,
} from '#lib/constants/breakdown.js';
import { DAYS_IN_YEAR } from '#lib/constants/time.js';
import { consolidateBreakdown } from './activity.js';

export interface DonutSegment {
    dashArray: string;
    offset: number;
}

export interface WeeklyBar {
    heightPercent: number;
    barHeight: number;
    isTopDay: boolean;
}

export function selectTopSports(
    breakdown: SportBreakdown[],
    metric: BreakdownMetric,
): SportBreakdown[] {
    return consolidateBreakdown(breakdown)
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, TOP_SPORTS_LIMIT);
}

/** Donut segments sized by activity count, each starting where the previous one ends. */
export function donutSegments(sports: SportBreakdown[], circumference: number): DonutSegment[] {
    const totalCount = sports.reduce((sum, s) => sum + s.count, 0);
    let offset = 0;

    return sports.map((sport) => {
        const share = sport.count / totalCount;
        const segment = {
            dashArray: `${share * circumference - DONUT_SEGMENT_GAP} ${circumference}`,
            offset,
        };
        offset += share * circumference;
        return segment;
    });
}

/** Bar heights scaled to the busiest weekday, with the busiest days flagged. */
export function weeklyBars(pattern: WeeklyPattern, containerHeight: number): WeeklyBar[] {
    const maxDay = Math.max(...pattern, 1);
    const topDays = pattern
        .map((count, idx) => ({ count, idx }))
        .sort((a, b) => b.count - a.count)
        .slice(0, TOP_DAYS_COUNT)
        .map((item) => item.idx);

    return pattern.map((count, i) => {
        const heightPercent = (count / maxDay) * 100;
        return {
            heightPercent,
            barHeight: Math.max((heightPercent / 100) * containerHeight, MIN_WEEKLY_BAR_HEIGHT),
            isTopDay: topDays.includes(i),
        };
    });
}

export function activeDaysPercent(activeDays: number): number {
    return Math.min((activeDays / DAYS_IN_YEAR) * 100, 100);
}
