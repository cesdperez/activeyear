import { describe, it, expect } from 'vitest';
import {
	parseGarminCsv,
	parseGarminTime,
	parseGarminDistance,
	parseGarminCalories,
	parseGarminElevation,
	mapActivityType,
	parseGarminDate,
	isInYear
} from './garmin.js';
import { TARGET_YEAR } from '../constants/time.js';
import { loadFixture } from './__fixtures__/load.js';

const sample = parseGarminCsv(loadFixture('garmin-sample.csv'), 2026);
const sample2 = parseGarminCsv(loadFixture('garmin-sample-2.csv'), 2025);

describe('parseGarminTime', () => {
	it('parses HH:MM:SS format', () => {
		expect(parseGarminTime('01:30:45')).toBe(5445); // 1h30m45s = 5445s
	});

	it('parses HH:MM:SS.S format with decimal seconds', () => {
		expect(parseGarminTime('00:02:10.0')).toBe(130);
	});

	it('returns 0 for empty string', () => {
		expect(parseGarminTime('')).toBe(0);
	});

	it('returns 0 for "--"', () => {
		expect(parseGarminTime('--')).toBe(0);
	});

	it('parses hours correctly', () => {
		expect(parseGarminTime('03:34:48')).toBe(12888); // 3h34m48s
	});
});

describe('parseGarminDistance', () => {
	it('parses simple decimal', () => {
		expect(parseGarminDistance('10.33')).toBe(10.33);
	});

	it('parses number with comma thousands separator (English)', () => {
		expect(parseGarminDistance('1,500')).toBe(1500);
	});

	it('parses number with comma decimal separator (European)', () => {
		expect(parseGarminDistance('45,25')).toBe(45.25);
	});

	it('parses number with dot thousands and comma decimal (European)', () => {
		expect(parseGarminDistance('1.234,56')).toBe(1234.56);
	});

	it('returns 0 for "--"', () => {
		expect(parseGarminDistance('--')).toBe(0);
	});

	it('returns 0 for empty string', () => {
		expect(parseGarminDistance('')).toBe(0);
	});
});

describe('parseGarminCalories', () => {
	it('parses simple integer', () => {
		expect(parseGarminCalories('658')).toBe(658);
	});

	it('parses number with comma thousands (English)', () => {
		expect(parseGarminCalories('2,800')).toBe(2800);
	});

	it('parses number with dot thousands (European)', () => {
		expect(parseGarminCalories('1.540')).toBe(1540);
	});

	it('returns 0 for "--"', () => {
		expect(parseGarminCalories('--')).toBe(0);
	});
});

describe('parseGarminElevation', () => {
	it('parses simple integer', () => {
		expect(parseGarminElevation('32')).toBe(32);
	});

	it('parses number with comma', () => {
		expect(parseGarminElevation('1,185')).toBe(1185);
	});

	it('returns 0 for "--"', () => {
		expect(parseGarminElevation('--')).toBe(0);
	});
});

describe('mapActivityType', () => {
	it.each([
		['Running', 'running'],
		['Virtual Run', 'running'],
		['Indoor Cycling', 'cycling'],
		['Gravel/Unpaved Cycling', 'cycling'],
		['Virtual Cycling', 'cycling'],
		['Pool Swim', 'swimming'],
		['Open Water Swimming', 'swimming'],
		['Strength Training', 'strength'],
		['Yoga', 'yoga'],
		['Walking', 'walking'],
		['Cardio', 'cardio'],
		['CrossFit', 'cardio'],
		['HIIT', 'cardio'],
		['Bouldering', 'other'],
		['Multisport', 'other'],
		['Padel', 'other'],
		['Skating', 'other']
	])('maps %s to %s', (garminType, expected) => {
		expect(mapActivityType(garminType)).toBe(expected);
	});
});

describe('parseGarminDate', () => {
	it('parses Garmin date format', () => {
		const date = parseGarminDate('2025-12-27 14:12:58');
		expect(date).not.toBeNull();
		expect(date?.getFullYear()).toBe(2025);
		expect(date?.getMonth()).toBe(11); // December (0-indexed)
		expect(date?.getDate()).toBe(27);
	});

	it('returns null for empty string', () => {
		expect(parseGarminDate('')).toBeNull();
	});

	it('returns null for invalid date', () => {
		expect(parseGarminDate('not-a-date')).toBeNull();
	});
});

describe('isInYear', () => {
	it('returns true for matching year', () => {
		expect(isInYear(new Date('2025-06-15'), 2025)).toBe(true);
	});

	it('returns false for different year', () => {
		expect(isInYear(new Date('2024-12-31'), 2025)).toBe(false);
	});
});

describe('parseGarminCsv', () => {
	it('parses the sample, leaving out the activity from the previous year', () => {
		expect(sample.errors).toHaveLength(0);
		expect(sample.activities).toHaveLength(8);
	});

	it('filters to specified year only', () => {
		const result2025 = parseGarminCsv(loadFixture('garmin-sample.csv'), 2025);

		expect(result2025.activities).toHaveLength(1);
		expect(result2025.activities[0].title).toBe('Last Year Run');
	});

	it('correctly parses activity types', () => {
		const types = sample.activities.map((a) => a.type);

		expect(types).toEqual(
			expect.arrayContaining(['running', 'cycling', 'strength', 'yoga', 'swimming', 'walking'])
		);
	});

	it('correctly parses marathon activity', () => {
		const marathon = sample.activities.find((a) => a.title === 'Valencia Marathon');

		expect(marathon).toMatchObject({
			distance: 42.63,
			calories: 2800,
			duration: 12888,
			elevation: 105
		});
	});

	it('converts swimming distance from meters to km', () => {
		const swim = sample.activities.find((a) => a.type === 'swimming');

		expect(swim?.distance).toBe(1.5);
	});

	it('handles activities with missing distance (like yoga)', () => {
		const yoga = sample.activities.find((a) => a.type === 'yoga');

		expect(yoga?.distance).toBe(0);
	});

	it('parses the Favorite column', () => {
		expect(sample.activities.filter((a) => a.favorite)).toHaveLength(5);
	});

	it('returns empty array for empty CSV', () => {
		const result = parseGarminCsv('', 2025);
		expect(result.activities).toHaveLength(0);
	});

	it('handles CSV with only header row', () => {
		const result = parseGarminCsv(
			'Activity Type,Date,Title,Distance,Calories,Time,Total Ascent',
			2025
		);
		expect(result.activities).toHaveLength(0);
	});
});

describe('parseGarminCsv with garmin-sample-2.csv', () => {
	const countOf = (type: string) => sample2.activities.filter((a) => a.type === type).length;

	it('parses the 2025 activities without errors', () => {
		expect(sample2.errors).toHaveLength(0);
		expect(sample2.activities.length).toBeGreaterThan(150);
	});

	it('parses CrossFit as cardio, and running and hiking as their own types', () => {
		expect(countOf('cardio')).toBeGreaterThan(30);
		expect(sample2.activities.some((a) => a.type === 'cardio' && a.title === 'CrossFit')).toBe(
			true
		);
		expect(countOf('running')).toBeGreaterThan(50);
		expect(countOf('hiking')).toBeGreaterThan(15);
	});

	it('reads duration from the Total Time column', () => {
		expect(sample2.activities.every((a) => a.duration > 0)).toBe(true);
		expect(Math.max(...sample2.activities.map((a) => a.duration))).toBeGreaterThan(5 * 3600);
	});
});

describe('parseGarminCsv default year', () => {
	it('defaults to TARGET_YEAR', () => {
		const csv = `Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${TARGET_YEAR}-03-01 08:00:00,Run,10.0,600,00:50:00,100\nRunning,${TARGET_YEAR - 1}-03-01 08:00:00,Old Run,10.0,600,00:50:00,100`;
		const result = parseGarminCsv(csv);

		expect(result.activities.map((a) => a.title)).toEqual(['Run']);
	});
});

describe('parseGarminCsv favorite field', () => {
	it('sets favorite to false when Favorite column is missing', () => {
		const csv =
			'Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,2025-01-01 08:00:00,Morning Run,10.0,600,00:50:00,100';
		const result = parseGarminCsv(csv, 2025);

		expect(result.activities).toHaveLength(1);
		expect(result.activities[0].favorite).toBe(false);
	});

	it('parses Favorite=true correctly', () => {
		const csv =
			'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent\nRunning,2025-01-01 08:00:00,true,Best Run Ever,10.0,600,00:50:00,100';
		const result = parseGarminCsv(csv, 2025);

		expect(result.activities).toHaveLength(1);
		expect(result.activities[0].favorite).toBe(true);
		expect(result.activities[0].title).toBe('Best Run Ever');
	});
});

describe('parseGarminCsv with special formats', () => {
	it('handles whole-row quoted format correctly', () => {
		const csv =
			'"Activity Type,Date,Title,Distance,Calories,Time"\n' +
			'"Running,2025-01-01 08:00:00,Morning Run,""10,0"",600,00:50:00"';
		const result = parseGarminCsv(csv, 2025);
		expect(result.activities).toHaveLength(1);
		expect(result.activities[0].title).toBe('Morning Run');
		expect(result.activities[0].distance).toBe(10.0);
	});

	it('handles whole-row quoted format with internal newlines', () => {
		const csv =
			'"Activity Type,Date,Title,Distance,Calories,Time"\n' +
			'"Running,2025-01-01 08:00:00,""Multi\nLine Title"",10.0,600,00:50:00"';
		const result = parseGarminCsv(csv, 2025);
		expect(result.activities).toHaveLength(1);
		expect(result.activities[0].title).toBe('Multi\nLine Title');
	});

	it('handles mixed quoted and unquoted header/rows', () => {
		const csv =
			'Activity Type,Date,Title,Distance,Calories,Time\n' +
			'"Running,2025-01-01 08:00:00,Morning Run,10.0,600,00:50:00"';
		const result = parseGarminCsv(csv, 2025);
		expect(result.activities).toHaveLength(1);
		expect(result.activities[0].title).toBe('Morning Run');
	});
});

describe('parseGarminCsv with quoted fields', () => {
	const HEADER = 'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent';
	const NEXT_ROW = 'Cycling,2026-03-02 08:00:00,false,Ride,20.00,500,01:00:00,50';

	it('reads a title with an embedded comma', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,true,"Easy, then hard",10.33,658,00:50:00,100`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.errors).toEqual([]);
		expect(result.activities[0]).toMatchObject({ title: 'Easy, then hard', distance: 10.33 });
	});

	it('reads a title with escaped quotes', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,true,"Intervals ""Go Hard""",10.33,658,00:50:00,100`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.errors).toEqual([]);
		expect(result.activities[0]).toMatchObject({ title: 'Intervals "Go Hard"', distance: 10.33 });
	});

	it('recovers a title with unescaped quotes and keeps the fields after it', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,true,"Intervalls - " Go Hard"",10.33,658,00:50:00,100`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.errors).toEqual([]);
		expect(result.activities).toHaveLength(1);
		expect(result.activities[0]).toMatchObject({
			title: 'Intervalls - " Go Hard"',
			distance: 10.33,
			calories: 658,
			duration: 3000,
			elevation: 100,
			favorite: true
		});
	});

	it('keeps the row after a recovered title as its own activity', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,true,"Intervalls - " Go, Hard"",10.33,658,00:50:00,100\n${NEXT_ROW}`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.errors).toEqual([]);
		expect(result.activities.map((a) => [a.title, a.distance])).toEqual([
			['Intervalls - " Go, Hard"', 10.33],
			['Ride', 20]
		]);
	});

	it('recovers an unescaped title next to a quoted number with a thousands comma', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,true,"Long "slow" run",42.20,"2,658",03:50:00,100`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.errors).toEqual([]);
		expect(result.activities[0]).toMatchObject({
			title: 'Long "slow" run',
			calories: 2658,
			distance: 42.2
		});
	});

	it('skips a row whose quotes cannot be resolved and says how to fix it', () => {
		const csv = `${HEADER}\nRunning,2026-03-01 08:00:00,"tr"ue","Intervalls - " Go Hard"",10.33,658,00:50:00,100\n${NEXT_ROW}`;
		const result = parseGarminCsv(csv, 2026);

		expect(result.activities.map((a) => a.title)).toEqual(['Ride']);
		expect(result.errors).toEqual([
			{
				type: 'malformed-quotes',
				row: 2,
				message: expect.stringContaining('Garmin Connect')
			}
		]);
	});
});
