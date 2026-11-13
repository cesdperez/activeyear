import { INTL_LOCALES } from '#lib/constants/locales.js';
import type { Locale } from '#lib/types/index.js';

export function weekdayLabels(locale: Locale): string[] {
	const formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
		weekday: 'short',
		timeZone: 'UTC'
	});
	return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(Date.UTC(2024, 0, i + 1))));
}

export function monthLabels(locale: Locale): string[] {
	const formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
		month: 'short',
		timeZone: 'UTC'
	});
	return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(Date.UTC(2024, i, 1))));
}

export function daysInYear(year: number): number {
	const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	return isLeapYear ? 366 : 365;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The local calendar date of `date` as a whole day count. Dates hold the CSV's local wall-clock
 * time, and counting through Date.UTC keeps consecutive dates exactly one apart across DST changes.
 */
export function localDayNumber(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

export function dayOfYear(date: Date): number {
	return localDayNumber(date) - localDayNumber(new Date(date.getFullYear(), 0, 1));
}

export function localDateFromDayNumber(day: number): Date {
	const utc = new Date(day * MS_PER_DAY);
	return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function isYearRunning(year: number, today: Date): boolean {
	return today.getFullYear() === year;
}

export function daysElapsed(year: number, today: Date): number {
	if (today.getFullYear() > year) return daysInYear(year);
	if (today.getFullYear() < year) return 0;
	return dayOfYear(today) + 1;
}
