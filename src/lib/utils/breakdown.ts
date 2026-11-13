import type { Locale } from '#lib/types/index.js';
import { MESSAGES } from '#lib/i18n/messages/index.js';
import type {
	ActivityType,
	BreakdownMetric,
	SportBreakdown,
	Theme,
	WeeklyPattern,
	WidgetVariant
} from '#lib/types/index.js';
import {
	DONUT_SEGMENT_GAP,
	MIN_WEEKLY_BAR_HEIGHT,
	TOP_DAYS_COUNT,
	TOP_SPORTS_LIMIT
} from '#lib/constants/breakdown.js';
import { ACTIVITY_TYPES, SPORT_PALETTES } from '#lib/constants/sports.js';
import { ONE_HOUR_IN_SECONDS, ONE_MINUTE_IN_SECONDS } from '#lib/constants/time.js';
import { consolidateBreakdown, mergeIntoOther } from './activity.js';
import { donutSegments, scaledBarHeight, topIndices } from './charts.js';
import { daysInYear } from './date.js';
import { formatCount, secondsUnderAMinute } from './format.js';

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

export type SportColors = Record<ActivityType, string>;

/**
 * Ranks the given sports by activity count so each keeps its colour across metrics.
 * Pass only the sports a view shows when its palette is smaller than the sports in the year.
 */
export function sportColorsFor(breakdown: SportBreakdown[], theme: Theme = 'neon'): SportColors {
	const { colors: palette, other } = SPORT_PALETTES[theme];
	const colors = Object.fromEntries(ACTIVITY_TYPES.map((type) => [type, other])) as SportColors;

	consolidateBreakdown(breakdown)
		.filter((s) => s.type !== 'other')
		.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
		.forEach((s, i) => {
			colors[s.type] = palette[i % palette.length];
		});

	return colors;
}

/**
 * Donut segments sized by `metric`, each starting where the previous one ends.
 * Slices shorter than the gap are left out.
 */
export function sportDonutSegments(
	sports: SportBreakdown[],
	colors: SportColors,
	metric: BreakdownMetric,
	circumference: number,
	variant: WidgetVariant
): SportDonutSegment[] {
	const values = sports.map((s) => s[metric]);
	// A lone slice is the whole ring; a gap would leave a slit at 12 o'clock.
	const gap = values.filter((v) => v > 0).length > 1 ? DONUT_SEGMENT_GAP[variant] : 0;

	return donutSegments(values, circumference)
		.map(({ share, offset }, i) => ({
			length: share * circumference - gap,
			offset,
			color: colors[sports[i].type]
		}))
		.filter(({ length }) => length > 0)
		.map(({ length, offset, color }) => ({
			dashArray: `${length} ${circumference}`,
			offset,
			color
		}));
}

/** The total the donut is split by, shown in its centre. */
export function donutCentre(
	locale: Locale,
	sports: SportBreakdown[],
	metric: BreakdownMetric
): DonutCentre {
	const total = sports.reduce((sum, s) => sum + s[metric], 0);

	if (metric === 'duration') {
		// Floored so the centre agrees with formatDuration in Time Active.
		const hours = Math.floor(total / ONE_HOUR_IN_SECONDS);
		const seconds = secondsUnderAMinute(total);
		if (seconds !== undefined) {
			return { value: seconds.toString(), label: MESSAGES[locale].common.nouns.second(seconds) };
		}
		if (hours === 0) {
			const minutes = Math.floor(total / ONE_MINUTE_IN_SECONDS);
			return { value: minutes.toString(), label: MESSAGES[locale].common.nouns.minute(minutes) };
		}
		return { value: formatCount(locale, hours), label: MESSAGES[locale].common.nouns.hour(hours) };
	}
	return {
		value: formatCount(locale, total),
		label: MESSAGES[locale].common.nouns.activityLabel(total)
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
