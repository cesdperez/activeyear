import { parseGarminCsv } from '../parsers/garmin.js';
import {
    calculateYearStats,
    calculatePersonalRecords,
    calculateSportBreakdown
} from '../utils/stats.js';
import type {
    Activity,
    YearStats,
    PersonalRecords,
    SportBreakdown,
    ParseError,
    AspectRatio
} from '../types/index.js';

export type AppStatus = 'idle' | 'parsing' | 'ready' | 'error';

interface AppState {
    activities: Activity[];
    stats: YearStats | null;
    records: PersonalRecords | null;
    breakdown: SportBreakdown[];
    status: AppStatus;
    error: string | null;
    parseErrors: ParseError[];
    // Export state
    aspectRatio: AspectRatio;
    userName: string;
}

function createAppStore() {
    let activities = $state<Activity[]>([]);
    let stats = $state<YearStats | null>(null);
    let records = $state<PersonalRecords | null>(null);
    let breakdown = $state<SportBreakdown[]>([]);
    let status = $state<AppStatus>('idle');
    let error = $state<string | null>(null);
    let parseErrors = $state<ParseError[]>([]);

    // Export state
    let aspectRatio = $state<AspectRatio>('9:16');
    let userName = $state<string>('');

    function reset() {
        activities = [];
        stats = null;
        records = null;
        breakdown = [];
        status = 'idle';
        error = null;
        parseErrors = [];
    }

    async function processFile(file: File) {
        if (!file.name.endsWith('.csv')) {
            status = 'error';
            error = 'Please upload a CSV file';
            return;
        }

        status = 'parsing';
        error = null;

        try {
            const content = await file.text();
            const result = parseGarminCsv(content, 2025);

            if (result.activities.length === 0) {
                status = 'error';
                error = 'No 2025 activities found in the file';
                parseErrors = result.errors;
                return;
            }

            activities = result.activities;
            parseErrors = result.errors;

            // Calculate all stats
            stats = calculateYearStats(activities);
            records = calculatePersonalRecords(activities);
            breakdown = calculateSportBreakdown(activities);

            status = 'ready';
        } catch (err) {
            status = 'error';
            error = err instanceof Error ? err.message : 'Failed to parse file';
        }
    }

    return {
        get activities() {
            return activities;
        },
        get stats() {
            return stats;
        },
        get records() {
            return records;
        },
        get breakdown() {
            return breakdown;
        },
        get status() {
            return status;
        },
        get error() {
            return error;
        },
        get parseErrors() {
            return parseErrors;
        },
        // Export state getters and setters
        get aspectRatio() {
            return aspectRatio;
        },
        set aspectRatio(value: AspectRatio) {
            aspectRatio = value;
        },
        get userName() {
            return userName;
        },
        set userName(value: string) {
            userName = value;
        },
        reset,
        processFile
    };
}

export const appStore = createAppStore();
