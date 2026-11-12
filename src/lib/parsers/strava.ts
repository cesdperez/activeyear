import Papa from 'papaparse';
import type { Activity, ActivityParser, ActivityType, ParseResult } from '#lib/types/index.js';

const KEY_HEADERS = ['Activity Date', 'Activity Type', 'Moving Time'];
// Localized exports translate headers but keep activities/<id>.fit.gz filenames.
const ACTIVITY_FILENAME = /(?:^|[",\r\n])activities\/\d+\.(?:fit|gpx|tcx)(?:\.gz)?(?=$|[",\r\n])/i;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ACTIVITY_TYPES: Record<string, ActivityType> = {
	Run: 'running',
	'Virtual Run': 'running',
	'Trail Run': 'running',
	Ride: 'cycling',
	'Virtual Ride': 'cycling',
	'E-Bike Ride': 'cycling',
	'Mountain Bike Ride': 'cycling',
	'Gravel Ride': 'cycling',
	'E-Mountain Bike Ride': 'cycling',
	Swim: 'swimming',
	Walk: 'walking',
	Hike: 'hiking',
	'Weight Training': 'strength',
	Yoga: 'yoga',
	Pilates: 'yoga',
	Elliptical: 'cardio',
	'Stair-Stepper': 'cardio',
	HIIT: 'cardio',
	Crossfit: 'cardio',
	Rowing: 'rowing',
	'Virtual Row': 'rowing',
	Kayaking: 'paddling',
	Canoeing: 'paddling',
	'Stand Up Paddling': 'paddling'
};

function readHeaders(csv: string): string[] {
	const line = csv.trimStart().split(/\r?\n/, 1)[0];
	return (Papa.parse<string[]>(line ?? '').data[0] ?? []).map((value) => value.trim());
}

function hasEnglishHeaders(csv: string): boolean {
	const found = readHeaders(csv);
	return KEY_HEADERS.every((header) => found.includes(header));
}

function parseStravaDate(value: string): Date | null {
	const match =
		/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/.exec(
			value.trim()
		);
	if (!match) return null;
	const month = MONTHS.indexOf(match[1]);
	const day = Number(match[2]);
	const year = Number(match[3]);
	const hour = Number(match[4]);
	const minute = Number(match[5]);
	const second = Number(match[6]);
	if (hour < 1 || hour > 12 || minute > 59 || second > 59) return null;
	// Activity Date is UTC.
	const date = new Date(
		Date.UTC(year, month, day, (hour % 12) + (match[7] === 'PM' ? 12 : 0), minute, second)
	);
	return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
		? date
		: null;
}

function parseNumber(value: string | undefined): number {
	if (!value?.trim()) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function nonEnglishExportResult(): ParseResult {
	return {
		activities: [],
		yearsInFile: [],
		errors: [
			{
				type: 'unsupported-format',
				row: 0,
				message:
					"This Strava export isn't in English. Set your Strava language to English, request a new archive, and upload its activities.csv."
			}
		]
	};
}

function columnIndexes(columns: string[]) {
	return {
		date: columns.indexOf('Activity Date'),
		name: columns.indexOf('Activity Name'),
		type: columns.indexOf('Activity Type'),
		movingTime: columns.indexOf('Moving Time'),
		elevation: columns.indexOf('Elevation Gain'),
		calories: columns.indexOf('Calories'),
		// The last Distance is metres; the first is display text.
		distance: columns.lastIndexOf('Distance')
	};
}

function readActivity(
	data: string[],
	columns: ReturnType<typeof columnIndexes>,
	date: Date
): Activity {
	return {
		date,
		type: ACTIVITY_TYPES[data[columns.type]] ?? 'other',
		title: data[columns.name] ?? '',
		distance: parseNumber(data[columns.distance]) / 1000,
		duration: parseNumber(data[columns.movingTime]),
		elevation: Math.round(parseNumber(data[columns.elevation])),
		calories: Math.round(parseNumber(data[columns.calories])),
		favorite: false
	};
}

function rowStartLine(segment: string, line: number): number {
	const leading = segment.match(/^(?:\s*\r?\n)*/)?.[0] ?? '';
	return line + (leading.match(/\n/g)?.length ?? 0);
}

function readRows(
	csv: string,
	onRow: (data: string[], line: number, errors: Papa.ParseError[]) => void
): void {
	let previousCursor = 0;
	let line = 1;
	let header = true;
	Papa.parse<string[]>(csv, {
		skipEmptyLines: 'greedy',
		step: ({ data, errors, meta }) => {
			const segment = csv.slice(previousCursor, meta.cursor);
			const rowLine = rowStartLine(segment, line);
			line += segment.match(/\n/g)?.length ?? 0;
			previousCursor = meta.cursor;
			if (header) {
				header = false;
				return;
			}
			onRow(data, rowLine, errors);
		}
	});
}

function parse(csv: string, year: number): ParseResult {
	if (!hasEnglishHeaders(csv)) return nonEnglishExportResult();

	const columns = columnIndexes(readHeaders(csv));
	const result: ParseResult = { activities: [], errors: [], yearsInFile: [] };
	const years = new Set<number>();
	readRows(csv, (data, rowLine, errors) => {
		if (errors.some((error) => error.type === 'Quotes')) {
			result.errors.push({
				type: 'malformed-quotes',
				row: rowLine,
				message: `Skipped row ${rowLine} because its quote marks could not be read.`
			});
			return;
		}
		for (const error of errors)
			result.errors.push({ type: 'unknown', row: rowLine, message: error.message });

		const type = data[columns.type] ?? '';
		const dateText = data[columns.date] ?? '';
		if (!type || !dateText) {
			result.errors.push({
				type: 'missing-column',
				row: rowLine,
				message: 'Missing required column (Activity Type or Activity Date)'
			});
			return;
		}
		const date = parseStravaDate(dateText);
		if (!date) {
			result.errors.push({ type: 'invalid-date', row: rowLine, message: 'Invalid date format' });
			return;
		}
		years.add(date.getFullYear());
		if (date.getFullYear() === year) result.activities.push(readActivity(data, columns, date));
	});
	result.yearsInFile = [...years].sort((a, b) => a - b);
	return result;
}

/** Also detects localized Strava exports so they can be rejected with English-language guidance. */
export const stravaParser: ActivityParser = {
	detect: (csv) => hasEnglishHeaders(csv) || ACTIVITY_FILENAME.test(csv.slice(0, 65536)),
	parse
};
