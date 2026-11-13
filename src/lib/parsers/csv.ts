import Papa from 'papaparse';
import type { ParseError } from '#lib/types/index.js';

/** First line after any leading blank lines or whitespace. */
export function firstLine(csv: string): string {
	return csv.trimStart().split(/\r?\n/, 1)[0];
}

/** Splits one CSV line into trimmed cells. */
export function readHeaderCells(line: string): string[] {
	return (Papa.parse<string[]>(line, { header: false }).data[0] ?? []).map((h) => h.trim());
}

/** True when the date exists; month is 1-based. */
export function isCalendarDate(year: number, month: number, day: number): boolean {
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

/** Compares the local-time year, not UTC. */
export function isInYear(date: Date, year: number): boolean {
	return date.getFullYear() === year;
}

export function sortedYears(years: Set<number>): number[] {
	return [...years].sort((a, b) => a - b);
}

export function papaRowErrors(errors: Papa.ParseError[], row: number): ParseError[] {
	return errors.map(({ message }) => ({ type: 'unknown', row, message }));
}

export function invalidDateError(row: number): ParseError {
	return { type: 'invalid-date', row, message: 'Invalid date format' };
}

export function bestLocale<T extends { headers: Record<string, string> }>(
	headers: string[],
	locales: readonly T[]
): T | undefined {
	let best = 0;
	let selected: T | undefined;
	for (const locale of locales) {
		const score = headers.filter((header) => Object.hasOwn(locale.headers, header)).length;
		if (score > best) {
			best = score;
			selected = locale;
		}
	}
	return selected;
}
