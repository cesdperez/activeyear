import { describe, it, expect } from 'vitest';
import { emptyResult, isInYear, parseRows } from './csv.js';
import { stravaParser } from './strava.js';

describe('isInYear', () => {
	it('returns true for matching year', () => {
		expect(isInYear(new Date('2025-06-15'), 2025)).toBe(true);
	});

	it('returns false for different year', () => {
		expect(isInYear(new Date('2024-12-31'), 2025)).toBe(false);
	});
});

describe('shared CSV parsing', () => {
	it.each(['\n', '\r\n'])('tracks malformed quotes at EOF with %j line endings', (newline) => {
		const csv = ['Activity Date,Activity Type,Moving Time', '"bad,Run,1', ''].join(newline);
		expect(stravaParser.parse(csv, 2026).errors).toContainEqual(
			expect.objectContaining({ type: 'malformed-quotes', row: 2 })
		);
	});

	it.each(['\n', '\r\n'])('tracks rows after a BOM with %j line endings', (newline) => {
		const csv = ['\uFEFFActivity Date,Activity Type,Moving Time', 'x'].join(newline);
		expect(stravaParser.parse(csv, 2026).errors).toContainEqual(
			expect.objectContaining({ type: 'missing-column', row: 2 })
		);
	});

	it('counts greedily skipped records as physical lines', () => {
		const csv = 'Activity Date,Activity Type,Moving Time\n,,,\nbad,Run,1';
		expect(stravaParser.parse(csv, 2026).errors).toContainEqual(
			expect.objectContaining({ type: 'invalid-date', row: 3 })
		);
	});
	it('tracks rows, errors and years through blank lines and multiline values', () => {
		const result = parseRows<string[]>(
			'type,date,note\n\n  \nrun,2023,"two\nlines"\n,2024,x\nrun,bad,x\nrun,2024,x',
			{
				source: 'strava',
				year: 2024,
				header: false,
				skipEmptyLines: 'greedy',
				readDate: (row) => row[1],
				hasRequired: (row) => Boolean(row[0] && row[1]),
				missingMessage: 'missing',
				parseDate: (value) => (/^\d{4}$/.test(value) ? new Date(Number(value), 0, 1) : null),
				readActivity: (_row, date) => ({
					date,
					type: 'running',
					title: '',
					distance: 0,
					duration: 0,
					elevation: 0,
					calories: 0,
					favorite: false
				})
			}
		);
		expect(result.rowCount).toBe(4);
		expect(result.yearsInFile).toEqual([2023, 2024]);
		expect(result.activities).toHaveLength(1);
		expect(result.errors).toEqual([
			{ type: 'missing-column', row: 6, message: 'missing' },
			{ type: 'invalid-date', row: 7, message: 'Invalid date format' }
		]);
	});
	it('builds an empty result', () => {
		const error = { type: 'invalid-date' as const, row: 0, message: 'bad' };
		expect(emptyResult(null, error)).toEqual({
			source: null,
			activities: [],
			yearsInFile: [],
			rowCount: 0,
			errors: [error]
		});
	});
});
