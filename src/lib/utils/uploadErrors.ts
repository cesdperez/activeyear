import { MESSAGES } from '#lib/i18n/messages/index.js';
import { savedYearErrorMessage } from './savedYear.js';
import type {
	Locale,
	UploadError,
	ParseError,
	ParseResult,
	RowErrorType,
	SkippedRows,
	UnusableFileError
} from '#lib/types/index.js';
import { formatCount } from './format.js';

function isRowErrorType(type: ParseError['type']): type is RowErrorType {
	return type === 'invalid-date' || type === 'malformed-quotes' || type === 'missing-column';
}

/** Sums up the rows kept out of the totals, or null when every row was read. */
export function describeSkippedRows(errors: ParseError[]): SkippedRows | null {
	// Insertion order follows the file, so a tie goes to the reason seen first and each set starts at its first row.
	const rowsByReason = new Map<RowErrorType, Set<number>>();
	for (const { type, row } of [...errors].sort((a, b) => a.row - b.row)) {
		if (isRowErrorType(type))
			rowsByReason.set(type, (rowsByReason.get(type) ?? new Set()).add(row));
	}
	if (rowsByReason.size === 0) return null;

	const [reason, rows] = [...rowsByReason].reduce((most, entry) =>
		entry[1].size > most[1].size ? entry : most
	);
	const skippedRows = new Set([...rowsByReason.values()].flatMap((r) => [...r]));
	return { count: skippedRows.size, reason, exampleRow: rows.values().next().value! };
}

/** Explains a parse that found no activities for `year`. */
export function describeUnusableFile(result: ParseResult, year: number): UnusableFileError {
	const skipped = describeSkippedRows(result.errors);
	if (skipped && result.yearsInFile.length === 0) return { type: 'rows-rejected', skipped };
	return { type: 'no-activities-in-year', year, yearsInFile: result.yearsInFile, skipped };
}

export function skippedRowsMessage(
	{ count, reason, exampleRow }: SkippedRows,
	locale: Locale = 'en'
): string {
	const m = MESSAGES[locale].upload;
	return count === 1
		? m.singleRow(exampleRow, m[reason])
		: m.multipleRows(formatCount(locale, count), exampleRow, m[reason]);
}

export function yearsMessage(year: number, yearsInFile: number[], locale: Locale = 'en'): string {
	const m = MESSAGES[locale].upload;
	if (yearsInFile.length === 0) return m.noActivities(year);
	const first = yearsInFile[0];
	const last = yearsInFile[yearsInFile.length - 1];
	return m.years(first === last ? `${first}` : m.range(first, last), year);
}

export function unusableFileMessage(error: UnusableFileError, locale: Locale = 'en'): string {
	if (error.type === 'rows-rejected') return skippedRowsMessage(error.skipped, locale);
	const years = yearsMessage(error.year, error.yearsInFile, locale);
	const skipped = error.skipped ? skippedRowsMessage(error.skipped, locale) : null;
	const exportAgain = MESSAGES[locale].upload.exportAgain(error.year);
	return [years, skipped, exportAgain].filter(Boolean).join(' ');
}

export function skippedRowsNotice(count: number, locale: Locale = 'en'): string {
	return MESSAGES[locale].upload.skipped(count, formatCount(locale, count));
}

export function uploadErrorMessage(error: UploadError, locale: Locale): string {
	const m = MESSAGES[locale].upload;
	switch (error.type) {
		case 'invalid-extension':
			return m.invalidExtension;
		case 'zip-archive':
			return m.zipArchive;
		case 'unrecognised':
			return m.unrecognised;
		case 'strava-unsupported-language':
			return m.stravaUnsupportedLanguage;
		case 'unknown-failure':
			return m.unknown;
		case 'rows-rejected':
		case 'no-activities-in-year':
			return unusableFileMessage(error, locale);
		default:
			return savedYearErrorMessage(error, locale);
	}
}
