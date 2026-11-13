import type { Theme, SummaryMetric, Unit, BreakdownMetric } from '#lib/types/index.js';
import { summaryMetricWithValue } from '#lib/utils/stats.js';
import { yearData } from './yearData.svelte.js';

class ExportSettings {
	userName = $state<string>('');
	#displayName = $derived(this.userName.trim());
	theme = $state<Theme>('neon');
	userPfp = $state<string | null>(null);
	confettiEnabled = $state<boolean>(false);
	summaryMetric = $state<SummaryMetric>('distance');
	#unit = $state<Unit>('km');
	breakdownMetric = $state<BreakdownMetric>('count');

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
