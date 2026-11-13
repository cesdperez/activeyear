import { describe, expect, it } from 'vitest';
import type { Activity } from '#lib/types/index.js';
import {
	activitySearchText,
	availablePresets,
	presetHighlights,
	searchActivities
} from './highlights.js';

function activity(day: number, overrides: Partial<Activity> = {}): Activity {
	return {
		date: new Date(2025, 0, day),
		type: 'running',
		title: 'Morning run',
		distance: 42,
		duration: day,
		elevation: day,
		calories: 0,
		favorite: false,
		...overrides
	};
}

describe('highlight presets', () => {
	it('limits longest, farthest, climbs and favorites and breaks ties by earlier date', () => {
		const activities = Array.from({ length: 12 }, (_, i) =>
			activity(i + 1, { duration: 10, distance: 10, elevation: 10, favorite: true })
		).reverse();
		for (const preset of ['longest', 'farthest', 'climbs', 'favorites'] as const) {
			expect(presetHighlights(activities, preset)).toEqual(activities.slice(2).reverse());
		}
	});
	it('chooses the highest values before capping and sorts them by date', () => {
		const activities = Array.from({ length: 12 }, (_, i) =>
			activity(i + 1, { duration: i + 1, distance: 12 - i, elevation: ((i + 5) % 12) + 1 })
		);
		expect(presetHighlights(activities, 'longest')).toEqual(activities.slice(2));
		expect(presetHighlights(activities, 'farthest')).toEqual(activities.slice(0, 10));
		expect(presetHighlights(activities, 'climbs')).toEqual(
			activities.filter((_, i) => i !== 7 && i !== 8)
		);
	});
	it('picks the month with the greatest total duration', () => {
		const january = activity(1, { duration: 30 });
		const february = [
			activity(1, { date: new Date(2025, 1, 1), duration: 20 }),
			activity(2, { date: new Date(2025, 1, 2), duration: 20 })
		];
		expect(presetHighlights([january, ...february], 'best-month')).toEqual(february);
	});
	it('filters zero distance and elevation and ranks the rest', () => {
		const zero = activity(1, { distance: 0, elevation: 0 });
		const high = activity(2, { distance: 20, elevation: 100 });
		const low = activity(3, { distance: 1, elevation: 2 });
		expect(presetHighlights([zero, low, high], 'farthest')).toEqual([high, low]);
		expect(presetHighlights([zero, low, high], 'climbs')).toEqual([high, low]);
	});
	it('picks the longest of each sport with earlier ties', () => {
		const early = activity(1, { duration: 20 });
		const late = activity(2, { duration: 20 });
		const cycling = activity(3, { type: 'cycling' });
		expect(presetHighlights([late, cycling, early], 'per-sport')).toEqual([early, cycling]);
	});
	it('picks the earliest month on total ties and its longest activities', () => {
		const january = activity(1, { duration: 20 });
		const february = activity(1, { date: new Date(2025, 1, 1), duration: 20 });
		expect(presetHighlights([february, january], 'best-month')).toEqual([january]);
	});
	it('exposes only nonempty presets in order', () => {
		expect(availablePresets([])).toEqual([]);
		const zero = activity(1, { distance: 0, elevation: 0 });
		expect(availablePresets([zero])).toEqual(['longest', 'per-sport', 'best-month']);
		expect(availablePresets([{ ...zero, favorite: true }])).toEqual([
			'longest',
			'per-sport',
			'best-month',
			'favorites'
		]);
	});
});

describe('activity search', () => {
	it('matches all tokens across sport, title, date, month and distance', () => {
		const run = activity(7);
		const texts = [activitySearchText(run)];
		for (const query of ['morning running', 'january 7', 'jan 2025-01-07', '42 km 26 mi']) {
			expect(searchActivities([run], texts, query, 8).matches).toEqual([run]);
		}
		expect(searchActivities([run], texts, 'run cycling', 8).matches).toEqual([]);
		expect(searchActivities([run], texts, '   ', 8).matches).toEqual([]);
	});
	it('matches one-decimal distances in kilometres and miles', () => {
		const run = activity(1, { distance: 42.63 });
		for (const query of ['42.6 km', '42.6km', '26.5 mi', '26.5mi'])
			expect(searchActivities([run], [activitySearchText(run)], query, 8).matches).toEqual([run]);
	});
	it('matches localized months, decimal distances and comma titles', () => {
		const january = activity(1, { title: '5,5km tempo', distance: 12.5 });
		const march = activity(1, { date: new Date(2025, 2, 1) });
		for (const [item, query] of [
			[january, 'enero'],
			[january, 'january'],
			[march, 'März'],
			[january, '12,5'],
			[january, '5,5km tempo']
		] as const) {
			expect(searchActivities([item], [activitySearchText(item)], query, 8).matches).toEqual([
				item
			]);
		}
	});
	it('returns newest matches first up to the limit and counts every match', () => {
		const activities = [activity(1), activity(3), activity(2)];
		expect(
			searchActivities(
				activities,
				activities.map((a) => activitySearchText(a)),
				'RUN',
				2
			)
		).toEqual({ matches: [activities[1], activities[2]], total: 3 });
	});
});
