import { messages } from '#lib/i18n/messages/index.js';
import type { Locale } from '#lib/types/index.js';
import { SAVED_YEAR_VERSION } from '#lib/constants/savedYear.js';
import { ACTIVITY_TYPES } from '#lib/constants/sports.js';
import type { Activity, ActivitySource, ActivityType, SavedYearError } from '#lib/types/index.js';

export function savedYearFileName(year: number): string {
	return `activeyear-${year}.json`;
}

function localDate(date: Date): string {
	const pad = (value: number, length = 2) => String(value).padStart(length, '0');
	return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function serializeSavedYear(
	activities: Activity[],
	source: ActivitySource | null,
	year: number,
	cutShort: Date | null
): string {
	return JSON.stringify({
		version: SAVED_YEAR_VERSION,
		year,
		source,
		// Optional within the version: files saved without it read as not cut short.
		cutShort: cutShort && localDate(cutShort),
		activities: activities.map((activity) => ({
			...activity,
			date: localDate(activity.date),
			distance: Number.isFinite(activity.distance) ? activity.distance : 0,
			duration: Number.isFinite(activity.duration) ? activity.duration : 0,
			calories: Number.isFinite(activity.calories) ? activity.calories : 0,
			elevation: Number.isFinite(activity.elevation) ? activity.elevation : 0
		}))
	});
}

function parseDate(value: unknown): Date | null {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value))
		return null;
	const [year, month, day, hour, minute, second] = value.match(/\d+/g)!.map(Number);
	const date = new Date(year, month - 1, day, hour, minute, second);
	return localDate(date) === value ? date : null;
}

function parseActivity(value: unknown): Activity | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const item = value as Record<string, unknown>;
	const date = parseDate(item.date);
	if (
		!date ||
		typeof item.type !== 'string' ||
		!(ACTIVITY_TYPES as readonly string[]).includes(item.type) ||
		typeof item.title !== 'string' ||
		typeof item.favorite !== 'boolean'
	)
		return null;
	for (const key of ['distance', 'duration', 'calories', 'elevation']) {
		if (typeof item[key] !== 'number' || !Number.isFinite(item[key]) || (item[key] as number) < 0)
			return null;
	}
	return {
		date,
		type: item.type as ActivityType,
		title: item.title,
		distance: item.distance as number,
		duration: item.duration as number,
		calories: item.calories as number,
		elevation: item.elevation as number,
		favorite: item.favorite
	};
}

// Garmin's account data export holds activities in *_summarizedActivities.json.
function isGarminDataExport(parsed: unknown): boolean {
	return (
		Array.isArray(parsed) &&
		parsed.some((item) => item && typeof item === 'object' && 'summarizedActivitiesExport' in item)
	);
}

export function parseSavedYear(
	json: string,
	year: number
):
	| { ok: true; activities: Activity[]; source: ActivitySource | null; cutShort: Date | null }
	| { ok: false; error: SavedYearError } {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return { ok: false, error: { type: 'invalid-file' } };
	}
	if (isGarminDataExport(parsed)) return { ok: false, error: { type: 'garmin-data-export' } };
	if (
		!parsed ||
		typeof parsed !== 'object' ||
		Array.isArray(parsed) ||
		!Object.hasOwn(parsed, 'version')
	)
		return { ok: false, error: { type: 'invalid-file' } };
	const data = parsed as Record<string, unknown>;
	if (data.version !== SAVED_YEAR_VERSION)
		return { ok: false, error: { type: 'unsupported-version', version: data.version } };
	if (data.year !== year)
		return { ok: false, error: { type: 'wrong-year', year: data.year, expected: year } };
	if (
		!Array.isArray(data.activities) ||
		data.activities.length === 0 ||
		(data.source !== null && data.source !== 'garmin' && data.source !== 'strava')
	)
		return { ok: false, error: { type: 'invalid-activities' } };
	const activities = data.activities.map(parseActivity);
	if (activities.some((activity) => activity === null || activity.date.getFullYear() !== year))
		return { ok: false, error: { type: 'invalid-activities' } };
	return {
		ok: true,
		activities: activities as Activity[],
		source: data.source,
		cutShort: parseDate(data.cutShort)
	};
}

export function savedYearErrorMessage(error: SavedYearError, locale: Locale = 'en'): string {
	switch (error.type) {
		case 'garmin-data-export':
			return messages(locale).upload.garminDataExport;
		case 'unsupported-version':
			return messages(locale).upload.unsupportedVersion;
		case 'wrong-year':
			return typeof error.year === 'number' && Number.isFinite(error.year)
				? messages(locale).upload.wrongYear(error.year, error.expected)
				: messages(locale).upload.invalidSaved;
		default:
			return messages(locale).upload.invalidSaved;
	}
}
