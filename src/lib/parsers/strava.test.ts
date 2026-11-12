import { describe, expect, it } from 'vitest';
import { stravaParser } from './strava.js';
import { parseActivityCsv } from './index.js';
import { loadFixture } from './__fixtures__/load.js';

const header =
	'Activity Date,Activity Name,Activity Type,Elapsed Time,Distance,Moving Time,Distance,Elevation Gain,Calories,Description';
const row = (date: string, type = 'Run', description = '') =>
	`"${date}",Title,${type},200,"1,450",100,1450.0,12.6,20.4,${description}`;

describe('Strava parser', () => {
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
	it('filters New Year instants in zones from UTC-5 to UTC+4', () => {
		const csv = [header, row('Jan 1, 2026, 6:21:05 PM'), row('Dec 31, 2025, 6:00:00 PM')].join(
			'\n'
		);
		expect(stravaParser.parse(csv, 2026).activities).toHaveLength(1);
		expect(stravaParser.parse(csv, 2025).activities).toHaveLength(1);
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
