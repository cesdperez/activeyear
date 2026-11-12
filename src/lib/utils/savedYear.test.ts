import { describe, expect, it } from 'vitest';
import {
	parseSavedYear,
	savedYearErrorMessage,
	savedYearFileName,
	serializeSavedYear
} from './savedYear.js';
import type { Activity } from '#lib/types/index.js';

const activity: Activity = {
	date: new Date(2026, 2, 4, 5, 6, 7),
	type: 'running',
	title: 'Run',
	distance: 5,
	duration: 1800,
	calories: 300,
	elevation: 10,
	favorite: true
};
const valid = {
	version: 1,
	year: 2026,
	source: 'garmin',
	activities: [{ ...activity, date: '2026-03-04T05:06:07' }]
};

describe('saved year', () => {
	it('round trips local dates and all activity fields', () => {
		const json = serializeSavedYear([activity], 'garmin', 2026);
		expect(JSON.parse(json).activities[0].date).toBe('2026-03-04T05:06:07');
		expect(parseSavedYear(json, 2026)).toEqual({
			ok: true,
			activities: [activity],
			source: 'garmin'
		});
		expect(savedYearFileName(2026)).toBe('activeyear-2026.json');
	});
	it.each(['[]', '{}', 'null', '{"foo":1}'])('rejects a non-saved file %s', (json) => {
		expect(parseSavedYear(json, 2026)).toEqual({ ok: false, error: { type: 'invalid-file' } });
	});

	it('reports errors in order', () => {
		expect(parseSavedYear('{', 2026)).toEqual({ ok: false, error: { type: 'invalid-file' } });
		expect(parseSavedYear(JSON.stringify({ version: 2 }), 2026)).toEqual({
			ok: false,
			error: { type: 'unsupported-version', version: 2 }
		});
		expect(parseSavedYear(JSON.stringify({ version: 1, year: 2025 }), 2026)).toEqual({
			ok: false,
			error: { type: 'wrong-year', year: 2025, expected: 2026 }
		});
		expect(parseSavedYear(JSON.stringify({ ...valid, activities: [] }), 2026)).toEqual({
			ok: false,
			error: { type: 'invalid-activities' }
		});
		expect(savedYearErrorMessage({ type: 'wrong-year', year: 2025, expected: 2026 })).toContain(
			'2025'
		);
	});
	it.each([
		{ date: '2026-02-30T05:06:07' },
		{ date: '2026-03-04T05:06:07Z' },
		{ type: 'bad' },
		{ title: 2 },
		{ distance: -1 },
		{ duration: null },
		{ calories: '1' },
		{ elevation: -1 },
		{ favorite: 1 }
	])('rejects invalid activity %j', (change) => {
		expect(
			parseSavedYear(
				JSON.stringify({ ...valid, activities: [{ ...valid.activities[0], ...change }] }),
				2026
			)
		).toEqual({ ok: false, error: { type: 'invalid-activities' } });
	});
	it('rejects invalid sources and ignores unknown fields', () => {
		expect(parseSavedYear(JSON.stringify({ ...valid, source: 'other' }), 2026).ok).toBe(false);
		expect(
			parseSavedYear(
				JSON.stringify({
					...valid,
					extra: true,
					activities: [{ ...valid.activities[0], extra: true }]
				}),
				2026
			)
		).toEqual({ ok: true, activities: [activity], source: 'garmin' });
	});
});
