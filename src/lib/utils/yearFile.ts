import { parseActivityCsv } from '#lib/parsers/index.js';
import type { GarminUnits, UploadError, YearFileResult } from '#lib/types/index.js';
import { cutShortFrom } from './cutShort.js';
import { parseSavedYear } from './savedYear.js';
import { describeUnusableFile } from './uploadErrors.js';

export function hasYearFileExtension(name: string): boolean {
	return /\.(csv|json)$/i.test(name);
}

const ZIP_SIGNATURE = 'PK\u0003\u0004';

/** The error for a file whose name or content shows it cannot hold a year. */
export function unsupportedFileError(name: string, content = ''): UploadError | null {
	if (/\.zip$/i.test(name) || content.startsWith(ZIP_SIGNATURE)) return { type: 'zip-archive' };
	return hasYearFileExtension(name) ? null : { type: 'invalid-extension' };
}

export function isSavedYearFileName(name: string): boolean {
	return name.toLowerCase().endsWith('.json');
}

export function loadYearFile(
	name: string,
	content: string,
	year: number,
	options?: { garminUnits?: GarminUnits }
): YearFileResult {
	const unsupported = unsupportedFileError(name, content);
	if (unsupported) return { type: 'failed', event: 'unsupported-file-type', error: unsupported };
	if (isSavedYearFileName(name)) {
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
