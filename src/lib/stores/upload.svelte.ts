import { track } from '#lib/analytics/track.js';
import type { EventValue } from '#lib/constants/events.js';
import type {
	LoadedYear,
	UploadError,
	ParseError,
	AppStatus,
	GarminUnits,
	YearFileResult
} from '#lib/types/index.js';
import { activityCountBucket, sportsCountBucket } from '#lib/utils/events.js';
import { isSavedYearFileName, loadYearFile, unsupportedFileError } from '#lib/utils/yearFile.js';
import { describeSkippedRows } from '#lib/utils/uploadErrors.js';
import { decodeText } from '#lib/utils/decodeText.js';
import { TARGET_YEAR } from '#lib/constants/time.js';
import { demoYear } from '#lib/data/demo.js';
import { yearData } from './yearData.svelte.js';
import { highlightsStore } from './highlights.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';

class UploadStore {
	#pending: {
		name: string;
		content: string;
		result: Extract<YearFileResult, { type: 'loaded' }>;
	} | null = null;
	#status = $state<AppStatus>('idle');
	#error = $state<UploadError | null>(null);
	#parseErrors = $state<ParseError[]>([]);
	#skippedRowCount = $derived(describeSkippedRows(this.#parseErrors)?.count ?? 0);

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
		this.#pending = null;
		yearData.reset();
		highlightsStore.reset();
		exportSettings.userPfp = null;
		this.#status = 'idle';
		this.#error = null;
		this.#parseErrors = [];
	}

	async processFile(file: File) {
		this.#pending = null;
		const unsupported = unsupportedFileError(file.name);
		if (unsupported) {
			this.#fail('unsupported-file-type', unsupported);
			return;
		}

		this.#status = 'parsing';
		this.#error = null;

		try {
			const content = decodeText(await file.arrayBuffer());
			const result = loadYearFile(file.name, content, TARGET_YEAR);
			if (result.type === 'failed') {
				this.#fail(result.event, result.error, result.parseErrors);
				return;
			}
			if (result.source === 'garmin' && !isSavedYearFileName(file.name)) {
				this.#pending = { name: file.name, content, result };
				this.#status = 'garmin-units';
				return;
			}
			this.#finish(result);
		} catch {
			this.#fail('read-failed', { type: 'unknown-failure' });
		}
	}

	chooseGarminUnits(units: GarminUnits) {
		const pending = this.#pending;
		if (!pending) return;
		this.#pending = null;
		const result =
			units === 'metric'
				? pending.result
				: loadYearFile(pending.name, pending.content, TARGET_YEAR, { garminUnits: units });
		if (result.type === 'failed') {
			this.#fail(result.event, result.error, result.parseErrors);
			return;
		}
		exportSettings.unit = units === 'imperial' ? 'miles' : 'km';
		this.#finish(result);
	}

	#finish(result: Extract<YearFileResult, { type: 'loaded' }>) {
		this.#load({
			activities: result.activities,
			source: result.source,
			cutShort: result.cutShort,
			loadedAt: new Date()
		});
		this.#parseErrors = result.parseErrors;
		this.#trackUpload();
	}

	loadDemoData() {
		this.reset();
		this.#load(demoYear(new Date()));
	}
	#trackUpload() {
		track('upload_success', activityCountBucket(yearData.activities.length));
		track('sports_count', sportsCountBucket(yearData.breakdown.length));
	}
	#load(loadedYear: LoadedYear) {
		yearData.load(loadedYear);
		highlightsStore.applyHighlightPreset('longest');
		exportSettings.focusStatWithValue();
		this.#status = 'ready';
	}
	// Leaves parseErrors untouched when none are given, matching the CSV-extension and thrown-error paths.
	#fail(type: EventValue<'upload_error'>, message: UploadError, parseErrors?: ParseError[]) {
		track('upload_error', type);
		this.#status = 'error';
		this.#error = message;
		if (parseErrors) this.#parseErrors = parseErrors;
	}
}

export const uploadStore = new UploadStore();
