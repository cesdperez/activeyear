import { describe, it, expect } from 'vitest';
import {
	formatShortDate,
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
	formatActivityCount,
	formatCount,
	formatPercentOfYear,
	secondsUnderAMinute
} from './format.js';

describe('formatDistance', () => {
	it('formats distances with appropriate precision', () => {
		expect(formatDistance('en', 42)).toBe('42.0km');
		expect(formatDistance('en', 99)).toBe('99.0km');
		expect(formatDistance('en', 100.5)).toBe('101km');
		expect(formatDistance('en', 847.345)).toBe('847km');
		expect(formatDistance('en', 42.7)).toBe('42.7km');
		expect(formatDistance('en', 42.4)).toBe('42.4km');
	});

	it('formats miles when unit is miles', () => {
		expect(formatDistance('en', 10, 'miles')).toBe('6.2mi'); // 10km ≈ 6.21...mi
		expect(formatDistance('en', 161, 'miles')).toBe('100mi'); // 161km ≈ 100.04...mi
	});

	it('groups thousands like the other stats', () => {
		expect(formatDistance('en', 16241.4)).toBe('16,241km');
	});

	it('drops the decimal when the value rounds up to 100', () => {
		expect(formatDistance('en', 99.96)).toBe('100km');
		expect(formatDistance('en', 99.94)).toBe('99.9km');
	});
});

describe('formatDuration', () => {
	it('formats minutes only for short durations', () => {
		expect(formatDuration('en', 1800)).toBe('30m');
		expect(formatDuration('en', 2700)).toBe('45m');
	});

	it('formats hours and minutes', () => {
		expect(formatDuration('en', 3600)).toBe('1h 0m');
		expect(formatDuration('en', 5400)).toBe('1h 30m');
		expect(formatDuration('en', 12888)).toBe('3h 34m');
	});

	it('groups thousands of hours', () => {
		expect(formatDuration('en', 1194 * 3600 + 33 * 60)).toBe('1,194h 33m');
	});

	it('shows seconds for a duration under a minute', () => {
		expect(formatDuration('en', 45)).toBe('45s');
		expect(formatDuration('en', 59.7)).toBe('59s');
		expect(formatDuration('en', 0.4)).toBe('1s');
	});

	it('returns 0m for zero duration', () => {
		expect(formatDuration('en', 0)).toBe('0m');
	});

	it('handles negative values', () => {
		expect(formatDuration('en', -100)).toBe('0m');
	});
});

describe('formatCalories', () => {
	it('formats with thousands separator', () => {
		expect(formatCalories('en', 2800)).toBe('2,800kcal');
		expect(formatCalories('en', 12500)).toBe('12,500kcal');
	});

	it('handles small values', () => {
		expect(formatCalories('en', 150)).toBe('150kcal');
		expect(formatCalories('en', 40)).toBe('40kcal');
	});

	it('returns 0 for zero calories', () => {
		expect(formatCalories('en', 0)).toBe('0kcal');
	});
});

describe('formatElevation', () => {
	it('rounds to nearest 10m', () => {
		expect(formatElevation('en', 847)).toBe('850m');
		expect(formatElevation('en', 843)).toBe('840m');
	});

	it('formats with thousands separator', () => {
		expect(formatElevation('en', 1234)).toBe('1,230m');
		expect(formatElevation('en', 8848)).toBe('8,850m');
	});

	it('formats feet when unit is miles', () => {
		expect(formatElevation('en', 100, 'miles')).toBe('350ft'); // 100m ≈ 328ft → rounds to 350
		expect(formatElevation('en', 1000, 'miles')).toBe('3,300ft'); // 1000m ≈ 3280ft → rounds to 3300
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
		expect(formatEarthLaps('en', 400)).toBe('1.0% of a lap around the globe');
	});

	it('formats larger values as multiplier', () => {
		expect(formatEarthLaps('en', 80150)).toBe('2.00x laps around the globe');
		expect(formatEarthLaps('en', 400750)).toBe('10.00x laps around the globe');
	});

	it('formats values between 0.1 and 1.0 as percentage', () => {
		expect(formatEarthLaps('en', 8015)).toBe('20.0% of a lap around the globe');
	});

	it('never rounds a partial lap up to 100%', () => {
		expect(formatEarthLaps('en', 40070)).toBe('99.9% of a lap around the globe');
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
		expect(formatEverests('en', 884)).toBe('10% the height of Mt. Everest');
	});

	it('formats larger values as multiplier', () => {
		expect(formatEverests('en', 8848)).toBe('1.0x the height of Mt. Everest');
		expect(formatEverests('en', 20000)).toBe('2.3x the height of Mt. Everest');
	});

	it('formats values between 0.1 and 1.0 as percentage', () => {
		expect(formatEverests('en', 4424)).toBe('50% the height of Mt. Everest');
	});

	it('never rounds a partial Everest up to 100%', () => {
		expect(formatEverests('en', 8840)).toBe('99% the height of Mt. Everest');
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
		expect(formatPizzaSlices('en', 285000)).toBe('1,000 pizza slices burnt');
	});

	it('handles small values', () => {
		expect(formatPizzaSlices('en', 855)).toBe('3 pizza slices burnt');
	});

	it('says slice for a single slice', () => {
		expect(formatPizzaSlices('en', 285)).toBe('1 pizza slice burnt');
	});

	it('says less than a slice when the calories round to no slices', () => {
		expect(formatPizzaSlices('en', 120)).toBe('Less than a pizza slice burnt');
	});
});

describe('secondsUnderAMinute', () => {
	it('gives whole seconds, at least one, for a duration under a minute', () => {
		expect(secondsUnderAMinute(45.9)).toBe(45);
		expect(secondsUnderAMinute(0.4)).toBe(1);
	});

	it('gives nothing for no duration or a minute and up', () => {
		expect(secondsUnderAMinute(0)).toBeUndefined();
		expect(secondsUnderAMinute(60)).toBeUndefined();
	});
});

describe('formatCount', () => {
	it('groups thousands like the other stats', () => {
		expect(formatCount('en', 7)).toBe('7');
		expect(formatCount('en', 1008)).toBe('1,008');
	});
});

describe('formatPercentOfYear', () => {
	it('rounds to a whole percent', () => {
		expect(formatPercentOfYear('en', 20.4)).toBe('20%');
		expect(formatPercentOfYear('en', 0)).toBe('0%');
	});

	it('shows a non-zero share under one percent as <1%', () => {
		expect(formatPercentOfYear('en', 0.27)).toBe('<1%');
	});

	it('never rounds a partial year up to 100%', () => {
		expect(formatPercentOfYear('en', (364 / 365) * 100)).toBe('99%');
		expect(formatPercentOfYear('en', 100)).toBe('100%');
	});
});

describe('formatActivityCount', () => {
	it('groups thousands', () => {
		expect(formatActivityCount('en', 1008, 'activity')).toBe('1,008 activities');
	});

	it('uses singular for count of 1', () => {
		expect(formatActivityCount('en', 1, 'run')).toBe('1 run');
	});

	it('uses plural for count > 1', () => {
		expect(formatActivityCount('en', 5, 'run')).toBe('5 runs');
		expect(formatActivityCount('en', 94, 'activity')).toBe('94 activities');
	});
});

describe('formatShortDate', () => {
	it('formats a local date with a short month and day', () => {
		expect(formatShortDate('en', new Date(2025, 2, 3))).toBe('Mar 3');
	});
});

it('formats localized numbers and words', () => {
	expect(formatDistance('de', 42.7)).toBe('42,7km');
	expect(formatCount('de', 12345)).toBe('12.345');
	expect(formatPizzaSlices('es', 285)).toBe('1 porción de pizza quemada');
	expect(formatPizzaSlices('es', 570)).toBe('2 porciones de pizza quemadas');
	expect(formatActivityCount('de', 2, 'run')).toBe('2 Läufe');
});
