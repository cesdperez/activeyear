import type { Activity, PersonalRecords } from '#lib/types/index.js';
import { daysInYear, localDayNumber } from './date.js';

export interface LaneMarker {
	day: number;
	kind: 'highlight' | 'record';
}

// Shortest active tick, as a share of the busiest day, so a short session still reads as a day out.
const MIN_ACTIVE_HEIGHT = 0.3;

/** Day of its year, from 0, on the local calendar date. */
export function dayOfYear(date: Date): number {
	return localDayNumber(date) - localDayNumber(new Date(date.getFullYear(), 0, 1));
}

/**
 * One height per day of `year`: 0 for a rest day, otherwise the day's training time scaled so the
 * busiest day is 1. Square-rooted so one epic day does not flatten the rest of the year.
 */
export function laneTicks(activities: Activity[], year: number): number[] {
	const seconds = new Array<number>(daysInYear(year)).fill(0);
	const active = new Array<boolean>(seconds.length).fill(false);
	for (const activity of activities) {
		if (activity.date.getFullYear() !== year) continue;
		const day = dayOfYear(activity.date);
		seconds[day] += activity.duration;
		active[day] = true;
	}

	const busiest = Math.sqrt(Math.max(...seconds));
	return seconds.map((s, day) => {
		if (!active[day]) return 0;
		const share = busiest > 0 ? Math.sqrt(s) / busiest : 0;
		return MIN_ACTIVE_HEIGHT + (1 - MIN_ACTIVE_HEIGHT) * share;
	});
}

/** The days of `year` holding a highlight or a record, a record winning a shared day. */
export function laneMarkers(
	highlights: Activity[],
	records: Activity[],
	year: number
): LaneMarker[] {
	const kinds = new Map<number, LaneMarker['kind']>();
	const mark = (activities: Activity[], kind: LaneMarker['kind']) => {
		for (const { date } of activities) {
			if (date.getFullYear() === year) kinds.set(dayOfYear(date), kind);
		}
	};
	mark(highlights, 'highlight');
	mark(records, 'record');

	return [...kinds].map(([day, kind]) => ({ day, kind })).sort((a, b) => a.day - b.day);
}

export function monthStartDays(year: number): number[] {
	return Array.from({ length: 12 }, (_, month) => dayOfYear(new Date(year, month, 1)));
}

export function recordActivities(records: PersonalRecords | null): Activity[] {
	if (!records) return [];
	return [records.longestDistance, records.longestDuration, records.biggestBurn]
		.filter((record) => record !== null)
		.map((record) => record.activity);
}
