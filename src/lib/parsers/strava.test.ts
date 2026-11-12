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
				message: expect.stringContaining('English')
			})
		]);
	});
});
