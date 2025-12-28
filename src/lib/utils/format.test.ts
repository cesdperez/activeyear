import { describe, it, expect } from 'vitest';
import {
	formatDistance,
	formatDuration,
	formatCalories,
	formatElevation,
	formatEarthLaps,
	formatEverests,
	formatPizzaSlices,
	calculateEarthLaps,
	calculateEverests,
	calculatePizzaSlices,
	formatActivityCount
} from './format.js';

describe('formatDistance', () => {
	it('formats small distances without decimals', () => {
		expect(formatDistance(42)).toBe('42km');
		expect(formatDistance(99)).toBe('99km');
	});

	it('formats large distances with one decimal', () => {
		expect(formatDistance(100.5)).toBe('100.5km');
		expect(formatDistance(847.345)).toBe('847.3km');
	});

	it('rounds distances correctly', () => {
		expect(formatDistance(42.7)).toBe('43km');
		expect(formatDistance(42.4)).toBe('42km');
	});

	it('formats miles when unit is miles', () => {
		expect(formatDistance(10, 'miles')).toBe('6mi'); // 10km ≈ 6.2mi
		expect(formatDistance(161, 'miles')).toBe('100.0mi'); // 161km ≈ 100mi (over 100 gets decimal)
	});
});

describe('formatDuration', () => {
	it('formats minutes only for short durations', () => {
		expect(formatDuration(1800)).toBe('30m');
		expect(formatDuration(2700)).toBe('45m');
	});

	it('formats hours and minutes', () => {
		expect(formatDuration(3600)).toBe('1h 0m');
		expect(formatDuration(5400)).toBe('1h 30m');
		expect(formatDuration(12888)).toBe('3h 34m');
	});

	it('returns 0m for zero duration', () => {
		expect(formatDuration(0)).toBe('0m');
	});

	it('handles negative values', () => {
		expect(formatDuration(-100)).toBe('0m');
	});
});

describe('formatCalories', () => {
	it('formats with thousands separator', () => {
		expect(formatCalories(2800)).toBe('2,800kcal');
		expect(formatCalories(12500)).toBe('12,500kcal');
	});

	it('handles small values', () => {
		expect(formatCalories(150)).toBe('150kcal');
	});

	it('returns 0 for zero calories', () => {
		expect(formatCalories(0)).toBe('0kcal');
	});
});

describe('formatElevation', () => {
	it('rounds to nearest 10m', () => {
		expect(formatElevation(847)).toBe('850m');
		expect(formatElevation(843)).toBe('840m');
	});

	it('formats with thousands separator', () => {
		expect(formatElevation(1234)).toBe('1,230m');
		expect(formatElevation(8848)).toBe('8,850m');
	});

	it('formats feet when unit is miles', () => {
		expect(formatElevation(100, 'miles')).toBe('350ft'); // 100m ≈ 328ft → rounds to 350
		expect(formatElevation(1000, 'miles')).toBe('3,300ft'); // 1000m ≈ 3280ft → rounds to 3300
	});
});

describe('calculateEarthLaps', () => {
	it('calculates fraction of Earth circumference', () => {
		expect(calculateEarthLaps(40075)).toBeCloseTo(1.0, 5);
		expect(calculateEarthLaps(4007.5)).toBeCloseTo(0.1, 5);
	});
});

describe('formatEarthLaps', () => {
	it('formats small values as percentage', () => {
		expect(formatEarthLaps(400)).toBe('1.0% of a lap around the globe');
	});

	it('formats larger values as multiplier', () => {
		expect(formatEarthLaps(80150)).toBe('2.00x laps around the globe');
		expect(formatEarthLaps(400750)).toBe('10.00x laps around the globe');
	});

	it('formats values between 0.1 and 1.0 as percentage', () => {
		expect(formatEarthLaps(8015)).toBe('20.0% of a lap around the globe');
	});
});

describe('calculateEverests', () => {
	it('calculates fraction of Everest height', () => {
		expect(calculateEverests(8848)).toBeCloseTo(1.0, 5);
		expect(calculateEverests(17696)).toBeCloseTo(2.0, 5);
	});
});

describe('formatEverests', () => {
	it('formats small values as percentage', () => {
		// (884 / 8848) * 100 = 9.99...% -> 10%
		expect(formatEverests(884)).toBe('10% the height of Mt. Everest');
	});

	it('formats larger values as multiplier', () => {
		expect(formatEverests(8848)).toBe('1.0x the height of Mt. Everest');
		expect(formatEverests(20000)).toBe('2.3x the height of Mt. Everest');
	});

	it('formats values between 0.1 and 1.0 as percentage', () => {
		expect(formatEverests(4424)).toBe('50% the height of Mt. Everest');
	});
});

describe('calculatePizzaSlices', () => {
	it('calculates slices from calories', () => {
		expect(calculatePizzaSlices(285)).toBe(1);
		expect(calculatePizzaSlices(570)).toBe(2);
		expect(calculatePizzaSlices(35625)).toBe(125);
	});
});

describe('formatPizzaSlices', () => {
	it('formats with thousands separator', () => {
		expect(formatPizzaSlices(285000)).toBe('1,000 pizza slices burnt');
	});

	it('handles small values', () => {
		expect(formatPizzaSlices(855)).toBe('3 pizza slices burnt');
	});
});

describe('formatActivityCount', () => {
	it('uses singular for count of 1', () => {
		expect(formatActivityCount(1, 'run')).toBe('1 run');
	});

	it('uses plural for count > 1', () => {
		expect(formatActivityCount(5, 'run')).toBe('5 runs');
		expect(formatActivityCount(94, 'activity')).toBe('94 activitys');
	});
});
