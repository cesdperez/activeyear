import { describe, expect, it } from 'vitest';
import { serializeSavedYear } from './savedYear.js';
import { hasYearFileExtension, loadYearFile } from './yearFile.js';

const year = 2025;
const header = 'Activity Type,Date,Title,Distance,Calories,Time,Total Ascent';
const row = (date: string) => `Running,${date},Run,10.0,600,00:50:00,100`;
const csv = (date: string) => `${header}\n${row(date)}`;

describe('year file loading', () => {
	it.each([
		['a.csv', true],
		['a.JSON', true],
		['a.CsV', true],
		['a.csv.txt', false],
		['json', false]
	])('checks the extension of %s', (name, expected) =>
		expect(hasYearFileExtension(name)).toBe(expected)
	);

	it('rejects unsupported extensions without parse errors', () => {
		expect(loadYearFile('file.txt', '', year)).toEqual({
			type: 'failed',
			event: 'unsupported-file-type',
			error: { type: 'invalid-extension' }
		});
	});

	it('rejects invalid saved years without parse errors', () => {
		expect(loadYearFile('year.json', '{', year)).toEqual({
			type: 'failed',
			event: 'invalid-saved-year',
			error: { type: 'invalid-file' }
		});
	});

	it('loads a saved year', () => {
		const loaded = loadYearFile('activities.csv', csv('2025-03-01 08:00:00'), year);
		if (loaded.type !== 'loaded') throw new Error('Expected activities');
		const json = serializeSavedYear(loaded.activities, loaded.source, year);
		expect(loadYearFile('year.JSON', json, year)).toEqual({
			type: 'loaded',
			activities: loaded.activities,
			source: 'garmin',
			cutShort: null,
			parseErrors: []
		});
	});

	it('reports unrecognised CSV with parse errors', () => {
		expect(loadYearFile('scores.csv', 'name,score\nAna,3', year)).toEqual({
			type: 'failed',
			event: 'unsupported-format',
			error: { type: 'unrecognised' },
			parseErrors: [expect.objectContaining({ type: 'unsupported-format' })]
		});
	});

	it.each([
		['bad', 'rows-rejected'],
		['2024-03-01 08:00:00', 'no-activities-in-year']
	])('reports unusable CSV for %s', (date, type) => {
		const result = loadYearFile('activities.csv', csv(date), year);
		expect(result).toMatchObject({
			type: 'failed',
			event: type,
			error: { type },
			parseErrors: expect.any(Array)
		});
	});

	it('loads activities and preserves row errors', () => {
		const result = loadYearFile(
			'activities.CSV',
			`${csv('2025-03-01 08:00:00')}\n${row('bad')}`,
			year
		);
		expect(result).toMatchObject({
			type: 'loaded',
			source: 'garmin',
			cutShort: null,
			activities: [expect.objectContaining({ title: 'Run', distance: 10 })],
			parseErrors: [expect.objectContaining({ type: 'invalid-date' })]
		});
	});
});
