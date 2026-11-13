import Papa from 'papaparse';
import { readHeaderCells } from './csv.js';
import type { ParseError } from '#lib/types/index.js';
import { MAX_RECORD_CHARS, MAX_RECORD_LINES } from '#lib/constants/parsing.js';

export function findHeaderIndex(lines: string[]): number {
	return lines.findIndex((line) => line.trim() !== '');
}

interface CsvField {
	value: string;
	end: number;
}

function readField(text: string, start: number): CsvField | null {
	if (text[start] !== '"') {
		const comma = text.indexOf(',', start);
		const end = comma === -1 ? text.length : comma;
		const value = text.slice(start, end);
		return value.includes('"') ? null : { value, end };
	}

	let value = '';
	let i = start + 1;
	while (i < text.length) {
		if (text[i] !== '"') {
			value += text[i++];
		} else if (text[i + 1] === '"') {
			value += '"';
			i += 2;
		} else {
			return { value, end: i + 1 };
		}
	}
	return null;
}

// Reads `count` well-formed fields, each followed by a comma; `end` is just past the last comma.
function readLeadingFields(text: string, count: number): { values: string[]; end: number } | null {
	const values: string[] = [];
	let pos = 0;
	for (let n = 0; n < count; n++) {
		const field = readField(text, pos);
		if (!field || text[field.end] !== ',') return null;
		values.push(field.value);
		pos = field.end + 1;
	}
	return { values, end: pos };
}

// A quoted CSV field reads the same reversed, so trailing fields are leading fields of the reversed line.
// Code unit reversal is deliberate: reversing twice restores surrogate pairs.
function reverse(text: string): string {
	return text.split('').reverse().join('');
}

function readTrailingFields(
	text: string,
	count: number
): { values: string[]; start: number } | null {
	const reversed = readLeadingFields(reverse(text), count);
	if (!reversed) return null;
	return { values: reversed.values.map(reverse).reverse(), start: text.length - reversed.end };
}

// Garmin writes titles without escaping their quotes, so a title can swallow the fields after it.
// Every other column must read cleanly from its end of the line, leaving the title in between.
function readFieldsAroundTitle(line: string, headers: string[]) {
	const titleIndex = headers.indexOf('Title');
	if (titleIndex === -1) return null;

	const before = readLeadingFields(line, titleIndex);
	const after = readTrailingFields(line, headers.length - titleIndex - 1);
	if (!before || !after || before.end > after.start) return null;
	return { before, after };
}

function recoverTitleRow(line: string, headers: string[]): string[] | null {
	const fields = readFieldsAroundTitle(line, headers);
	if (!fields) return null;
	const { before, after } = fields;

	const rawTitle = line.slice(before.end, after.start);
	if (rawTitle.length < 2 || !rawTitle.startsWith('"') || !rawTitle.endsWith('"')) return null;

	const title = rawTitle.slice(1, -1).replaceAll('""', '"');
	return [...before.values, title, ...after.values];
}

function countQuotes(text: string): number {
	return text.match(/"/g)?.length ?? 0;
}

function isCompleteRecord(text: string, headers: string[]): boolean {
	const result = Papa.parse<string[]>(text, { delimiter: ',' });
	return (
		result.errors.length === 0 &&
		result.data.length === 1 &&
		result.data[0].length === headers.length
	);
}

/** True when quotes left a row unreadable or shifted its fields into other columns. */
export function hasMalformedRows(parsed: Papa.ParseResult<string[]>): boolean {
	const [headers, ...rows] = parsed.data;
	return (
		parsed.errors.some((e) => e.type === 'Quotes') ||
		rows.some((row) => row.length !== headers.length)
	);
}

function malformedQuotesError(row: number): ParseError {
	return {
		type: 'malformed-quotes',
		row,
		message: `Skipped row ${row} because its quote marks could not be read. Remove the quote marks from that activity's title in Garmin Connect, then export again.`
	};
}

interface PendingRecord {
	row: number;
	lines: string[];
	chars: number;
	quotes: number;
}

/**
 * Rewrites rows whose unescaped title quotes would merge fields or rows, and skips rows
 * that cannot be recovered, so a corrupt row never reaches the totals.
 */
export function repairMalformedQuotes(csvContent: string): {
	content: string;
	errors: ParseError[];
} {
	const allLines = csvContent.split(/\r?\n/);
	const headerIndex = findHeaderIndex(allLines);
	if (headerIndex === -1) return { content: csvContent, errors: [] };
	const headers = readHeaderCells(allLines[headerIndex]);
	const rows = allLines.slice(0, headerIndex + 1);
	const lines = allLines.slice(headerIndex + 1);
	const errors: ParseError[] = [];
	// A line with an open quote may start a field that spans lines.
	let pending: PendingRecord | null = null;

	const readLine = (line: string) => {
		// A quote-free line cannot be quote-corrupted, so its field count is left to the main parse.
		if (countQuotes(line) === 0 || isCompleteRecord(line, headers)) {
			rows.push(line);
			return true;
		}
		const recovered = recoverTitleRow(line, headers);
		if (recovered) rows.push(Papa.unparse([recovered]));
		return recovered !== null;
	};

	// Blank lines in place of a skipped record keep every later row on its line in the file.
	const skip = (row: number, lineCount: number) => {
		errors.push(malformedQuotesError(row));
		rows.push(...Array<string>(lineCount).fill(''));
	};

	const skipPending = (record: PendingRecord) => {
		let start = 0;
		for (let i = 1; i < record.lines.length; i++) {
			if (readFieldsAroundTitle(record.lines[i], headers)) {
				skip(record.row + start, i - start);
				start = i;
			}
		}
		skip(record.row + start, record.lines.length - start);
	};

	const closePending = (record: PendingRecord) => {
		const text = record.lines.join('\n');
		if (isCompleteRecord(text, headers)) rows.push(text);
		else skipPending(record);
	};

	for (const [index, line] of lines.entries()) {
		const row = headerIndex + index + 2;
		if (!pending) {
			if (readLine(line)) continue;
			if (countQuotes(line) % 2 === 1) {
				pending = { row, lines: [line], chars: line.length, quotes: countQuotes(line) };
			} else skip(row, 1);
			continue;
		}

		if (isCompleteRecord(line, headers) || recoverTitleRow(line, headers)) {
			skipPending(pending);
			pending = null;
			readLine(line);
			continue;
		}
		pending.lines.push(line);
		pending.chars += line.length;
		pending.quotes += countQuotes(line);
		if (pending.quotes % 2 === 0) {
			closePending(pending);
			pending = null;
		} else if (pending.lines.length > MAX_RECORD_LINES || pending.chars > MAX_RECORD_CHARS) {
			skipPending(pending);
			pending = null;
		}
	}
	if (pending) skipPending(pending);

	return { content: rows.join('\n'), errors };
}

// Some tools wrap each CSV row in quotes and escape the quotes inside, so most data rows
// parse as one column. The header may be left unquoted.
export function flattenWholeRowQuoted(rows: string[][], content: string): string | null {
	const dataRows = rows.slice(1);
	const quotedDataRows = dataRows.filter((row) => row.length === 1).length;
	if (dataRows.length === 0 || quotedDataRows <= dataRows.length / 2) return null;

	// Keep blank lines so later rows retain their line number in the file.
	const allRows = Papa.parse<string[]>(content, { header: false, skipEmptyLines: false }).data;
	return allRows.map((row) => (row.length === 1 ? row[0] : Papa.unparse([row]))).join('\n');
}
