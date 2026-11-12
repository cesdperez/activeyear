import Papa from 'papaparse';
import type { ActivityParser, ActivityType, ParseError, ParseResult } from '#lib/types/index.js';

const KEY_HEADERS = ['Activity Date', 'Activity Type', 'Moving Time'];
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

function headers(csv: string): string[] {
	const line = csv.split(/\r?\n/).find((part) => part.trim());
	return (Papa.parse<string[]>(line ?? '').data[0] ?? []).map((value) => value.trim());
}
function hasEnglishHeaders(csv: string): boolean {
	const found = headers(csv);
	return KEY_HEADERS.every((header) => found.includes(header));
}
function parseDate(value: string): Date | null {
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
	const date = new Date(
		Date.UTC(year, month, day, (hour % 12) + (match[7] === 'PM' ? 12 : 0), minute, second)
	);
	return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day
		? date
		: null;
}
function number(value: string | undefined): number {
	if (!value?.trim()) return 0;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
function parse(csv: string, year: number): ParseResult {
	if (!hasEnglishHeaders(csv))
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
	const result: ParseResult = { activities: [], errors: [], yearsInFile: [] };
	const years = new Set<number>();
	let columns: string[] | undefined;
	let previousCursor = 0;
	let line = 1;
	Papa.parse<string[]>(csv, {
		skipEmptyLines: true,
		step: ({ data, errors, meta }) => {
			const segment = csv.slice(previousCursor, meta.cursor);
			const leading = segment.match(/^(?:\s*\r?\n)*/)?.[0] ?? '';
			const rowLine = line + (leading.match(/\n/g)?.length ?? 0);
			line += segment.match(/\n/g)?.length ?? 0;
			previousCursor = meta.cursor;
			if (!columns) {
				columns = data.map((value) => value.trim());
				return;
			}
			const get = (name: string) => data[columns!.indexOf(name)] ?? '';
			for (const error of errors)
				result.errors.push({ type: 'unknown', row: rowLine, message: error.message } as ParseError);
			const type = get('Activity Type');
			const dateText = get('Activity Date');
			if (!type || !dateText) {
				result.errors.push({
					type: 'missing-column',
					row: rowLine,
					message: 'Missing required column (Activity Type or Activity Date)'
				});
				return;
			}
			const date = parseDate(dateText);
			if (!date) {
				result.errors.push({ type: 'invalid-date', row: rowLine, message: 'Invalid date format' });
				return;
			}
			years.add(date.getFullYear());
			if (date.getFullYear() !== year) return;
			result.activities.push({
				date,
				type: ACTIVITY_TYPES[type] ?? 'other',
				title: get('Activity Name'),
				distance: number(data[columns.lastIndexOf('Distance')]) / 1000,
				duration: number(get('Moving Time')),
				elevation: Math.round(number(get('Elevation Gain'))),
				calories: Math.round(number(get('Calories'))),
				favorite: false
			});
		}
	});
	result.yearsInFile = [...years].sort((a, b) => a - b);
	return result;
}
export const stravaParser: ActivityParser = {
	detect: (csv) =>
		hasEnglishHeaders(csv) ||
		/(?:^|[",\r\n])activities\/\d+\.(?:fit|gpx|tcx)(?:\.gz)?(?=$|[",\r\n])/i.test(
			csv.slice(0, 65536)
		),
	parse
};
