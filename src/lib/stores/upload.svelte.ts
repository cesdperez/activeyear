import { track } from '#lib/analytics/track.js';
import type { EventValue } from '#lib/constants/events.js';
import type {
	LoadedYear,
	UploadError,
	ParseError,
	AppStatus,
	GarminUnits
} from '#lib/types/index.js';
import { activityCountBucket, sportsCountBucket } from '#lib/utils/events.js';
import { hasYearFileExtension, loadYearFile } from '#lib/utils/yearFile.js';
import { describeSkippedRows } from '#lib/utils/uploadErrors.js';
import { TARGET_YEAR } from '#lib/constants/time.js';
import { demoActivities } from '#lib/data/demo.js';
import { yearData } from './yearData.svelte.js';
import { highlightsStore } from './highlights.svelte.js';
import { exportSettings } from './exportSettings.svelte.js';

class UploadStore {
	garminUnits = $state<GarminUnits>('metric');
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
		yearData.reset();
		highlightsStore.reset();
		exportSettings.userPfp = null;
		this.#status = 'idle';
		this.#error = null;
		this.#parseErrors = [];
	}

	async processFile(file: File) {
		if (!hasYearFileExtension(file.name)) {
			this.#fail('unsupported-file-type', { type: 'invalid-extension' });
			return;
		}

		this.#status = 'parsing';
		this.#error = null;

		try {
			const content = await file.text();
			const result = loadYearFile(file.name, content, TARGET_YEAR, {
				garminUnits: this.garminUnits
			});
			if (result.type === 'failed') {
				this.#fail(result.event, result.error, result.parseErrors);
				return;
			}
			this.#load({
				activities: result.activities,
				source: result.source,
				cutShort: result.cutShort,
				loadedAt: new Date()
			});
			this.#parseErrors = result.parseErrors;
			this.#trackUpload();
		} catch {
			this.#fail('read-failed', { type: 'unknown-failure' });
		}
	}

	loadDemoData() {
		this.reset();
		this.#load({ activities: demoActivities, source: null, cutShort: null, loadedAt: null });
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
