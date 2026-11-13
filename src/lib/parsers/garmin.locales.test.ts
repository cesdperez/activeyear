import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { garminParser, parseGarminCsv, parseGarminDate } from './garmin.js';

it('parses local dates with single-digit hours and date parts', () => {
	expect(parseGarminDate('14/01/2023 8:21')).toEqual(new Date(2023, 0, 14, 8, 21));
	expect(parseGarminDate('4.1.2023 8:21')).toEqual(new Date(2023, 0, 4, 8, 21));
});

const fixture = (name: string) =>
	readFileSync(new URL(`./__fixtures__/garmin-${name}.csv`, import.meta.url), 'utf8');

describe('localized Garmin exports', () => {
	const expected: Record<string, [string, number][]> = {
		es: [
			['running', 8.82],
			['running', 8.82],
			['running', 8.82]
		],
		de: [
			['running', 3.83],
			['running', 3.83],
			['cycling', 3.83],
			['cycling', 3.83],
			['cycling', 3.83],
			['strength', 3.83],
			['cardio', 3.83],
			['yoga', 3.83]
		],
		fr: [
			['running', 8.82],
			['running', 8.82],
			['running', 8.82],
			['cycling', 8.82],
			['cycling', 8.82],
			['walking', 8.82],
			['hiking', 8.82],
			['strength', 8.82],
			['swimming', 1.45],
			['swimming', 1.45]
		],
		it: [
			['running', 3.83],
			['walking', 3.83],
			['cycling', 3.83],
			['cycling', 3.83],
			['cardio', 3.83],
			['other', 3.83]
		],
		nl: [
			['running', 8.82],
			['running', 8.82],
			['cycling', 8.82],
			['cycling', 8.82],
			['cycling', 8.82],
			['cycling', 8.82],
			['strength', 8.82],
			['walking', 8.82],
			['swimming', 1.45],
			['swimming', 1.45],
			['paddling', 1.45],
			['other', 8.82],
			['yoga', 8.82],
			['cardio', 8.82],
			['yoga', 8.82]
		],
		pt: [
			['running', 8.82],
			['running', 8.82],
			['cycling', 8.82],
			['cycling', 8.82],
			['walking', 8.82],
			['swimming', 1.45],
			['cardio', 8.82],
			['yoga', 8.82],
			['other', 8.82],
			['other', 8.82],
			['other', 8.82]
		]
	};
	it.each(Object.entries(expected))('parses %s activities', (locale, activities) => {
		const csv = fixture(locale);
		expect(garminParser.detect(csv)).toBe(true);
		const result = parseGarminCsv(csv, 2025);
		expect(result.errors).toEqual([]);
		expect(result.yearsInFile).toEqual([2024, 2025]);
		expect(
			result.activities.map(({ type, distance, duration, calories, elevation }) => ({
				type,
				distance,
				duration,
				calories,
				elevation
			}))
		).toEqual(
			activities.map(([type, distance]) => ({
				type,
				distance,
				duration: 531.6,
				calories: 1057,
				elevation: 50
			}))
		);
	});
	it('does not translate French activity labels under English headers', () => {
		const csv = 'Activity Type,Date,Distance,Calories\nTrail,2025-01-01 12:00:00,8.82,100';
		expect(parseGarminCsv(csv, 2025).activities[0].type).toBe('other');
	});
	it('parses semicolons and spreadsheet dates', () => {
		const csv = fixture('semicolon');
		expect(garminParser.detect(csv)).toBe(true);
		const result = parseGarminCsv(csv, 2025);
		expect(result.errors).toEqual([]);
		expect(result.activities).toHaveLength(2);
		expect(result.activities[0]).toMatchObject({
			distance: 3.83,
			duration: 531.6,
			calories: 100,
			elevation: 50
		});
		expect(parseGarminDate('31/02/2025 12:00')).toBeNull();
	});
	it('reads US spreadsheet dates month first when a day passes 12', () => {
		const csv =
			'Activity Type,Date,Distance\nRunning,11/12/2026 21:12,5\nRunning,11/5/2026 10:22,5\nRunning,10/27/2026 20:32,5';
		const result = parseGarminCsv(csv, 2026);
		expect(result.errors).toEqual([]);
		expect(result.activities.map(({ date }) => date)).toEqual([
			new Date(2026, 10, 12, 21, 12),
			new Date(2026, 10, 5, 10, 22),
			new Date(2026, 9, 27, 20, 32)
		]);
	});
	it('reads spreadsheet dates day first when a day passes 12 or none tells', () => {
		const dayFirst = parseGarminCsv(
			'Activity Type,Date,Distance\nRunning,5/11/2026 10:22,5\nRunning,27/10/2026 20:32,5',
			2026
		);
		expect(dayFirst.activities[0].date).toEqual(new Date(2026, 10, 5, 10, 22));
		const ambiguous = parseGarminCsv(
			'Activity Type,Date,Distance\nRunning,5/11/2026 10:22,5',
			2026
		);
		expect(ambiguous.activities[0].date).toEqual(new Date(2026, 10, 5, 10, 22));
	});
	it('does not detect localized Strava headers', () => {
		expect(
			garminParser.detect(
				'Fecha de la actividad,Tipo de actividad,Distancia\n2025-01-01,Carrera,10'
			)
		).toBe(false);
	});
	it('converts Dutch pool swim metres', () => {
		const result = parseGarminCsv(
			'Activiteittype,Datum,Afstand\nZwembad,2025-01-01 12:00:00,"1,725"',
			2025
		);
		expect(result.activities[0]).toMatchObject({ type: 'swimming', distance: 1.725 });
	});
	it('converts localized imperial distances and elevation', () => {
		const csv =
			'Activiteittype,Datum,Afstand,Totale stijging\nHardlopen,2025-01-01 12:00:00,6.21,328\nZwembad,2025-01-02 12:00:00,"1,640",0';
		const result = parseGarminCsv(csv, 2025, { garminUnits: 'imperial' });
		expect(result.errors).toEqual([]);
		expect(result.activities[0].distance).toBeCloseTo(9.99, 2);
		expect(result.activities[0].elevation).toBe(100);
		expect(result.activities[1].type).toBe('swimming');
		expect(result.activities[1].distance).toBeCloseTo(1.5, 2);
	});
	it('recognizes Spanish cycling', () => {
		const csv = 'Tipo de actividad,Fecha,Distancia\nCiclismo,2025-01-01 12:00:00,12.00';
		expect(parseGarminCsv(csv, 2025).activities[0]).toMatchObject({
			type: 'cycling',
			distance: 12
		});
	});
});
