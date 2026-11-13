import { describe, it, expect } from 'vitest';
import { daysInYear, weekdayLabels } from './date.js';

describe('daysInYear', () => {
	it.each([
		[2026, 365],
		[2028, 366],
		[1900, 365],
		[2000, 366]
	])('%i has %i days', (year, days) => {
		expect(daysInYear(year)).toBe(days);
	});
});

describe('weekdayLabels', () => {
	it('formats weekdays Monday first for each locale', () => {
		expect(weekdayLabels('en')).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
		expect(weekdayLabels('de')).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
	});
});
