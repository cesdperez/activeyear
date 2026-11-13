import { INTL_LOCALES } from '#lib/constants/locales.js';
import type { Locale } from '#lib/types/index.js';

export function weekdayLabels(locale: Locale): string[] {
	const formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
		weekday: 'short',
		timeZone: 'UTC'
	});
	return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(Date.UTC(2024, 0, i + 1))));
}

export function daysInYear(year: number): number {
	const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	return isLeapYear ? 366 : 365;
}
