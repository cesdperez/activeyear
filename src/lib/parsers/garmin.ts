import Papa from 'papaparse';
import type {
	Activity,
	ActivityParser,
	ActivityType,
	GarminRawActivity,
	ParseError,
	ParseResult
} from '../types/index.js';
import { TARGET_YEAR } from '../constants/time.js';
import { MAX_RECORD_CHARS, MAX_RECORD_LINES } from '../constants/parsing.js';

// Garmin localises headers, so other languages miss these. Every Garmin export has all three.
const KEY_HEADERS = ['Activity Type', 'Date', 'Distance'];

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
	Running: 'running',
	'Trail Running': 'running',
	'Treadmill Running': 'running',
	'Virtual Run': 'running',
	Cycling: 'cycling',
	'Indoor Cycling': 'cycling',
	'Virtual Cycling': 'cycling',
	'Road Cycling': 'cycling',
	'Mountain Biking': 'cycling',
	'eMountain Biking': 'cycling',
	'Gravel Cycling': 'cycling',
	'Gravel/Unpaved Cycling': 'cycling',
	Swimming: 'swimming',
	'Pool Swim': 'swimming',
	'Open Water Swimming': 'swimming',
	Walking: 'walking',
	Hiking: 'hiking',
	'Strength Training': 'strength',
	Strength: 'strength',
	Yoga: 'yoga',
	Pilates: 'yoga',
	Cardio: 'cardio',
	CrossFit: 'cardio',
	HIIT: 'cardio',
	Rowing: 'rowing',
	'Indoor Rowing': 'rowing',
	'Track Running': 'running',
	'Indoor Track': 'running',
	'Stand Up Paddleboarding': 'paddling',
	SUP: 'paddling',
	Kayaking: 'paddling',
	Canoeing: 'paddling',
	Padel: 'other',
	Skating: 'other',
	'Ice Skating': 'other',
	Multisport: 'other',
	'Rock Climbing': 'other'
};

const DISTANCE_IN_METERS_TYPES = new Set([
	'Pool Swim',
	'Open Water Swimming',
	'Swimming',
	'Indoor Rowing',
	'Rowing',
	'Track Running',
	'Indoor Track',
	'Stand Up Paddleboarding',
	'SUP',
	'Kayaking',
	'Canoeing'
]);

/**
 * Parse Garmin time format (HH:MM:SS or MM:SS.S) to seconds
 */
export function parseGarminTime(timeStr: string): number {
	if (!timeStr || timeStr === '--') return 0;

	// Handle MM:SS.S format (e.g., "00:02:10.0")
	const parts = timeStr.split(':');
	if (parts.length === 3) {
		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);
		const seconds = parseFloat(parts[2]);
		return hours * 3600 + minutes * 60 + seconds;
	} else if (parts.length === 2) {
		const minutes = parseInt(parts[0], 10);
		const seconds = parseFloat(parts[1]);
		return minutes * 60 + seconds;
	}
	return 0;
}

/**
 * Helper to clean numeric strings by handling different locales (English vs European)
 * English: thousands = , decimal = .
 * European: thousands = . decimal = ,
 */
function cleanNumericString(str: string): string {
	if (!str || str === '--') return '0';

	const cleaned = str.trim();

	const hasComma = cleaned.includes(',');
	const hasDot = cleaned.includes('.');

	if (hasComma && hasDot) {
		// Both exist: the last one is the decimal separator
		const lastComma = cleaned.lastIndexOf(',');
		const lastDot = cleaned.lastIndexOf('.');

		if (lastComma > lastDot) {
			// European format: 1.234,56
			return cleaned.replace(/\./g, '').replace(/,/g, '.');
		} else {
			// English format: 1,234.56
			return cleaned.replace(/,/g, '');
		}
	} else if (hasComma) {
		// Only comma: could be decimal (45,25) or thousands (1,000)
		// In Garmin exports, comma is usually decimal in European locales
		// and thousands in English. But English also uses dot for decimals.
		// If there's ONLY a comma, we check the length of the fractional part.
		const parts = cleaned.split(',');
		if (parts.length === 2 && parts[1].length <= 2) {
			// likely decimal: 45,25
			return cleaned.replace(/,/g, '.');
		} else {
			// likely thousands or multi-part: 1,000
			return cleaned.replace(/,/g, '');
		}
	} else if (hasDot) {
		// Only dot: could be decimal (45.25) or thousands (1.000)
		// If it looks like a thousand (exactly 3 digits after dot), it's ambiguous.
		// But usually Garmin uses dot as decimal.
		// EXCEPT for things like Calories or Steps where thousands are common.
		// We'll treat it as a decimal unless it's a thousand-like pattern and the value is large.
		const parts = cleaned.split('.');
		if (parts.length === 2 && parts[1].length === 3) {
			// Ambiguous! 1.000 could be 1 or 1000.
			// For now, let's assume decimal unless we have better context.
			// Actually, in the user's file, 1.000 was 1000 meters or 1540 calories.
			// Let's assume dot is thousands if it's strictly 3 digits and no comma exists?
			// No, that's risky for km.
			return cleaned;
		}
		return cleaned;
	}

	return cleaned;
}

/**
 * Parse Garmin distance string to km
 */
export function parseGarminDistance(distanceStr: string): number {
	const cleaned = cleanNumericString(distanceStr);
	const value = parseFloat(cleaned);
	return isNaN(value) ? 0 : value;
}

// In fields Garmin writes as whole numbers, a dot followed by exactly three digits
// is a thousands separator ("1.500"), never a decimal point.
function cleanWholeNumberString(str: string): string {
	const cleaned = cleanNumericString(str);
	return /^\d+\.\d{3}$/.test(cleaned) ? cleaned.replace('.', '') : cleaned;
}

/**
 * Parse a Garmin distance given in meters (swims, rowing, track) to km
 */
function parseGarminMeterDistance(distanceStr: string): number {
	const value = parseFloat(cleanWholeNumberString(distanceStr));
	return isNaN(value) ? 0 : value / 1000;
}

/**
 * Parse Garmin calories string to number
 */
export function parseGarminCalories(caloriesStr: string): number {
	const value = parseInt(cleanWholeNumberString(caloriesStr), 10);
	return isNaN(value) ? 0 : value;
}

/**
 * Parse Garmin elevation string to meters
 */
export function parseGarminElevation(elevationStr: string): number {
	const value = parseInt(cleanWholeNumberString(elevationStr), 10);
	return isNaN(value) ? 0 : value;
}

/**
 * Map Garmin activity type to internal ActivityType
 */
export function mapActivityType(garminType: string): ActivityType {
	return ACTIVITY_TYPE_MAP[garminType] || 'other';
}

function isCalendarDate(year: number, month: number, day: number): boolean {
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

function isClockTime(hours: number, minutes: number, seconds: number): boolean {
	// Range check, not a local Date round trip: a real time inside the browser's daylight-saving gap would shift and be rejected.
	return hours <= 23 && minutes <= 59 && seconds <= 59;
}

/**
 * Parse YYYY-MM-DD HH:MM:SS, returning null for other formats or impossible dates.
 */
export function parseGarminDate(dateStr: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(dateStr.trim());
	if (!match) return null;
	const [year, month, day, hours, minutes, seconds] = match.slice(1).map(Number);
	if (!isCalendarDate(year, month, day) || !isClockTime(hours, minutes, seconds)) return null;
	return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Check if a date is in the target year
 */
export function isInYear(date: Date, year: number): boolean {
	return date.getFullYear() === year;
}

function readHeaders(headerLine: string): string[] {
	return (Papa.parse<string[]>(headerLine, { header: false }).data[0] ?? []).map((h) => h.trim());
}

/**
 * Deduplicate headers in a CSV string to prevent PapaParse warnings
 */
function deduplicateHeaders(csvContent: string): string {
	const lines = csvContent.split(/\r?\n/);
	const headerIndex = lines.findIndex((line) => line.trim() !== '');
	if (headerIndex === -1) return csvContent;
	const headers = readHeaders(lines[headerIndex]);
	if (headers.length === 0) return csvContent;

	const seen = new Set<string>();
	const deduplicatedHeaders = headers.map((trimmed) => {
		let final = trimmed;
		let i = 1;
		while (seen.has(final)) {
			final = `${trimmed}_${i++}`;
		}
		seen.add(final);
		return final;
	});

	lines[headerIndex] = Papa.unparse([deduplicatedHeaders]);
	return lines.join('\n');
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
function recoverTitleRow(line: string, headers: string[]): string[] | null {
	const titleIndex = headers.indexOf('Title');
	if (titleIndex === -1) return null;

	const before = readLeadingFields(line, titleIndex);
	const after = readTrailingFields(line, headers.length - titleIndex - 1);
	if (!before || !after || before.end > after.start) return null;

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
function hasMalformedRows(parsed: Papa.ParseResult<string[]>): boolean {
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
function repairMalformedQuotes(csvContent: string): { content: string; errors: ParseError[] } {
	const allLines = csvContent.split(/\r?\n/);
	const headerIndex = allLines.findIndex((line) => line.trim() !== '');
	if (headerIndex === -1) return { content: csvContent, errors: [] };
	const headers = readHeaders(allLines[headerIndex]);
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

	const closePending = (record: PendingRecord) => {
		const text = record.lines.join('\n');
		if (isCompleteRecord(text, headers)) rows.push(text);
		else skip(record.row, record.lines.length);
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
			skip(pending.row, pending.lines.length);
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
			skip(pending.row, pending.lines.length);
			pending = null;
		}
	}
	if (pending) skip(pending.row, pending.lines.length);

	return { content: rows.join('\n'), errors };
}

// Some tools wrap each CSV row in quotes and escape the quotes inside, so most data rows
// parse as one column. The header may be left unquoted.
function flattenWholeRowQuoted(rows: string[][], content: string): string | null {
	const dataRows = rows.slice(1);
	const quotedDataRows = dataRows.filter((row) => row.length === 1).length;
	if (dataRows.length === 0 || quotedDataRows <= dataRows.length / 2) return null;

	// Keep blank lines so later rows retain their line number in the file.
	const allRows = Papa.parse<string[]>(content, { header: false, skipEmptyLines: false }).data;
	return allRows.map((row) => (row.length === 1 ? row[0] : Papa.unparse([row]))).join('\n');
}

function readActivity(row: GarminRawActivity, date: Date): Activity {
	const distance = DISTANCE_IN_METERS_TYPES.has(row['Activity Type'])
		? parseGarminMeterDistance(row['Distance'])
		: parseGarminDistance(row['Distance']);

	return {
		date,
		type: mapActivityType(row['Activity Type']),
		title: row['Title'] || '',
		distance,
		duration: parseGarminTime(row['Total Time'] || row['Time']),
		calories: parseGarminCalories(row['Calories']),
		elevation: parseGarminElevation(row['Total Ascent']),
		favorite: row['Favorite']?.toLowerCase() === 'true'
	};
}

function countNewlines(values: unknown[]): number {
	return values.reduce<number>(
		(sum, value) =>
			sum +
			(Array.isArray(value) ? countNewlines(value) : (String(value).match(/\n/g)?.length ?? 0)),
		0
	);
}

/** Calls `onRow` with each data row and the line it starts on, so errors match what a spreadsheet shows. */
function readRows(
	content: string,
	onRow: (row: GarminRawActivity, line: number, errors: Papa.ParseError[]) => void
): void {
	let scanned = 0;
	let newlines = 0;
	Papa.parse<GarminRawActivity>(content, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim(),
		step: ({ data, errors, meta }) => {
			// The cursor sits just past the row's line break, which must not count toward its own line.
			for (; scanned < meta.cursor - 1; scanned++) if (content[scanned] === '\n') newlines++;
			const lastLine = newlines + 1;
			onRow(data, lastLine - countNewlines(Object.values(data)), errors);
		}
	});
}

/**
 * Parse a Garmin CSV string and return activities for the specified year
 */
export function parseGarminCsv(csvContent: string, targetYear: number = TARGET_YEAR): ParseResult {
	const activities: Activity[] = [];
	const errors: ParseError[] = [];
	const years = new Set<number>();

	const firstPass = Papa.parse<string[]>(csvContent, {
		header: false,
		skipEmptyLines: true
	});
	const flattened = flattenWholeRowQuoted(firstPass.data, csvContent);
	const content = flattened ?? csvContent;
	const parsed =
		flattened === null ? firstPass : Papa.parse<string[]>(flattened, { skipEmptyLines: true });
	const repaired = hasMalformedRows(parsed)
		? repairMalformedQuotes(content)
		: { content, errors: [] };
	errors.push(...repaired.errors);

	readRows(deduplicateHeaders(repaired.content), (row, line, rowErrors) => {
		for (const { message } of rowErrors) errors.push({ type: 'unknown', row: line, message });

		if (!row['Activity Type'] || !row['Date']) {
			errors.push({
				type: 'missing-column',
				row: line,
				message: 'Missing required column (Activity Type or Date)'
			});
			return;
		}

		const date = parseGarminDate(row['Date']);
		if (!date) {
			errors.push({ type: 'invalid-date', row: line, message: 'Invalid date format' });
			return;
		}

		years.add(date.getFullYear());
		if (isInYear(date, targetYear)) activities.push(readActivity(row, date));
	});

	return { activities, errors, yearsInFile: [...years].sort((a, b) => a - b) };
}

// Quotes are dropped before splitting so a header row wrapped whole in quotes still matches.
function hasGarminHeaders(csvContent: string): boolean {
	const firstLine = csvContent.trimStart().split(/\r?\n/, 1)[0];
	const headers = new Set(
		firstLine
			.replaceAll('"', '')
			.split(',')
			.map((h) => h.trim())
	);
	return KEY_HEADERS.every((h) => headers.has(h));
}

export const garminParser: ActivityParser = {
	detect: hasGarminHeaders,
	parse: parseGarminCsv
};
