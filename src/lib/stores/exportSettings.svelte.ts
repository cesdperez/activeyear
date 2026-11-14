import type { Theme, SummaryMetric, Unit, BreakdownMetric } from '#lib/types/index.js';
import { summaryMetricWithValue } from '#lib/utils/stats.js';
import { yearData } from './yearData.svelte.js';
import { browser } from '$app/env';
import { unitsForLanguages } from '#lib/utils/regionUnits.js';
import { THEME_OPTIONS, THEME_STORAGE_KEY } from '#lib/constants/export.js';

function initialTheme(): Theme {
	if (browser) {
		try {
			const stored = localStorage.getItem(THEME_STORAGE_KEY);
			return THEME_OPTIONS.find((option) => option.value === stored)?.value ?? 'neon';
		} catch {
			return 'neon';
		}
	}
	return 'neon';
}

class ExportSettings {
	userName = $state<string>('');
	#displayName = $derived(this.userName.trim());
	#theme = $state<Theme>(initialTheme());
	userPfp = $state<string | null>(null);
	confettiEnabled = $state<boolean>(false);
	summaryMetric = $state<SummaryMetric>('distance');
	#unit = $state<Unit>(
		browser && unitsForLanguages(navigator.languages) === 'imperial' ? 'miles' : 'km'
	);
	breakdownMetric = $state<BreakdownMetric>('count');

	get theme() {
		return this.#theme;
	}

	set theme(theme: Theme) {
		this.#theme = theme;
		if (browser) {
			try {
				localStorage.setItem(THEME_STORAGE_KEY, theme);
			} catch {
				// Storage can be unavailable even in a browser.
			}
		}
	}

	get unit() {
		return this.#unit;
	}

	set unit(unit: Unit) {
		this.#unit = unit;
		this.focusStatWithValue();
	}

	get displayName() {
		return this.#displayName;
	}

	focusStatWithValue() {
		if (yearData.stats)
			this.summaryMetric = summaryMetricWithValue(yearData.stats, this.summaryMetric, this.#unit);
	}
}

export const exportSettings = new ExportSettings();
