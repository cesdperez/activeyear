import { STRAVA_LOCALES } from './stravaLocales.js';
import {
	bestLocale,
	firstLine,
	readHeaderCells,
	isCalendarDate,
	parseRows,
	emptyResult
} from './csv.js';
import { TYPES_WITHOUT_DISTANCE } from '#lib/constants/parsing.js';
import type {
	Activity,
	ActivityParser,
	ActivityType,
	ParseResult,
	StravaLocale
} from '#lib/types/index.js';

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
	'Alpine Ski': 'winter',
	'Backcountry Ski': 'winter',
	'Nordic Ski': 'winter',
	Snowboard: 'winter',
	Snowshoe: 'winter',
	'Ice Skate': 'winter',
	Tennis: 'racket',
	Padel: 'racket',
	Pickleball: 'racket',
	Squash: 'racket',
	Badminton: 'racket',
	Racquetball: 'racket',
	'Table Tennis': 'racket',
	'Rock Climb': 'climbing',
	Kayaking: 'paddling',
	Canoeing: 'paddling',
	'Stand Up Paddling': 'paddling'
};

function readHeaders(csv: string): string[] {
	return readHeaderCells(firstLine(csv));
}

function hasEnglishHeaders(headers: string[]): boolean {
	return KEY_HEADERS.every((header) => headers.includes(header));
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
	if (!isCalendarDate(year, month + 1, day)) return null;
	// Activity Date is UTC.
	return new Date(
		Date.UTC(year, month, day, (hour % 12) + (match[7] === 'PM' ? 12 : 0), minute, second)
	);
}

function parseLocalizedDate(value: string, locale: StravaLocale): Date | null {
	const text = value.trim().replace(/[\u00a0\u202f]/g, ' ');
	const numeric = /^(\d{1,2})\.(\d{1,2})\.(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})$/.exec(text);
	const named =
		/^(\d{1,2})\s+(?:de\s+)?([\p{L}]+)\.?\s+(?:de\s+)?(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})(?:\s+([ap])\.\s*m\.)?$/iu.exec(
			text
		);
	const match = locale.months.length ? named : numeric;
	if (!match) return null;
	const day = Number(match[1]);
	const month = locale.months.length
		? locale.months.indexOf(
				match[2].toLowerCase() === 'sept' && locale.months[8] === 'sep'
					? 'sep'
					: match[2].toLowerCase()
			) + 1
		: Number(match[2]);
	const year = Number(match[3]);
	let hour = Number(match[4]);
	const minute = Number(match[5]);
	const second = Number(match[6]);
	const period = match[7]?.toLowerCase();
	if (
		minute > 59 ||
		second > 59 ||
		(period ? hour < 1 || hour > 12 : hour > 23) ||
		!isCalendarDate(year, month, day)
	)
		return null;
	if (period) hour = (hour % 12) + (period === 'p' ? 12 : 0);
	return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function parseNumber(value: string | undefined): number {
	if (!value?.trim()) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function unsupportedLanguageExportResult(): ParseResult {
	return emptyResult('strava', {
		type: 'unsupported-format',
		reason: 'strava-unsupported-language',
		row: 0,
		message:
			"This Strava export is in a language we can't read yet. Set Strava to English, Spanish, German, French, Italian, Dutch or Portuguese, request a new archive, and upload its activities.csv."
	});
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
	date: Date,
	locale?: StravaLocale
): Activity {
	const type = ACTIVITY_TYPES[locale?.types[data[columns.type]] ?? data[columns.type]] ?? 'other';
	return {
		date,
		type,
		title: data[columns.name] ?? '',
		distance: TYPES_WITHOUT_DISTANCE.has(type) ? 0 : parseNumber(data[columns.distance]) / 1000,
		duration: parseNumber(data[columns.movingTime]),
		elevation: Math.round(parseNumber(data[columns.elevation])),
		calories: Math.round(parseNumber(data[columns.calories])),
		favorite: false
	};
}

function parse(csv: string, year: number): ParseResult {
	const headers = readHeaders(csv);
	const locale = hasEnglishHeaders(headers) ? undefined : bestLocale(headers, STRAVA_LOCALES);
	const translated = locale ? headers.map((header) => locale.headers[header] ?? header) : headers;
	if (!KEY_HEADERS.every((header) => translated.includes(header)))
		return unsupportedLanguageExportResult();

	const columns = columnIndexes(translated);
	return parseRows<string[]>(csv, {
		source: 'strava',
		year,
		header: false,
		skipEmptyLines: 'greedy',
		readDate: (data) => data[columns.date],
		hasRequired: (data) => Boolean(data[columns.type] && data[columns.date]),
		missingMessage: 'Missing required column (Activity Type or Activity Date)',
		parseDate: (value) => (locale ? parseLocalizedDate(value, locale) : parseStravaDate(value)),
		readActivity: (data, date) => readActivity(data, columns, date, locale),
		// A broken quote reads on to the next quote mark, so swallowed rows count as one skipped row.
		// Descriptions span lines, so there is no line boundary to resync on.
		quoteError: (row) => ({
			type: 'malformed-quotes',
			row,
			message: `Skipped row ${row} because its quote marks could not be read.`
		})
	});
}

/** Detects English and localized Strava exports, including unsupported languages. */
export const stravaParser: ActivityParser = {
	detect: (csv) => {
		const headers = readHeaders(csv);
		const locale = bestLocale(headers, STRAVA_LOCALES);
		return (
			hasEnglishHeaders(headers) ||
			KEY_HEADERS.every((header) => headers.some((cell) => locale?.headers[cell] === header)) ||
			ACTIVITY_FILENAME.test(csv.slice(0, 65536))
		);
	},
	parse
};
