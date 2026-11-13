import Papa from 'papaparse';
import type { Activity, ActivitySource, ParseError, ParseResult } from '#lib/types/index.js';

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

function sortedYears(years: Set<number>): number[] {
	return [...years].sort((a, b) => a - b);
}

function papaRowErrors(errors: Papa.ParseError[], row: number): ParseError[] {
	return errors.map(({ message }) => ({ type: 'unknown', row, message }));
}

function invalidDateError(row: number): ParseError {
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

/** Returns an empty parse result containing the given error. */
export function emptyResult(source: ActivitySource | null, error: ParseError): ParseResult {
	return { source, activities: [], yearsInFile: [], rowCount: 0, errors: [error] };
}

type RowOptions<T> = {
	source: ActivitySource;
	year: number;
	header: boolean;
	skipEmptyLines: true | 'greedy';
	readDate: (row: T) => string | undefined;
	hasRequired: (row: T) => boolean;
	missingMessage: string;
	parseDate: (value: string) => Date | null;
	readActivity: (row: T, date: Date) => Activity;
	initialErrors?: ParseError[];
	quoteError?: (line: number) => ParseError;
};

function countNewlines(values: unknown[]): number {
	return values.reduce<number>(
		(sum, value) =>
			sum +
			(Array.isArray(value) ? countNewlines(value) : (String(value).match(/\n/g)?.length ?? 0)),
		0
	);
}

function readRows<T>(
	csv: string,
	papaOptions: Papa.ParseConfig<T>,
	onRow: (data: T, line: number, errors: Papa.ParseError[]) => void
): void {
	csv = csv.replace(/^\uFEFF/, '');
	let scanned = 0;
	let newlines = 0;
	let skipHeaderRow = !papaOptions.header;
	Papa.parse<T>(csv, {
		...papaOptions,
		step: ({ data, errors, meta }) => {
			// Exclude a consumed row break, but include a newline inside an unclosed quoted field.
			const unclosedQuote = errors.some((error) => error.code === 'MissingQuotes');
			const end = meta.cursor - (unclosedQuote ? 0 : 1);
			for (; scanned < end; scanned++) if (csv[scanned] === '\n') newlines++;
			const line = newlines + 1 - countNewlines(Object.values(data as object));
			if (skipHeaderRow) {
				skipHeaderRow = false;
				return;
			}
			onRow(data, line, errors);
		}
	});
}

/** Parses CSV rows into activities and line-specific errors. */
export function parseRows<T>(csv: string, options: RowOptions<T>): ParseResult {
	const result: ParseResult = {
		source: options.source,
		activities: [],
		errors: [...(options.initialErrors ?? [])],
		yearsInFile: [],
		rowCount: options.initialErrors?.length ?? 0
	};
	const years = new Set<number>();
	readRows<T>(
		csv,
		{
			header: options.header,
			skipEmptyLines: options.skipEmptyLines,
			transformHeader: (value) => value.trim()
		},
		(data, rowLine, errors) => {
			result.rowCount++;
			if (options.quoteError && errors.some((error) => error.type === 'Quotes')) {
				result.errors.push(options.quoteError(rowLine));
				return;
			}
			result.errors.push(...papaRowErrors(errors, rowLine));
			const dateText = options.readDate(data);
			if (!options.hasRequired(data) || !dateText) {
				result.errors.push({
					type: 'missing-column',
					row: rowLine,
					message: options.missingMessage
				});
				return;
			}
			const date = options.parseDate(dateText);
			if (!date) {
				result.errors.push(invalidDateError(rowLine));
				return;
			}
			years.add(date.getFullYear());
			if (isInYear(date, options.year)) result.activities.push(options.readActivity(data, date));
		}
	);
	result.yearsInFile = sortedYears(years);
	return result;
}
