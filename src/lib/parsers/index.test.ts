import { describe, it, expect } from 'vitest';
import { parseActivityCsv } from './index.js';
import { loadFixture } from './__fixtures__/load.js';

const garminCsv = loadFixture('garmin-sample.csv');
const FIXTURE_YEAR = 2026;

describe('parseActivityCsv', () => {
	it('parses a Garmin export with the Garmin parser', () => {
		const result = parseActivityCsv(garminCsv, FIXTURE_YEAR);

		expect(result.activities.length).toBeGreaterThan(0);
		expect(result.errors.find((e) => e.type === 'unsupported-format')).toBeUndefined();
	});

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

	it('rejects a CSV that no parser recognises', () => {
		const spanishGarminCsv =
			'Tipo de actividad,Fecha,Título,Distancia\nCarrera,2025-01-01 08:00:00,Run,10.0';

		const result = parseActivityCsv(spanishGarminCsv, 2025);

		expect(result.activities).toEqual([]);
		expect(result.errors).toEqual([
			expect.objectContaining({
				type: 'unsupported-format',
				message: expect.stringContaining('English')
			})
		]);
	});
});
