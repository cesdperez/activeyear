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

// Garmin localises headers, so other languages miss these.
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
export function parseGarminMeterDistance(distanceStr: string): number {
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

/**
 * Parse Garmin date format (YYYY-MM-DD HH:MM:SS) to Date
 */
export function parseGarminDate(dateStr: string): Date | null {
	if (!dateStr) return null;
	const date = new Date(dateStr);
	return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is in the target year
 */
export function isInYear(date: Date, year: number): boolean {
	return date.getFullYear() === year;
}

/**
 * Deduplicate headers in a CSV string to prevent PapaParse warnings
 */
function deduplicateHeaders(csvContent: string): string {
	const lines = csvContent.split(/\r?\n/);
	if (lines.length === 0) return csvContent;

	const headerLine = lines[0];
	const parseResult = Papa.parse<string[]>(headerLine, { header: false });
	const headers = parseResult.data[0];

	if (!headers) return csvContent;

	const seen = new Set<string>();
	const deduplicatedHeaders = headers.map((h) => {
		const trimmed = h.trim();
		let final = trimmed;
		let i = 1;
		while (seen.has(final)) {
			final = `${trimmed}_${i++}`;
		}
		seen.add(final);
		return final;
	});

	lines[0] = Papa.unparse([deduplicatedHeaders]);
	return lines.join('\n');
}

/**
 * Parse a Garmin CSV string and return activities for the specified year
 */
export function parseGarminCsv(csvContent: string, targetYear: number = TARGET_YEAR): ParseResult {
	const activities: Activity[] = [];
	const errors: ParseError[] = [];

	// Preprocess content if it appears to be "whole-row quoted"
	// This happens when some tools wrap each CSV row in quotes and escape internal quotes.
	// We use a two-pass approach:
	// 1. Parse as headerless CSV to correctly handle quotes and internal newlines.
	// 2. If most rows have only 1 column, it's the weird format. Flatten it and re-parse.

	let processedContent = csvContent;
	const firstPass = Papa.parse<string[]>(csvContent, {
		header: false,
		skipEmptyLines: true
	});

	if (firstPass.data.length > 0) {
		// Whole-row quoted format: most data rows parse as one column. The header may be unquoted.
		const dataRows = firstPass.data.slice(1);
		const quotedDataRows = dataRows.filter((row) => row.length === 1).length;

		if (quotedDataRows > dataRows.length / 2 && dataRows.length > 0) {
			// It's likely the whole-row quoted format. Flatten it.
			const processedRows = firstPass.data.map((row) => {
				if (row.length === 1) return row[0];
				// If it already has multiple columns (like an unquoted header),
				// we reconstruct it as CSV to keep it consistent for the second pass.
				return row
					.map((cell) => {
						const cellStr = String(cell);
						if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
							return `"${cellStr.replace(/"/g, '""')}"`;
						}
						return cellStr;
					})
					.join(',');
			});
			processedContent = processedRows.join('\n');
		}
	}

	const parseResult = Papa.parse<GarminRawActivity>(deduplicateHeaders(processedContent), {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	if (parseResult.errors.length > 0) {
		parseResult.errors.forEach((error) => {
			errors.push({
				type: 'unknown',
				row: error.row ?? 0,
				message: error.message
			});
		});
	}

	parseResult.data.forEach((row, index) => {
		const rowNum = index + 2; // +2 because of header row and 1-indexing

		// Check required columns
		if (!row['Activity Type'] || !row['Date']) {
			errors.push({
				type: 'missing-column',
				row: rowNum,
				message: 'Missing required column (Activity Type or Date)'
			});
			return;
		}

		// Parse date
		const date = parseGarminDate(row['Date']);
		if (!date) {
			errors.push({
				type: 'invalid-date',
				row: rowNum,
				message: `Invalid date format: ${row['Date']}`
			});
			return;
		}

		// Filter to target year
		if (!isInYear(date, targetYear)) {
			return;
		}

		const distance = DISTANCE_IN_METERS_TYPES.has(row['Activity Type'])
			? parseGarminMeterDistance(row['Distance'])
			: parseGarminDistance(row['Distance']);

		const activity: Activity = {
			date,
			type: mapActivityType(row['Activity Type']),
			title: row['Title'] || '',
			distance,
			duration: parseGarminTime(row['Total Time'] || row['Time']),
			calories: parseGarminCalories(row['Calories']),
			elevation: parseGarminElevation(row['Total Ascent']),
			favorite: row['Favorite']?.toLowerCase() === 'true'
		};

		activities.push(activity);
	});

	return { activities, errors };
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
	return KEY_HEADERS.filter((h) => headers.has(h)).length > 1;
}

export const garminParser: ActivityParser = {
	detect: hasGarminHeaders,
	parse: parseGarminCsv
};
