import { describe, it, expect } from 'vitest';
import { parseGarminCsv } from './garmin.js';

describe('Garmin Parser - Meter-based Activities', () => {
	it.each([
		['Track Running', '"6,640"', 'running', 6.64],
		['Indoor Rowing', '"11,093"', 'rowing', 11.093],
		['Rowing', '"5,000"', 'rowing', 5],
		['SUP', '"3,500"', 'paddling', 3.5],
		['Kayaking', '"8,200"', 'paddling', 8.2],
		['Indoor Track', '"2,400"', 'running', 2.4],
		['Pool Swim', '1.500', 'swimming', 1.5],
		['Open Water Swimming', '2.050', 'swimming', 2.05],
		['Pool Swim', '750', 'swimming', 0.75]
	])('converts %s distance %s from meters to km', (garminType, distance, type, km) => {
		const csv =
			'Activity Type,Date,Favorite,Title,Distance,Calories,Time\n' +
			`${garminType},2025-01-21 16:50:29,false,Session,${distance},383,01:00:09.0`;

		const result = parseGarminCsv(csv, 2025);

		expect(result.activities).toEqual([
			expect.objectContaining({ type, distance: km, calories: 383, duration: 3609 })
		]);
	});

	it.each([
		['Unknown Swim', '"1,450"', 'other', 1.45],
		['Stand Up Paddleboarding', '3.83', 'paddling', 3.83],
		['Running', '1.450', 'running', 1.45],
		['Running', '"3,83"', 'running', 3.83],
		['Pool Swim', '"1,450"', 'swimming', 1.45]
	])('detects distance units for %s', (activity, distance, type, expected) => {
		const csv =
			'Activity Type,Date,Favorite,Title,Distance,Calories,Time\n' +
			`${activity},2025-01-21 16:50:29,false,Session,${distance},383,01:00:09.0`;

		expect(parseGarminCsv(csv, 2025).activities[0]).toEqual(
			expect.objectContaining({ type, distance: expected })
		);
	});
});
