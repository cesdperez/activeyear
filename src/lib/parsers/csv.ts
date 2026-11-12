import Papa from 'papaparse';
import type { ParseError } from '#lib/types/index.js';

/** Return the first line after leading whitespace. */
export function firstLine(csv: string): string {
	return csv.trimStart().split(/\r?\n/, 1)[0];
}

/** Parse and trim CSV header cells. */
export function readHeaderCells(line: string): string[] {
	return (Papa.parse<string[]>(line, { header: false }).data[0] ?? []).map((h) => h.trim());
}

/** Check a calendar date with a one-based month. */
export function isCalendarDate(year: number, month: number, day: number): boolean {
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

/** Check whether a date falls in the local calendar year. */
export function isInYear(date: Date, year: number): boolean {
	return date.getFullYear() === year;
}

/** Return years in ascending order. */
export function sortedYears(years: Set<number>): number[] {
	return [...years].sort((a, b) => a - b);
}

/** Convert Papa Parse errors for a row to parse errors. */
export function papaRowErrors(errors: Papa.ParseError[], row: number): ParseError[] {
	return errors.map(({ message }) => ({ type: 'unknown', row, message }));
}

/** Create an invalid-date error for a row. */
export function invalidDateError(row: number): ParseError {
	return { type: 'invalid-date', row, message: 'Invalid date format' };
}
