import { track } from '#lib/analytics/track.js';
import { cutShortFrom } from '#lib/utils/cutShort.js';
import type { EventValue } from '#lib/constants/events.js';
import { activityCountBucket, sportsCountBucket } from '#lib/utils/events.js';
import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
import { HIGHLIGHT_SEARCH_LIMIT } from '#lib/constants/highlights.js';
import {
	activitySearchText,
	availablePresets,
	presetHighlights,
	searchActivities
} from '#lib/utils/highlights.js';
import { parseActivityCsv } from '../parsers/index.js';
import {
	calculateYearStats,
	calculatePersonalRecords,
	calculateSportBreakdown,
	calculateWeeklyPattern,
	summaryMetricWithValue
} from '../utils/stats.js';
import { parseSavedYear, serializeSavedYear } from '#lib/utils/savedYear.js';
import { TARGET_YEAR } from '../constants/time.js';
import { daysElapsed, daysInYear, isYearRunning } from '#lib/utils/date.js';
import { demoActivities } from '../data/demo.js';
import { describeSkippedRows, describeUnusableFile } from '#lib/utils/uploadErrors.js';
import type {
	Activity,
	UploadError,
	HighlightPreset,
	ActivitySource,
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
	#source = $state<ActivitySource | null>(null);
	#cutShort = $state<Date | null>(null);
	#loadedAt = $state<Date | null>(null);
	#yearSoFar = $derived(this.#loadedAt !== null && isYearRunning(TARGET_YEAR, this.#loadedAt));
	#daysCounted = $derived(
		this.#yearSoFar ? daysElapsed(TARGET_YEAR, this.#loadedAt!) : daysInYear(TARGET_YEAR)
	);
	#highlights = $state.raw<Activity[]>([]);
	#highlightPreset = $state<HighlightPreset | 'custom'>('longest');
	#highlightPresets = $derived(availablePresets(this.#activities));
	#searchTexts = $derived(this.#activities.map((activity) => activitySearchText(activity)));
	#stats = $derived(this.#activities.length > 0 ? calculateYearStats(this.#activities) : null);
	#records = $derived(
		this.#activities.length > 0 ? calculatePersonalRecords(this.#activities) : null
	);
	#breakdown = $derived(calculateSportBreakdown(this.#activities));
	#weeklyPattern = $derived(calculateWeeklyPattern(this.#activities));
	#status = $state<AppStatus>('idle');
	#error = $state<UploadError | null>(null);
	#parseErrors = $state<ParseError[]>([]);
	#skippedRowCount = $derived(describeSkippedRows(this.#parseErrors)?.count ?? 0);

	userName = $state<string>('');
	#displayName = $derived(this.userName.trim());
	theme = $state<Theme>('neon');
	userPfp = $state<string | null>(null);
	confettiEnabled = $state<boolean>(false);
	summaryMetric = $state<SummaryMetric>('distance');
	#unit = $state<Unit>('km');
	breakdownMetric = $state<BreakdownMetric>('count');
	/** Freezes every control that changes the cards, so one export cannot mix settings. */
	isExporting = $state(false);

	get yearSoFar() {
		return this.#yearSoFar;
	}
	get daysCounted() {
		return this.#daysCounted;
	}

	get unit() {
		return this.#unit;
	}

	set unit(unit: Unit) {
		this.#unit = unit;
		this.#focusStatWithValue();
	}

	get displayName() {
		return this.#displayName;
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
		this.#highlights = presetHighlights(this.#activities, preset);
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
		return searchActivities(this.#activities, this.#searchTexts, query, HIGHLIGHT_SEARCH_LIMIT);
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

	/** Rows left out of the loaded totals because they could not be read. */
	get skippedRowCount() {
		return this.#skippedRowCount;
	}

	reset() {
		this.#activities = [];
		this.#highlights = [];
		this.#highlightPreset = 'longest';
		this.#source = null;
		this.#cutShort = null;
		this.#loadedAt = null;
		this.#status = 'idle';
		this.#error = null;
		this.#parseErrors = [];
		this.userPfp = null;
	}

	async processFile(file: File) {
		const name = file.name.toLowerCase();
		if (!name.endsWith('.csv') && !name.endsWith('.json')) {
			this.#fail('unsupported-file-type', { type: 'invalid-extension' });
			return;
		}

		this.#status = 'parsing';
		this.#error = null;

		try {
			const content = await file.text();
			if (name.endsWith('.json')) {
				const saved = parseSavedYear(content, TARGET_YEAR);
				if (!saved.ok) {
					this.#fail('invalid-saved-year', saved.error);
					return;
				}
				this.#loadedAt = new Date();
				this.#load(saved.activities);
				this.#source = saved.source;
				this.#cutShort = null;
				this.#parseErrors = [];
				this.#trackUpload();
				return;
			}
			const result = parseActivityCsv(content, TARGET_YEAR);

			const unreadable = result.errors.find((e) => e.type === 'unsupported-format');
			if (unreadable) {
				this.#fail(
					'unsupported-format',
					{ type: unreadable.reason ?? 'unrecognised' },
					result.errors
				);
				return;
			}

			if (result.activities.length === 0) {
				const error = describeUnusableFile(result, TARGET_YEAR);
				this.#fail(error.type, error, result.errors);
				return;
			}

			this.#source = result.source;
			this.#cutShort = cutShortFrom(result, TARGET_YEAR);
			this.#loadedAt = new Date();
			this.#load(result.activities);
			this.#parseErrors = result.errors;
			this.#trackUpload();
		} catch {
			this.#fail('read-failed', { type: 'unknown-failure' });
		}
	}

	savedYearJson() {
		return serializeSavedYear(this.#activities, this.#source, TARGET_YEAR);
	}

	loadDemoData() {
		this.reset();
		this.#load(demoActivities);
	}

	#trackUpload() {
		track('upload_success', activityCountBucket(this.#activities.length));
		track('sports_count', sportsCountBucket(this.#breakdown.length));
	}

	#load(activities: Activity[]) {
		this.#activities = activities;
		this.applyHighlightPreset('longest');
		this.#focusStatWithValue();
		this.#status = 'ready';
	}

	#focusStatWithValue() {
		if (this.#stats)
			this.summaryMetric = summaryMetricWithValue(this.#stats, this.summaryMetric, this.#unit);
	}

	// Leaves parseErrors untouched when none are given, matching the CSV-extension and thrown-error paths.
	#fail(type: EventValue<'upload_error'>, message: UploadError, parseErrors?: ParseError[]) {
		track('upload_error', type);
		this.#status = 'error';
		this.#error = message;
		if (parseErrors) this.#parseErrors = parseErrors;
	}
}

export const appStore = new AppStore();
