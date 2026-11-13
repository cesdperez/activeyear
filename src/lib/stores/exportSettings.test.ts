import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadStore } from './upload.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';
import { TARGET_YEAR } from '../constants/time.js';
vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));
describe('exportSettings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uploadStore.reset();
		exportSettings.unit = 'km';
	});

	it('focuses the summary on the first stat with a value when the data loads', async () => {
		exportSettings.summaryMetric = 'distance';

		await uploadStore.processFile(
			csvFile(
				`Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nYoga,${TARGET_YEAR}-03-01 08:00:00,Yoga,0.0,200,01:00:00,0`
			)
		);

		expect(exportSettings.summaryMetric).toBe('duration');
	});

	it('moves the focused stat off a value that shows as zero in the new unit', async () => {
		await uploadStore.processFile(
			csvFile(
				`Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,${TARGET_YEAR}-03-01 08:00:00,Run,5.0,200,00:30:00,6`
			)
		);
		exportSettings.summaryMetric = 'elevation';

		exportSettings.unit = 'miles';

		expect(exportSettings.summaryMetric).toBe('distance');
	});

	it('keeps the focused stat when the loaded data has a value for it', () => {
		exportSettings.summaryMetric = 'calories';

		uploadStore.loadDemoData();

		expect(exportSettings.summaryMetric).toBe('calories');
	});

	it.each([
		['  Ana  ', 'Ana'],
		['   ', '']
	])('shows the name %j as %j', (name, shown) => {
		exportSettings.userName = name;

		expect(exportSettings.displayName).toBe(shown);
	});
});

function csvFile(content: string): File {
	return new File([content], 'activities.csv');
}
