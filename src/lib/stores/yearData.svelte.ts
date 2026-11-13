import type { Activity, ActivitySource, LoadedYear } from '#lib/types/index.js';
import { TARGET_YEAR } from '#lib/constants/time.js';
import { daysElapsed, daysInYear, isYearRunning } from '#lib/utils/date.js';
import {
	calculateYearStats,
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern
} from '#lib/utils/stats.js';
import { serializeSavedYear } from '#lib/utils/savedYear.js';

class YearData {
	// Raw because the list is only ever replaced whole, and the derived stats read every activity.
	#activities = $state.raw<Activity[]>([]);
	#source = $state<ActivitySource | null>(null);
	#cutShort = $state<Date | null>(null);
	#loadedAt = $state<Date | null>(null);
	#yearSoFar = $derived(this.#loadedAt !== null && isYearRunning(TARGET_YEAR, this.#loadedAt));
	#daysCounted = $derived(
		this.#yearSoFar ? daysElapsed(TARGET_YEAR, this.#loadedAt!) : daysInYear(TARGET_YEAR)
	);
	#stats = $derived(this.#activities.length > 0 ? calculateYearStats(this.#activities) : null);
	#records = $derived(
		this.#activities.length > 0 ? calculatePersonalRecords(this.#activities) : null
	);
	#breakdown = $derived(calculateSportBreakdown(this.#activities));
	#weeklyPattern = $derived(calculateWeeklyPattern(this.#activities));

	get yearSoFar() {
		return this.#yearSoFar;
	}

	get daysCounted() {
		return this.#daysCounted;
	}

	get activities() {
		return this.#activities;
	}

	get cutShort() {
		return this.#cutShort;
	}

	get source() {
		return this.#source;
	}

	get stats() {
		return this.#stats;
	}

	get records() {
		return this.#records;
	}

	get breakdown() {
		return this.#breakdown;
	}

	get weeklyPattern() {
		return this.#weeklyPattern;
	}

	load({ activities, source, cutShort, loadedAt }: LoadedYear) {
		this.#activities = activities;
		this.#source = source;
		this.#cutShort = cutShort;
		this.#loadedAt = loadedAt;
	}

	reset() {
		this.#activities = [];
		this.#source = null;
		this.#cutShort = null;
		this.#loadedAt = null;
	}

	savedYearJson() {
		return serializeSavedYear(this.#activities, this.#source, TARGET_YEAR);
	}
}

export const yearData = new YearData();
