import { afterEach, describe, expect, it, vi } from 'vitest';
import { stravaParser } from './strava.js';
import { parseActivityCsv } from './index.js';
import { loadFixture } from './__fixtures__/load.js';

const header =
	'Activity Date,Activity Name,Activity Type,Elapsed Time,Distance,Moving Time,Distance,Elevation Gain,Calories,Description';
const row = (date: string, type = 'Run', description = '') =>
	`"${date}",Title,${type},200,"1,450",100,1450.0,12.6,20.4,${description}`;

describe('Strava parser', () => {
	afterEach(() => vi.unstubAllEnvs());

	it('parses the anonymised export and totals its metric columns', () => {
		const result = stravaParser.parse(loadFixture('strava-activities.csv'), 2026);
		expect(result.errors).toEqual([]);
		expect(result.activities).toHaveLength(26);
		expect(result.yearsInFile).toEqual([2023, 2024, 2025, 2026]);
		expect(result.activities.reduce((sum, a) => sum + a.distance, 0)).toBeCloseTo(60.8986);
		expect(result.activities.reduce((sum, a) => sum + a.duration, 0)).toBe(67219);
		expect(result.activities.reduce((sum, a) => sum + a.elevation, 0)).toBe(1013);
	});
	it('uses metres and moving time', () => {
		const activity = stravaParser.parse(
			`${header}\n${row('Oct 31, 2026, 9:49:58 AM', 'Swim')}`,
			2026
		).activities[0];
		expect(activity).toMatchObject({
			distance: 1.45,
			duration: 100,
			elevation: 13,
			calories: 20,
			favorite: false
		});
		expect(activity.date.getTime()).toBe(Date.UTC(2026, 9, 31, 9, 49, 58));
	});
	it('validates dates and counts lines inside quoted descriptions', () => {
		const csv = [
			header,
			row('Oct 31, 2026, 12:05:00 AM', 'Run', '"hello\nworld 😀"'),
			row('Oct 31, 2026, 12:05:00 PM'),
			row('Feb 30, 2026, 1:00:00 PM'),
			row('Oct 31, 2026, 13:00:00 PM'),
			row('2026-10-31')
		].join('\n');
		const result = stravaParser.parse(csv, 2026);
		expect(result.activities.map((a) => a.date.getUTCHours())).toEqual([0, 12]);
		expect(result.errors.map((e) => [e.type, e.row])).toEqual([
			['invalid-date', 5],
			['invalid-date', 6],
			['invalid-date', 7]
		]);
	});
	it.each([
		['Europe/Amsterdam', 2, 0],
		['America/New_York', 1, 1]
	])('filters New Year instants in %s', (zone, in2026, in2025) => {
		vi.stubEnv('TZ', zone);
		const csv = [header, row('Jan 1, 2026, 6:21:05 PM'), row('Dec 31, 2025, 11:30:00 PM')].join(
			'\n'
		);
		expect(stravaParser.parse(csv, 2026).activities).toHaveLength(in2026);
		expect(stravaParser.parse(csv, 2025).activities).toHaveLength(in2025);
	});
	it('skips malformed quoted rows', () => {
		const csv = [
			header,
			row('Jan 1, 2026, 6:21:05 PM'),
			row('Jan 2, 2026, 6:21:05 PM', 'Run', '"broken'),
			row('Jan 3, 2026, 6:21:05 PM')
		].join('\n');
		const result = stravaParser.parse(csv, 2026);
		expect(result.activities).toHaveLength(1);
		expect(result.errors).toEqual([
			{
				type: 'malformed-quotes',
				row: 3,
				message: 'Skipped row 3 because its quote marks could not be read.'
			}
		]);
	});
	it('counts adjacent broken rows as one skipped row', () => {
		const csv = [
			header,
			row('Jan 1, 2026, 6:21:05 PM'),
			row('Jan 2, 2026, 6:21:05 PM', 'Run', '"broken'),
			row('Jan 3, 2026, 6:21:05 PM', 'Run', '"broken'),
			row('Jan 4, 2026, 6:21:05 PM')
		].join('\n');
		const result = stravaParser.parse(csv, 2026);
		expect(result.activities).toHaveLength(1);
		expect(result.errors).toEqual([
			{
				type: 'malformed-quotes',
				row: 3,
				message: 'Skipped row 3 because its quote marks could not be read.'
			}
		]);
	});
	it('skips whitespace lines and retains line numbers', () => {
		const csv = [' ', header, row('Jan 1, 2026, 6:21:05 PM'), '   ', row('invalid')].join('\n');
		const result = stravaParser.parse(csv, 2026);
		expect(result.activities).toHaveLength(1);
		expect(result.errors).toEqual([
			{ type: 'invalid-date', row: 5, message: 'Invalid date format' }
		]);
	});
	it('accepts a BOM before the header', () => {
		expect(
			stravaParser.parse(`\ufeff${header}\n${row('Jan 1, 2026, 6:21:05 PM')}`, 2026).activities
		).toHaveLength(1);
	});
	it('reports a missing type after a multiline description', () => {
		const csv = [
			header,
			row('Jan 1, 2026, 6:21:05 PM', 'Run', '"first\nsecond"'),
			row('Jan 2, 2026, 6:21:05 PM', '')
		].join('\n');
		expect(stravaParser.parse(csv, 2026).errors).toEqual([
			{
				type: 'missing-column',
				row: 4,
				message: 'Missing required column (Activity Type or Activity Date)'
			}
		]);
	});
	it.each([
		['Virtual Ride', 'cycling'],
		['E-Bike Ride', 'cycling'],
		['Weight Training', 'strength'],
		['Elliptical', 'cardio'],
		['Stair-Stepper', 'cardio'],
		['Alpine Ski', 'winter'],
		['Tennis', 'racket'],
		['Rock Climb', 'climbing'],
		['Unknown', 'other'],
		['Workout', 'other']
	])('maps %s to %s', (type, expected) => {
		expect(
			stravaParser.parse(`${header}\n${row('Oct 31, 2026, 9:49:58 AM', type)}`, 2026).activities[0]
				.type
		).toBe(expected);
	});
	it('detects English and localized Strava exports but not Garmin', () => {
		expect(stravaParser.detect(header)).toBe(true);
		expect(stravaParser.detect('Activity Type,Date,Distance\nRunning,2026-01-01,1')).toBe(false);
		const result = parseActivityCsv(
			'Fecha,Tipo,Archivo\nfecha,carrera,activities/123.fit.gz',
			2026
		);
		expect(result.errors).toEqual([
			expect.objectContaining({
				type: 'unsupported-format',
				reason: 'strava-not-english',
				message: expect.stringContaining('English')
			})
		]);
	});
});

describe('Strava sport distances', () => {
	it('ignores climbing distance but keeps winter kilometres', () => {
		const csv = [
			header,
			row('Oct 31, 2026, 9:49:58 AM', 'Rock Climb'),
			row('Oct 31, 2026, 9:49:58 AM', 'Alpine Ski')
		].join('\n');
		expect(stravaParser.parse(csv, 2026).activities.map((a) => [a.type, a.distance])).toEqual([
			['climbing', 0],
			['winter', 1.45]
		]);
	});
});

function oneRowCsv(header: string, date: string): string {
	const columns = header.split(',');
	const dateIndex = columns.findIndex((column) =>
		/^(Fecha de la actividad|Date de l'activité|Aktivitätsdatum|Data dell’attività|Datum van activiteit)$/.test(
			column
		)
	);
	const typeIndex = columns.findIndex((column) =>
		/^(Tipo de actividad|Type d'activité|Aktivitätsart|Tipo attività|Activiteitstype)$/.test(column)
	);
	const values = columns.map(() => '');
	values[dateIndex] = `"${date}"`;
	values[typeIndex] = 'Unknown';
	return `${header}\n${values.join(',')}`;
}

describe('localized Strava exports', () => {
	it.each(['es', 'fr', 'de', 'it'])('matches English totals for %s', (locale) => {
		const english = stravaParser.parse(loadFixture('strava-locale-en.csv'), 2026);
		const localized = stravaParser.parse(loadFixture(`strava-locale-${locale}.csv`), 2026);
		expect(localized.errors).toEqual([]);
		expect(localized.activities).toEqual(english.activities);
	});
	it('parses Dutch activities without elevation or calories headers', () => {
		const result = stravaParser.parse(loadFixture('strava-locale-nl.csv'), 2026);
		expect(result.errors).toEqual([]);
		expect(result.yearsInFile).toEqual([2025, 2026]);
		expect(
			result.activities.map(({ type, distance, duration, elevation, calories }) => [
				type,
				distance,
				duration,
				elevation,
				calories
			])
		).toEqual([
			['running', 9.75, 100, 0, 0],
			['cycling', 10.75, 200, 0, 0],
			['walking', 11.75, 300, 0, 0],
			['other', 12.75, 400, 0, 0]
		]);
	});
	it('parses Portuguese dates and unknown activity types', () => {
		const csv =
			'Data da atividade,Nome da atividade,Tipo de atividade,Tempo em movimento,Distância\n"2 de mar. de 2026, 06:34:08",Activity,Unknown,100,1450';
		const result = stravaParser.parse(csv, 2026);
		expect(result.errors).toEqual([]);
		expect(result.activities[0].date.toISOString()).toBe('2026-03-02T06:34:08.000Z');
		expect(result.activities[0].type).toBe('other');
	});

	it.each([
		['es', '2 ago 2026, 12:20:32\u202fp.m.', '2026-08-02T12:20:32.000Z'],
		['es', '1 ago 2026, 12:53:54\u202fa.m.', '2026-08-01T00:53:54.000Z'],
		['es', '9 sept. 2018 17:26:30', '2018-09-09T17:26:30.000Z'],
		['fr', '9 juin 2026, 15:13:37', '2026-06-09T15:13:37.000Z'],
		['fr', '31 mai 2026, 08:47:48', '2026-05-31T08:47:48.000Z'],
		['de', '02.04.2024, 14:05:15', '2024-04-02T14:05:15.000Z'],
		['it', '28 apr 2018, 19:39:53', '2018-04-28T19:39:53.000Z'],
		['it', '08 mag 2018, 16:07:41', '2018-05-08T16:07:41.000Z'],
		['nl', '9 mei 2026, 00:03:01', '2026-05-09T00:03:01.000Z'],
		['es', '30 feb 2026, 08:00:00', null]
	])('parses %s date %s', (locale, date, expected) => {
		const header = loadFixture(`strava-locale-${locale}.csv`).split('\n')[0];
		const parsed = stravaParser.parse(
			oneRowCsv(header, date),
			Number(expected?.slice(0, 4) ?? 2026)
		);
		if (expected) expect(parsed.activities[0]?.date.toISOString()).toBe(expected);
		else expect(parsed.errors[0]?.type).toBe('invalid-date');
	});
});
