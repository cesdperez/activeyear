import { describe, expect, it } from 'vitest';
import { CENTERED_AVATAR_THEMES } from '#lib/constants/themes.js';
import type { SummaryCardSettings, YearStats } from '#lib/types/index.js';
import { sportColorsFor } from '#lib/utils/breakdown.js';
import { breakdownCardModel, summaryCardModel } from './cardModels.js';

const stats: YearStats = {
	totalDistance: 0,
	totalElevation: 0,
	totalDuration: 120,
	totalCalories: 50,
	activeDays: 2,
	longestStreak: 1,
	activityCount: 3
};
const breakdown = [
	{ type: 'yoga' as const, count: 2, duration: 60, distance: 0 },
	{ type: 'running' as const, count: 1, duration: 120, distance: 2 }
];
const settings: SummaryCardSettings = {
	theme: 'neon',
	unit: 'km',
	summaryMetric: 'duration',
	breakdownMetric: 'count'
};
const data = { stats, breakdown, records: null };

describe('card models', () => {
	it('selects the hero and excludes zero supporting values', () => {
		const model = summaryCardModel(data, settings, 'en');
		expect(model.hero?.id).toBe('duration');
		expect(model.supporting.map((stat) => stat.id)).toEqual(['calories']);
		expect(summaryCardModel(data, { ...settings, summaryMetric: 'calories' }, 'en').hero?.id).toBe(
			'calories'
		);
	});
	it('falls back to a hero with a value when the chosen stat shows zero', () => {
		expect(summaryCardModel(data, { ...settings, summaryMetric: 'distance' }, 'en').hero?.id).toBe(
			'duration'
		);
		expect(
			summaryCardModel(
				{ ...data, stats: { ...stats, totalDistance: 0.04 } },
				{ ...settings, summaryMetric: 'distance' },
				'en'
			).hero?.id
		).toBe('duration');
		const nothing = { ...stats, totalDuration: 0, totalCalories: 0 };
		expect(
			summaryCardModel(
				{ ...data, stats: nothing },
				{ ...settings, summaryMetric: 'calories' },
				'en'
			).hero?.id
		).toBe('calories');
	});
	it('handles missing stats and ranks sports by the chosen metric', () => {
		expect(summaryCardModel({ ...data, stats: null }, settings, 'en').hero).toBeUndefined();
		expect(summaryCardModel(data, settings, 'en').topSport?.type).toBe('yoga');
		expect(
			summaryCardModel(data, { ...settings, breakdownMetric: 'duration' }, 'en').topSport?.type
		).toBe('running');
	});
	it('uses the centered avatar themes', () => {
		for (const theme of [
			'neon',
			'minimalist',
			'retro',
			'classic',
			'synthwave',
			'lightmile'
		] as const) {
			expect(summaryCardModel(data, { ...settings, theme }, 'en').centeredAvatar).toBe(
				CENTERED_AVATAR_THEMES.includes(theme)
			);
		}
	});
	it('builds the breakdown and defaults consistency to zero', () => {
		const model = breakdownCardModel({ breakdown, stats: null }, settings);
		expect(model.topSports.map((sport) => sport.type)).toEqual(['yoga', 'running']);
		expect(model.colors).toEqual(sportColorsFor(model.topSports, settings.theme));
		expect([model.activeDays, model.longestStreak]).toEqual([0, 0]);
		expect(breakdownCardModel({ breakdown: null, stats }, settings).topSports).toEqual([]);
	});
});
