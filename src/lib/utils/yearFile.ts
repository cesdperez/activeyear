import { parseActivityCsv } from '#lib/parsers/index.js';
import type { GarminUnits, YearFileResult } from '#lib/types/index.js';
import { cutShortFrom } from './cutShort.js';
import { parseSavedYear } from './savedYear.js';
import { describeUnusableFile } from './uploadErrors.js';

export function hasYearFileExtension(name: string): boolean {
	return /\.(csv|json)$/i.test(name);
}

export function loadYearFile(
	name: string,
	content: string,
	year: number,
	options?: { garminUnits?: GarminUnits }
): YearFileResult {
	if (!hasYearFileExtension(name)) {
		return { type: 'failed', event: 'unsupported-file-type', error: { type: 'invalid-extension' } };
	}
	if (name.toLowerCase().endsWith('.json')) {
		const saved = parseSavedYear(content, year);
		if (!saved.ok) return { type: 'failed', event: 'invalid-saved-year', error: saved.error };
		return {
			type: 'loaded',
			activities: saved.activities,
			source: saved.source,
			cutShort: null,
			parseErrors: []
		};
	}
	const result = parseActivityCsv(content, year, options);
	const unreadable = result.errors.find((error) => error.type === 'unsupported-format');
	if (unreadable) {
		return {
			type: 'failed',
			event: 'unsupported-format',
			error: { type: unreadable.reason ?? 'unrecognised' },
			parseErrors: result.errors
		};
	}
	if (result.activities.length === 0) {
		const error = describeUnusableFile(result, year);
		return { type: 'failed', event: error.type, error, parseErrors: result.errors };
	}
	return {
		type: 'loaded',
		activities: result.activities,
		source: result.source,
		cutShort: cutShortFrom(result, year),
		parseErrors: result.errors
	};
}
