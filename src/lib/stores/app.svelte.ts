import { parseGarminCsv } from '../parsers/garmin.js';
import {
	calculateYearStats,
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern
} from '../utils/stats.js';
import { TARGET_YEAR } from '../constants/time.js';
import { demoStats, demoRecords, demoBreakdown, demoHighlights } from '../data/demo.js';
import type {
	Activity,
	YearStats,
	PersonalRecords,
	SportBreakdown,
	WeeklyPattern,
	ParseError,
	Theme,
	SummaryMetric,
	Unit,
	BreakdownMetric
} from '../types/index.js';

export type AppStatus = 'idle' | 'parsing' | 'ready' | 'error';

const EMPTY_WEEKLY_PATTERN: WeeklyPattern = [0, 0, 0, 0, 0, 0, 0];
const DEMO_WEEKLY_PATTERN: WeeklyPattern = [45, 38, 42, 35, 28, 52, 48];

class AppStore {
	#activities = $state<Activity[]>([]);
	#highlights = $derived(this.#activities.filter((a) => a.favorite));
	#stats = $state<YearStats | null>(null);
	#records = $state<PersonalRecords | null>(null);
	#breakdown = $state<SportBreakdown[]>([]);
	#weeklyPattern = $state<WeeklyPattern>([...EMPTY_WEEKLY_PATTERN]);
	#status = $state<AppStatus>('idle');
	#error = $state<string | null>(null);
	#parseErrors = $state<ParseError[]>([]);

	userName = $state<string>('');
	theme = $state<Theme>('neon');
	userPfp = $state<string | null>(null);
	confettiEnabled = $state<boolean>(false);
	summaryMetric = $state<SummaryMetric>('distance');
	unit = $state<Unit>('km');
	selectedYear = $state<number>(TARGET_YEAR);
	breakdownMetric = $state<BreakdownMetric>('count');

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
		this.#stats = null;
		this.#records = null;
		this.#breakdown = [];
		this.#weeklyPattern = [...EMPTY_WEEKLY_PATTERN];
		this.#status = 'idle';
		this.#error = null;
		this.#parseErrors = [];
		this.userPfp = null;
	}

	async processFile(file: File) {
		if (!file.name.endsWith('.csv')) {
			this.#fail('Please upload a CSV file');
			return;
		}

		this.#status = 'parsing';
		this.#error = null;

		try {
			const content = await file.text();
			const result = parseGarminCsv(content, this.selectedYear);

			const wrongLanguage = result.errors.find((e) => e.type === 'wrong-language');
			if (wrongLanguage) {
				this.#fail(wrongLanguage.message || 'Wrong language', result.errors);
				return;
			}

			if (result.activities.length === 0) {
				this.#fail(`No ${this.selectedYear} activities found in the file`, result.errors);
				return;
			}

			this.#activities = result.activities;
			this.#parseErrors = result.errors;
			this.#stats = calculateYearStats(result.activities);
			this.#records = calculatePersonalRecords(result.activities);
			this.#breakdown = calculateSportBreakdown(result.activities);
			this.#weeklyPattern = calculateWeeklyPattern(result.activities);
			this.#status = 'ready';
		} catch (err) {
			this.#fail(err instanceof Error ? err.message : 'Failed to parse file');
		}
	}

	loadDemoData() {
		this.reset();
		this.#stats = demoStats;
		this.#records = demoRecords;
		this.#breakdown = demoBreakdown;
		this.#weeklyPattern = [...DEMO_WEEKLY_PATTERN];
		this.#activities = demoHighlights;
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
