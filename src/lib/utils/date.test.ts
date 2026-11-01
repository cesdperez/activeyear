import { describe, it, expect } from 'vitest';
import { daysInYear } from './date.js';

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
