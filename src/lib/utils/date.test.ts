import { describe, it, expect } from 'vitest';
import {
	daysElapsed,
	isYearRunning,
	daysInYear,
	localDayNumber,
	monthLabels,
	weekdayLabels
} from './date.js';

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

describe('monthLabels', () => {
	it('names the months January first in the locale', () => {
		expect(monthLabels('en')).toEqual([
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		]);
		expect(monthLabels('de')[2]).toBe('Mär');
		expect(monthLabels('es')[0]).toBe('ene');
	});
});

describe('localDayNumber', () => {
	it('counts consecutive local dates one apart across a daylight saving change', () => {
		expect(localDayNumber(new Date(2026, 2, 30)) - localDayNumber(new Date(2026, 2, 29))).toBe(1);
		expect(localDayNumber(new Date(2026, 9, 26)) - localDayNumber(new Date(2026, 9, 25))).toBe(1);
	});
});

describe('year progress', () => {
	it.each([
		[new Date(2026, 5, 30), true, 181],
		[new Date(2026, 11, 31), true, 365],
		[new Date(2027, 0, 1), false, 365],
		[new Date(2025, 11, 31), false, 0]
	])('counts %s', (date, running, days) => {
		expect(isYearRunning(2026, date)).toBe(running);
		expect(daysElapsed(2026, date)).toBe(days);
	});
});
