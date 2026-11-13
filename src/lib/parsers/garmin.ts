import Papa from 'papaparse';
import { MILES_TO_KM, FEET_TO_METERS, YARDS_TO_METERS } from '#lib/constants/units.js';
import { GARMIN_LOCALES } from './garminLocales.js';
import { bestLocale, firstLine, readHeaderCells, isCalendarDate, parseRows } from './csv.js';
import {
	findHeaderIndex,
	flattenWholeRowQuoted,
	hasMalformedRows,
	repairMalformedQuotes
} from './garminQuotes.js';
import type {
	Activity,
	ActivityParser,
	ActivityType,
	GarminRawActivity,
	ParseResult,
	ParseOptions
} from '#lib/types/index.js';
import { TARGET_YEAR } from '#lib/constants/time.js';
import { TYPES_WITHOUT_DISTANCE } from '#lib/constants/parsing.js';

// Garmin exports contain all three headers after translation.
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
	'Resort Skiing': 'winter',
	'Resort Snowboarding': 'winter',
	'Resort Skiing/Snowboarding': 'winter',
	Skiing: 'winter',
	Snowboarding: 'winter',
	'Backcountry Skiing': 'winter',
	'Backcountry Snowboarding': 'winter',
	'Backcountry Skiing/Snowboarding': 'winter',
	'Cross Country Classic Skiing': 'winter',
	'Cross Country Skate Skiing': 'winter',
	'Cross Country Skiing': 'winter',
	'Skate Skiing': 'winter',
	Snowshoeing: 'winter',
	Skating: 'winter',
	'Ice Skating': 'winter',
	Tennis: 'racket',
	Padel: 'racket',
	Pickleball: 'racket',
	Squash: 'racket',
	Badminton: 'racket',
	'Table Tennis': 'racket',
	Racquetball: 'racket',
	'Platform Tennis': 'racket',
	'Rock Climbing': 'climbing',
	Bouldering: 'climbing',
	'Indoor Climbing': 'climbing',
	Climbing: 'climbing',
	Elliptical: 'cardio',
	'Stair Stepper': 'cardio',
	'Indoor Cardio': 'cardio',
	'Floor Climbing': 'cardio',
	'Jump Rope': 'cardio',
	'Ultra Run': 'running',
	Cyclocross: 'cycling',
	'Track Cycling': 'cycling',
	Multisport: 'other'
};

const SWIM_TYPES = new Set(['Pool Swim', 'Open Water Swimming', 'Swimming']);

/**
 * Parse Garmin time format (HH:MM:SS or MM:SS.S) to seconds
 */
export function parseGarminTime(timeStr: string): number {
	if (!timeStr || timeStr === '--') return 0;

	// Handle MM:SS.S format (e.g., "00:02:10.0")
	const parts = timeStr.replace(',', '.').split(':');
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

function isClockTime(hours: number, minutes: number, seconds: number): boolean {
	// Range check, not a local Date round trip: a real time inside the browser's daylight-saving gap would shift and be rejected.
	return hours <= 23 && minutes <= 59 && seconds <= 59;
}

type DateOrder = 'day-first' | 'month-first';

const SPREADSHEET_DATE = /^(\d{1,2})([/.])(\d{1,2})\2(\d{4}) (\d{1,2}):(\d{2})(?::(\d{2}))?$/;

// Spreadsheet dates keep one order per file, so a single part above 12 settles it for every row.
function detectDateOrder(dates: string[]): DateOrder {
	for (const date of dates) {
		const match = SPREADSHEET_DATE.exec(date.trim());
		if (!match) continue;
		if (Number(match[1]) > 12) return 'day-first';
		if (Number(match[3]) > 12) return 'month-first';
	}
	return 'day-first';
}

/**
 * Parse Garmin or spreadsheet dates, returning null for impossible dates.
 */
export function parseGarminDate(dateStr: string, order: DateOrder = 'day-first'): Date | null {
	const input = dateStr.trim();
	const iso = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(input);
	const local = SPREADSHEET_DATE.exec(input);
	if (!iso && !local) return null;
	const [monthPart, dayPart] = order === 'day-first' ? [3, 1] : [1, 3];
	const [year, month, day, hours, minutes, seconds] = iso
		? iso.slice(1).map(Number)
		: [local![4], local![monthPart], local![dayPart], local![5], local![6], local![7] ?? '0'].map(
				Number
			);
	if (!isCalendarDate(year, month, day) || !isClockTime(hours, minutes, seconds)) return null;
	return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Deduplicate headers in a CSV string to prevent PapaParse warnings
 */
function deduplicateHeaders(csvContent: string): string {
	const lines = csvContent.split(/\r?\n/);
	const headerIndex = findHeaderIndex(lines);
	if (headerIndex === -1) return csvContent;
	const headers = readHeaderCells(lines[headerIndex]);
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

// Moving time drops the rests between sets and pool lengths, which are part of those sessions.
function readDuration(row: GarminRawActivity, includeRests: boolean): number {
	const timer = parseGarminTime(row['Total Time'] || row['Time']);
	return (includeRests ? timer : 0) || parseGarminTime(row['Moving Time']) || timer;
}

function readActivity(
	row: GarminRawActivity,
	date: Date,
	types: Record<string, string>,
	options?: ParseOptions
): Activity {
	const activityType = types[row['Activity Type']] ?? row['Activity Type'];
	const type = mapActivityType(activityType);
	const distanceValue = (row['Distance'] ?? '').trim();
	const meters = /^\d+$/.test(distanceValue) || /^\d{1,3}([.,]\d{3})+$/.test(distanceValue);
	const distance = TYPES_WITHOUT_DISTANCE.has(type)
		? 0
		: meters
			? parseGarminMeterDistance(row['Distance'])
			: parseGarminDistance(row['Distance']);

	const imperial = options?.garminUnits === 'imperial';
	const distanceFactor = imperial
		? meters && SWIM_TYPES.has(activityType)
			? YARDS_TO_METERS
			: meters
				? 1
				: MILES_TO_KM
		: 1;

	return {
		date,
		type,
		title: row['Title'] || '',
		distance: distance * distanceFactor,
		duration: readDuration(row, distance === 0 || activityType === 'Pool Swim'),
		calories: parseGarminCalories(row['Calories']),
		elevation: Math.round(
			parseGarminElevation(row['Total Ascent']) * (imperial ? FEET_TO_METERS : 1)
		),
		favorite: row['Favorite']?.toLowerCase() === 'true'
	};
}

/**
 * Parse a Garmin CSV string and return activities for the specified year
 */
export function parseGarminCsv(
	csvContent: string,
	targetYear: number = TARGET_YEAR,
	options?: ParseOptions
): ParseResult {
	const delimiter = detectDelimiter(firstLine(csvContent));
	if (delimiter === ';') {
		csvContent = Papa.unparse(Papa.parse<string[]>(csvContent, { delimiter: ';' }).data);
	}
	const headers = readHeaderCells(firstLine(csvContent));
	const locale = detectLocale(headers);
	if (locale) {
		const lines = csvContent.split(/\r?\n/);
		const headerIndex = findHeaderIndex(lines);
		if (headerIndex !== -1) {
			lines[headerIndex] = Papa.unparse([
				headers.map((header) => locale.headers[header] ?? header)
			]);
			csvContent = lines.join('\n');
		}
	}

	const firstPass = Papa.parse<string[]>(csvContent, {
		header: false,
		skipEmptyLines: true
	});
	const flattened = flattenWholeRowQuoted(firstPass.data, csvContent);
	const content = flattened ?? csvContent;
	const parsed =
		flattened === null ? firstPass : Papa.parse<string[]>(flattened, { skipEmptyLines: true });
	const dateColumn = (parsed.data[0] ?? []).map((cell) => cell.trim()).indexOf('Date');
	const dateOrder = detectDateOrder(parsed.data.slice(1).map((row) => row[dateColumn] ?? ''));
	const repaired = hasMalformedRows(parsed)
		? repairMalformedQuotes(content)
		: { content, errors: [] };
	return parseRows<GarminRawActivity>(deduplicateHeaders(repaired.content), {
		source: 'garmin',
		year: targetYear,
		header: true,
		skipEmptyLines: true,
		readDate: (row) => row.Date,
		hasRequired: (row) => Boolean(row['Activity Type'] && row.Date),
		missingMessage: 'Missing required column (Activity Type or Date)',
		parseDate: (value) => parseGarminDate(value, dateOrder),
		readActivity: (row, date) => readActivity(row, date, locale?.types ?? {}, options),
		initialErrors: repaired.errors
	});
}

function detectDelimiter(line: string): ',' | ';' {
	let quoted = false;
	let commas = 0;
	let semicolons = 0;
	for (let i = 0; i < line.length; i++) {
		if (line[i] === '"') {
			if (quoted && line[i + 1] === '"') i++;
			else quoted = !quoted;
		} else if (!quoted && line[i] === ',') commas++;
		else if (!quoted && line[i] === ';') semicolons++;
	}
	return semicolons > commas ? ';' : ',';
}

function detectLocale(headers: string[]) {
	if (KEY_HEADERS.every((header) => headers.includes(header))) return undefined;
	return bestLocale(headers, GARMIN_LOCALES);
}

function hasGarminHeaders(csvContent: string): boolean {
	const line = firstLine(csvContent);
	const delimiter = detectDelimiter(line);
	const headers = line
		.replaceAll('"', '')
		.split(delimiter)
		.map((h) => h.trim());
	const locale = detectLocale(headers);
	const translated = new Set(headers.map((header) => locale?.headers[header] ?? header));
	return KEY_HEADERS.every((header) => translated.has(header));
}

export const garminParser: ActivityParser = {
	detect: hasGarminHeaders,
	parse: parseGarminCsv
};
