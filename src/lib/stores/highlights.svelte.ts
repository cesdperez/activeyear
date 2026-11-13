import type { Activity, HighlightPreset } from '#lib/types/index.js';
import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
import { HIGHLIGHT_SEARCH_LIMIT } from '#lib/constants/highlights.js';
import {
	activitySearchText,
	availablePresets,
	presetHighlights,
	searchActivities
} from '#lib/utils/highlights.js';
import { yearData } from './yearData.svelte.js';

class HighlightsStore {
	#highlights = $state.raw<Activity[]>([]);
	#highlightPreset = $state<HighlightPreset | 'custom'>('longest');
	#highlightPresets = $derived(availablePresets(yearData.activities));
	#searchTexts = $derived(yearData.activities.map((activity) => activitySearchText(activity)));

	get highlights() {
		return this.#highlights;
	}

	get highlightPreset() {
		return this.#highlightPreset;
	}

	get highlightPresets() {
		return this.#highlightPresets;
	}

	get canAddHighlight() {
		return this.#highlights.length < HIGHLIGHTS_LIMIT;
	}

	applyHighlightPreset(preset: HighlightPreset) {
		this.#highlights = presetHighlights(yearData.activities, preset);
		this.#highlightPreset = preset;
	}

	addHighlight(activity: Activity) {
		if (!this.canAddHighlight || this.isHighlight(activity)) return;
		this.#highlights = [...this.#highlights, activity].sort(
			(a, b) => a.date.getTime() - b.date.getTime()
		);
		this.#highlightPreset = 'custom';
	}

	removeHighlight(activity: Activity) {
		this.#highlights = this.#highlights.filter((item) => item !== activity);
		this.#highlightPreset = 'custom';
	}

	isHighlight(activity: Activity): boolean {
		return this.#highlights.includes(activity);
	}

	searchActivities(query: string): Activity[] {
		return searchActivities(yearData.activities, this.#searchTexts, query, HIGHLIGHT_SEARCH_LIMIT);
	}

	reset() {
		this.#highlights = [];
		this.#highlightPreset = 'longest';
	}
}

export const highlightsStore = new HighlightsStore();
