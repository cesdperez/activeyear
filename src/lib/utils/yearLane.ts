import type { Activity, PersonalRecords } from '#lib/types/index.js';
import { dayOfYear, daysInYear } from './date.js';

export interface LaneMarker {
	day: number;
	kind: 'highlight' | 'record';
}

// Shortest active tick, as a share of the busiest day, so a short session still reads as a day out.
const MIN_ACTIVE_HEIGHT = 0.3;

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

/**
 * Merges markers whose heads, `headDays` days wide, would overlap into one head at their mean day,
 * a record winning, and pulls heads at either end of the lane inside it. Adjacent results are at
 * least `headDays` apart.
 */
export function mergeCloseMarkers(
	markers: LaneMarker[],
	days: number,
	headDays: number
): LaneMarker[] {
	if (headDays <= 0) return markers;
	const first = headDays / 2 - 0.5;
	const last = days - 0.5 - headDays / 2;
	const centre = ({ sum, count }: { sum: number; count: number }) =>
		Math.min(Math.max(sum / count, first), last);

	const groups: { sum: number; count: number; kind: LaneMarker['kind'] }[] = [];
	for (const { day, kind } of markers) {
		groups.push({ sum: day, count: 1, kind });
		while (groups.length > 1 && centre(groups.at(-1)!) - centre(groups.at(-2)!) < headDays) {
			const top = groups.pop()!;
			const below = groups.at(-1)!;
			below.sum += top.sum;
			below.count += top.count;
			if (top.kind === 'record') below.kind = 'record';
		}
	}
	return groups.map((group) => ({ day: centre(group), kind: group.kind }));
}

/**
 * CSS `left` for a marker centred on `day`, clamped by the lane's `--marker-half` so a head on the
 * first or last day stays inside the lane.
 */
export function markerLeft(day: number, days: number): string {
	return `clamp(var(--marker-half), ${((day + 0.5) / days) * 100}%, calc(100% - var(--marker-half)))`;
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
