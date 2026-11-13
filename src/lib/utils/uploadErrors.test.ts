import { describe, it, expect } from 'vitest';
import {
	describeSkippedRows,
	describeUnusableFile,
	skippedRowsNotice,
	unusableFileMessage,
	uploadErrorMessage
} from './uploadErrors.js';
import type { ParseError, ParseResult } from '#lib/types/index.js';

function rowError(type: ParseError['type'], row: number): ParseError {
	return { type, row, message: '' };
}

function emptyResult(errors: ParseError[], yearsInFile: number[] = []): ParseResult {
	return { source: 'garmin', activities: [], errors, yearsInFile, rowCount: 0 };
}

describe('describeSkippedRows', () => {
	it('returns null when every row was read', () => {
		expect(describeSkippedRows([])).toBeNull();
	});

	it('ignores errors that do not keep a row out', () => {
		expect(describeSkippedRows([rowError('unknown', 3)])).toBeNull();
	});

	it('counts each skipped row once', () => {
		const skipped = describeSkippedRows([
			rowError('invalid-date', 4),
			rowError('unknown', 4),
			rowError('missing-column', 9)
		]);

		expect(skipped?.count).toBe(2);
	});

	it('names the most common reason and the first row it happened on', () => {
		const skipped = describeSkippedRows([
			rowError('malformed-quotes', 2),
			rowError('invalid-date', 7),
			rowError('invalid-date', 5),
			rowError('missing-column', 3)
		]);

		expect(skipped).toEqual({ count: 4, reason: 'invalid-date', exampleRow: 5 });
	});

	it('breaks a tie with the reason seen first in the file', () => {
		const skipped = describeSkippedRows([
			rowError('missing-column', 8),
			rowError('malformed-quotes', 3)
		]);

		expect(skipped).toMatchObject({ reason: 'malformed-quotes', exampleRow: 3 });
	});
});

describe('describeUnusableFile', () => {
	it('says which years a readable file covers', () => {
		expect(describeUnusableFile(emptyResult([], [2023, 2024, 2025]), 2026)).toEqual({
			type: 'no-activities-in-year',
			year: 2026,
			yearsInFile: [2023, 2024, 2025],
			skipped: null
		});
	});

	it('blames the rejected rows when no row could be read', () => {
		expect(describeUnusableFile(emptyResult([rowError('invalid-date', 2)]), 2026)).toEqual({
			type: 'rows-rejected',
			skipped: { count: 1, reason: 'invalid-date', exampleRow: 2 }
		});
	});

	it('keeps the rejected rows next to the years of the rows that were read', () => {
		const error = describeUnusableFile(emptyResult([rowError('invalid-date', 2)], [2025]), 2026);

		expect(error).toMatchObject({ type: 'no-activities-in-year', skipped: { count: 1 } });
	});
});

describe('unusableFileMessage', () => {
	const skipped = { count: 12, reason: 'invalid-date', exampleRow: 4 } as const;

	it.each([
		[[2023, 2024, 2025], 'This file has activities from 2023 to 2025, none from 2026'],
		[[2025], 'This file has activities from 2025, none from 2026'],
		[[], 'No 2026 activities found in the file']
	])('describes a file with activities from %j', (yearsInFile, message) => {
		expect(
			unusableFileMessage({ type: 'no-activities-in-year', year: 2026, yearsInFile, skipped: null })
		).toBe(message);
	});

	it('says how many rows failed, why, and where', () => {
		expect(unusableFileMessage({ type: 'rows-rejected', skipped })).toBe(
			'12 rows could not be read, e.g. row 4: the date is not valid'
		);
	});

	it('names the row when only one failed', () => {
		expect(
			unusableFileMessage({
				type: 'rows-rejected',
				skipped: { count: 1, reason: 'missing-column', exampleRow: 7 }
			})
		).toBe('Row 7 could not be read: the activity type or date is missing');
	});

	it('explains rows with unreadable quote marks', () => {
		expect(
			unusableFileMessage({
				type: 'rows-rejected',
				skipped: { count: 2, reason: 'malformed-quotes', exampleRow: 3 }
			})
		).toBe('2 rows could not be read, e.g. row 3: the quote marks do not match');
	});

	it('adds the rejected rows after the years', () => {
		expect(
			unusableFileMessage({
				type: 'no-activities-in-year',
				year: 2026,
				yearsInFile: [2025],
				skipped
			})
		).toBe(
			'This file has activities from 2025, none from 2026. 12 rows could not be read, e.g. row 4: the date is not valid'
		);
	});

	it('formats large counts with separators', () => {
		expect(
			unusableFileMessage({ type: 'rows-rejected', skipped: { ...skipped, count: 1200 } })
		).toMatch(/^1,200 rows/);
	});
});

describe('skippedRowsNotice', () => {
	it.each([
		[1, 'Skipped 1 row that could not be read'],
		[3, 'Skipped 3 rows that could not be read']
	])('reports %i skipped rows', (count, notice) => {
		expect(skippedRowsNotice(count)).toBe(notice);
	});

	it.each([
		['es', 1, 'Se omitió 1 fila que no se pudo leer'],
		['es', 3, 'Se omitieron 3 filas que no se pudieron leer'],
		['pt', 1, '1 linha não pôde ser lida e foi ignorada'],
		['pt', 3, '3 linhas não puderam ser lidas e foram ignoradas'],
		['fr', 1, '1 ligne illisible ignorée'],
		['fr', 3, '3 lignes illisibles ignorées'],
		['de', 1, '1 nicht lesbare Zeile übersprungen'],
		['nl', 3, '3 onleesbare rijen overgeslagen']
	] as const)('agrees the whole %s notice with %i rows', (locale, count, notice) => {
		expect(skippedRowsNotice(count, locale)).toBe(notice);
	});
});

describe('localized upload errors', () => {
	it('puts the German verb particles at the end', () => {
		expect(uploadErrorMessage({ type: 'unrecognised' }, 'de')).toMatch(
			/aus deinem Strava-Export auf Englisch, .* oder Portugiesisch hoch\.$/
		);
		expect(uploadErrorMessage({ type: 'strava-unsupported-language' }, 'de')).toContain(
			'Stelle Strava auf Englisch, Spanisch, Deutsch, Französisch, Italienisch, Niederländisch oder Portugiesisch um,'
		);
	});

	it('says in French that the file was not recognised', () => {
		expect(uploadErrorMessage({ type: 'unrecognised' }, 'fr')).toMatch(
			/^Nous n’avons pas reconnu ce fichier\./
		);
	});

	it('translates the same error into Spanish and German', () => {
		const error = {
			type: 'rows-rejected',
			skipped: { count: 1, reason: 'invalid-date', exampleRow: 2 }
		} as const;
		expect(uploadErrorMessage(error, 'es')).toBe(
			'No se pudo leer la fila 2: la fecha no es válida'
		);
		expect(uploadErrorMessage(error, 'de')).toBe(
			'Zeile 2 konnte nicht gelesen werden: das Datum ist ungültig'
		);
	});
});
