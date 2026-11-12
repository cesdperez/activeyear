import { SITE_NAME } from '#lib/constants/site.js';
import { SAVED_YEAR_VERSION } from '#lib/constants/savedYear.js';
import { sportNames } from '#lib/constants/sports.js';
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
	year: number
): string {
	return JSON.stringify({
		version: SAVED_YEAR_VERSION,
		year,
		source,
		activities: activities.map((activity) => ({ ...activity, date: localDate(activity.date) }))
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
		!Object.hasOwn(sportNames, item.type) ||
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

export function parseSavedYear(
	json: string,
	year: number
):
	| { ok: true; activities: Activity[]; source: ActivitySource | null }
	| { ok: false; error: SavedYearError } {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return { ok: false, error: { type: 'invalid-file' } };
	}
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
	if (activities.some((activity) => activity === null))
		return { ok: false, error: { type: 'invalid-activities' } };
	return { ok: true, activities: activities as Activity[], source: data.source };
}

export function savedYearErrorMessage(error: SavedYearError): string {
	switch (error.type) {
		case 'unsupported-version':
			return `This saved year is from an older or newer version of ${SITE_NAME}`;
		case 'wrong-year':
			return typeof error.year === 'number' && Number.isFinite(error.year)
				? `This file holds your ${error.year} year, not ${error.expected}`
				: `This file is not a saved ${SITE_NAME} year`;
		default:
			return `This file is not a saved ${SITE_NAME} year`;
	}
}
