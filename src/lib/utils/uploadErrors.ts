import type {
	ParseError,
	ParseResult,
	RowErrorType,
	SkippedRows,
	UnusableFileError
} from '#lib/types/index.js';
import { ROW_ERROR_REASONS } from '#lib/constants/parsing.js';
import { formatCount } from './format.js';

function isRowErrorType(type: ParseError['type']): type is RowErrorType {
	return type in ROW_ERROR_REASONS;
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

function skippedRowsMessage({ count, reason, exampleRow }: SkippedRows): string {
	if (count === 1) return `Row ${exampleRow} could not be read: ${ROW_ERROR_REASONS[reason]}`;
	return `${formatCount(count)} rows could not be read, e.g. row ${exampleRow}: ${ROW_ERROR_REASONS[reason]}`;
}

function yearsMessage(year: number, yearsInFile: number[]): string {
	if (yearsInFile.length === 0) return `No ${year} activities found in the file`;
	const first = yearsInFile[0];
	const last = yearsInFile[yearsInFile.length - 1];
	const range = first === last ? `${first}` : `${first} to ${last}`;
	return `This file has activities from ${range}, none from ${year}`;
}

export function unusableFileMessage(error: UnusableFileError): string {
	if (error.type === 'rows-rejected') return skippedRowsMessage(error.skipped);
	const years = yearsMessage(error.year, error.yearsInFile);
	return error.skipped ? `${years}. ${skippedRowsMessage(error.skipped)}` : years;
}

export function skippedRowsNotice(count: number): string {
	return `Skipped ${formatCount(count)} ${count === 1 ? 'row' : 'rows'} that could not be read`;
}
