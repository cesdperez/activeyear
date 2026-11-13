import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadStore } from './upload.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';
import { yearData } from './yearData.svelte.js';
import { highlightsStore } from './highlights.svelte.js';
import { presetHighlights } from '#lib/utils/highlights.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoActivities } from '../data/demo.js';
vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));
describe('highlights', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		uploadStore.reset();
		exportSettings.unit = 'km';
	});

	it('lists highlights by date whatever the row order of the file', async () => {
		const csv = [
			'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent',
			`Running,${TARGET_YEAR}-09-01 08:00:00,true,September,10.0,600,00:50:00,100`,
			`Running,${TARGET_YEAR}-02-01 08:00:00,true,February,10.0,600,00:50:00,100`,
			`Running,${TARGET_YEAR}-05-01 08:00:00,true,May,10.0,600,00:50:00,100`
		].join('\n');

		await uploadStore.processFile(csvFile(csv));

		expect(highlightsStore.highlights.map((a) => a.title)).toEqual([
			'February',
			'May',
			'September'
		]);
	});

	it('edits highlights, enforces the cap and resets on load', () => {
		uploadStore.loadDemoData();
		expect(highlightsStore.highlightPreset).toBe('longest');
		expect(highlightsStore.canAddHighlight).toBe(false);
		const original = highlightsStore.highlights[0];
		const other = yearData.activities.find((activity) => !highlightsStore.isHighlight(activity))!;
		highlightsStore.addHighlight(other);
		expect(highlightsStore.isHighlight(other)).toBe(false);
		highlightsStore.removeHighlight(original);
		expect(highlightsStore.highlightPreset).toBe('custom');
		expect(highlightsStore.canAddHighlight).toBe(true);
		highlightsStore.addHighlight(other);
		highlightsStore.addHighlight(other);
		expect(highlightsStore.highlights).toHaveLength(10);
		expect(highlightsStore.isHighlight(other)).toBe(true);
		expect(highlightsStore.highlights).toEqual(
			[...highlightsStore.highlights].sort((a, b) => a.date.getTime() - b.date.getTime())
		);
		highlightsStore.applyHighlightPreset('favorites');
		expect(highlightsStore.highlightPreset).toBe('favorites');
		expect(highlightsStore.highlights).toEqual(presetHighlights(yearData.activities, 'favorites'));
		expect(highlightsStore.highlightPresets).toContain('longest');
		expect(highlightsStore.searchActivities(other.title).matches).toContain(other);
		uploadStore.loadDemoData();
		expect(highlightsStore.highlightPreset).toBe('longest');
		expect(highlightsStore.highlights).toEqual(presetHighlights(demoActivities, 'longest'));
		uploadStore.reset();
		expect(highlightsStore.highlights).toEqual([]);
		expect(highlightsStore.highlightPreset).toBe('longest');
	});
});

function csvFile(content: string): File {
	return new File([content], 'activities.csv');
}
