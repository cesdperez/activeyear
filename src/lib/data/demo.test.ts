import { describe, it, expect } from 'vitest';
import { demoActivities } from './demo.js';
import { calculatePersonalRecords, calculateYearStats } from '#lib/utils/stats.js';
import { TARGET_YEAR } from '#lib/constants/time.js';

describe('demoActivities', () => {
	const stats = calculateYearStats(demoActivities);

	it('has 245 activities over 180 active days', () => {
		expect(stats.activityCount).toBe(245);
		expect(stats.activeDays).toBe(180);
	});

	it('has a 12 day longest streak', () => {
		expect(stats.longestStreak).toBe(12);
	});

	it('takes place within the target year', () => {
		const years = new Set(demoActivities.map((a) => a.date.getUTCFullYear()));

		expect([...years]).toEqual([TARGET_YEAR]);
	});

	it('takes its personal records from the favorite highlights', () => {
		const records = calculatePersonalRecords(demoActivities);

		expect(records.longestDistance?.activity.title).toBe('Century Ride Achievement');
		expect(records.longestDuration?.activity.title).toBe('Summit Sunrise Hike');
		expect(records.biggestBurn?.activity.title).toBe('Century Ride Achievement');
	});
});
