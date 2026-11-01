import { parseActivityCsv } from '../parsers/index.js';
import {
	calculateYearStats,
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern,
	summaryMetricWithValue
} from '../utils/stats.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoActivities } from '../data/demo.js';
import type {
	Activity,
	ParseError,
	Theme,
	SummaryMetric,
	Unit,
	BreakdownMetric
} from '../types/index.js';

export type AppStatus = 'idle' | 'parsing' | 'ready' | 'error';

class AppStore {
	// Raw because the list is only ever replaced whole, and the derived stats read every activity.
	#activities = $state.raw<Activity[]>([]);
	#highlights = $derived(this.#activities.filter((a) => a.favorite));
	#stats = $derived(this.#activities.length > 0 ? calculateYearStats(this.#activities) : null);
	#records = $derived(
		this.#activities.length > 0 ? calculatePersonalRecords(this.#activities) : null
	);
	#breakdown = $derived(calculateSportBreakdown(this.#activities));
	#weeklyPattern = $derived(calculateWeeklyPattern(this.#activities));
	#status = $state<AppStatus>('idle');
	#error = $state<string | null>(null);
	#parseErrors = $state<ParseError[]>([]);

	userName = $state<string>('');
	#displayName = $derived(this.userName.trim());
	theme = $state<Theme>('neon');
	userPfp = $state<string | null>(null);
	confettiEnabled = $state<boolean>(false);
	summaryMetric = $state<SummaryMetric>('distance');
	unit = $state<Unit>('km');
	breakdownMetric = $state<BreakdownMetric>('count');

	get displayName() {
		return this.#displayName;
	}

	get activities() {
		return this.#activities;
	}

	get highlights() {
		return this.#highlights;
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

	get status() {
		return this.#status;
	}

	get error() {
		return this.#error;
	}

	get parseErrors() {
		return this.#parseErrors;
	}

	reset() {
		this.#activities = [];
		this.#status = 'idle';
		this.#error = null;
		this.#parseErrors = [];
		this.userPfp = null;
	}

	async processFile(file: File) {
		if (!file.name.toLowerCase().endsWith('.csv')) {
			this.#fail('Please upload a CSV file');
			return;
		}

		this.#status = 'parsing';
		this.#error = null;

		try {
			const content = await file.text();
			const result = parseActivityCsv(content, TARGET_YEAR);

			const unreadable = result.errors.find((e) => e.type === 'unsupported-format');
			if (unreadable) {
				this.#fail(unreadable.message, result.errors);
				return;
			}

			if (result.activities.length === 0) {
				this.#fail(`No ${TARGET_YEAR} activities found in the file`, result.errors);
				return;
			}

			this.#load(result.activities);
			this.#parseErrors = result.errors;
		} catch (err) {
			this.#fail(err instanceof Error ? err.message : 'Failed to parse file');
		}
	}

	loadDemoData() {
		this.reset();
		this.#load(demoActivities);
	}

	#load(activities: Activity[]) {
		this.#activities = activities;
		if (this.#stats) this.summaryMetric = summaryMetricWithValue(this.#stats, this.summaryMetric);
		this.#status = 'ready';
	}

	// Leaves parseErrors untouched when none are given, matching the CSV-extension and thrown-error paths.
	#fail(message: string, parseErrors?: ParseError[]) {
		this.#status = 'error';
		this.#error = message;
		if (parseErrors) this.#parseErrors = parseErrors;
	}
}

export const appStore = new AppStore();
