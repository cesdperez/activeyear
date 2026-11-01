import { describe, it, expect, vi, afterEach } from 'vitest';
import { demoActivities } from './demo.js';
import {
	calculatePersonalRecords,
	calculateWeeklyPattern,
	calculateYearStats
} from '#lib/utils/stats.js';
import { TARGET_YEAR } from '#lib/constants/time.js';

describe('demoActivities', () => {
	const stats = calculateYearStats(demoActivities);

	it('has 245 activities over 180 active days', () => {
		expect(stats.activityCount).toBe(245);
		expect(stats.activeDays).toBe(180);
	});

	it('adds up to exactly 150 hours', () => {
		expect(stats.totalDuration).toBe(150 * 3600);
	});

	it('has a 12 day longest streak', () => {
		expect(stats.longestStreak).toBe(12);
	});

	it('takes place within the target year', () => {
		const years = new Set(demoActivities.map((a) => a.date.getFullYear()));

		expect([...years]).toEqual([TARGET_YEAR]);
	});

	it('takes its personal records from the favorite highlights', () => {
		const records = calculatePersonalRecords(demoActivities);

		expect(records.longestDistance?.activity.title).toBe('Century Ride Achievement');
		expect(records.longestDuration?.activity.title).toBe('Summit Sunrise Hike');
		expect(records.biggestBurn?.activity.title).toBe('Century Ride Achievement');
	});

	describe('in other timezones', () => {
		const originalTz = process.env.TZ;
		const weeklyPattern = calculateWeeklyPattern(demoActivities);

		afterEach(() => {
			process.env.TZ = originalTz;
		});

		it.each(['Pacific/Kiritimati', 'Pacific/Pago_Pago', 'America/New_York'])(
			'keeps the same weekly pattern and day counts in %s',
			async (timeZone) => {
				process.env.TZ = timeZone;
				vi.resetModules();
				const { demoActivities: shifted } = await import('./demo.js');
				const shiftedStats = calculateYearStats(shifted);

				expect(calculateWeeklyPattern(shifted)).toEqual(weeklyPattern);
				expect(shiftedStats.activeDays).toBe(180);
				expect(shiftedStats.longestStreak).toBe(12);
			}
		);
	});
});
