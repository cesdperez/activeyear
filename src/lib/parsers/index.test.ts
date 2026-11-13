import { describe, it, expect } from 'vitest';
import { parseActivityCsv } from './index.js';
import { garminParser } from './garmin.js';
import { loadFixture } from './__fixtures__/load.js';

const FIXTURE_YEAR = 2026;

describe('parseActivityCsv', () => {
	it.each(['garmin-sample.csv', 'garmin-sample-2.csv', 'garmin-activities.csv'])(
		'detects the %s fixture as Garmin',
		(fixture) => {
			const result = parseActivityCsv(loadFixture(fixture), FIXTURE_YEAR);

			expect(result.errors.find((e) => e.type === 'unsupported-format')).toBeUndefined();
		}
	);

	it('detects a Garmin export whose rows are each wrapped in quotes', () => {
		const csv =
			'"Activity Type,Date,Title,Distance,Calories,Time,Total Ascent"\n"Running,2025-03-01 08:00:00,Run,10.0,600,00:50:00,100"';

		expect(parseActivityCsv(csv, 2025).activities).toHaveLength(1);
	});

	it('detects a Garmin export that starts with a blank line', () => {
		const csv =
			'\nActivity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,2025-03-01 08:00:00,Run,10.0,600,00:50:00,100';

		expect(parseActivityCsv(csv, 2025).activities).toHaveLength(1);
	});

	it('rejects a CSV whose headers only contain the Garmin header names', () => {
		const otherAppCsv = 'Sport,Start Date,Total Distance\nRun,2025-01-01 08:00:00,10.0';

		const result = parseActivityCsv(otherAppCsv, 2025);

		expect(result.errors).toEqual([expect.objectContaining({ type: 'unsupported-format' })]);
	});

	it('handles a Strava export without detecting it as Garmin', () => {
		const stravaCsv =
			'Activity ID,Activity Date,Activity Name,Activity Type,Activity Description,Elapsed Time,Distance,Max Heart Rate,Relative Effort,Commute,Activity Private Note,Activity Gear,Filename,Athlete Weight,Bike Weight,Elapsed Time,Moving Time,Distance,Max Speed,Average Speed,Elevation Gain,Elevation Loss,Elevation Low,Elevation High,Max Grade,Average Grade,Average Positive Grade,Average Negative Grade,Max Cadence,Average Cadence,Max Heart Rate,Average Heart Rate,Max Watts,Average Watts,Calories,Max Temperature,Average Temperature,Relative Effort,Total Work,Number of Runs,Uphill Time,Downhill Time,Other Time,Perceived Exertion,Type,Start Time,Weighted Average Power,Power Count,Prefer Perceived Exertion,Perceived Relative Effort,Commute,Total Weight Lifted,From Upload,Grade Adjusted Distance,Weather Observation Time,Weather Condition,Weather Temperature,Apparent Temperature,Dewpoint,Humidity,Weather Pressure,Wind Speed,Wind Gust,Wind Bearing,Precipitation Intensity,Sunrise Time,Sunset Time,Moon Phase,Bike,Gear,Precipitation Probability,Precipitation Type,Cloud Cover,Weather Visibility,UV Index,Weather Ozone,Jump Count,Total Grit,Average Flow,Flagged,Average Elapsed Speed,Dirt Distance,Newly Explored Distance,Newly Explored Dirt Distance,Activity Count,Total Steps,Carbon Saved,Pool Length,Training Load,Intensity,Average Grade Adjusted Pace,Timer Time,Total Cycles,Recovery,With Pet,Competition,Long Run,For a Cause,With Kid,Downhill Distance,Total Sets,Total Reps,Media,Tag';

		const result = parseActivityCsv(stravaCsv, 2025);

		expect(result.activities).toEqual([]);
		expect(result.errors).toEqual([]);
		expect(garminParser.detect(stravaCsv)).toBe(false);
	});

	it('rejects a CSV that no parser recognises', () => {
		const spanishGarminCsv =
			'Tipo de actividad,Fecha,Título,Distancia\nCarrera,2025-01-01 08:00:00,Run,10.0';

		const result = parseActivityCsv(spanishGarminCsv, 2025);

		expect(result.activities).toEqual([]);
		expect(result.errors).toEqual([
			expect.objectContaining({
				type: 'unsupported-format',
				reason: 'unrecognised',
				message: expect.stringContaining('English')
			})
		]);
	});
});
