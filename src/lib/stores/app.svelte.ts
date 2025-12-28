import { parseGarminCsv } from '../parsers/garmin.js';
import {
    calculateYearStats,
    calculatePersonalRecords,
    calculateSportBreakdown
} from '../utils/stats.js';
import { demoStats, demoRecords, demoBreakdown } from '../data/demo.js';
import type {
    Activity,
    YearStats,
    PersonalRecords,
    SportBreakdown,
    ParseError,
    AspectRatio,
    Theme
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
    userName: string;
    theme: Theme;
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
    let userName = $state<string>('');
    let theme = $state<Theme>('neon');
    let confettiEnabled = $state<boolean>(false);

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

    function loadDemoData() {
        reset();
        stats = demoStats;
        records = demoRecords;
        breakdown = demoBreakdown;
        // Mock activities for potential future needs, though charts use aggregated stats
        activities = [];
        status = 'ready';
    }

    // UI state
    let breakdownMetric = $state<'count' | 'duration'>('count');

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
        get userName() {
            return userName;
        },
        set userName(value: string) {
            userName = value;
        },
        get theme() {
            return theme;
        },
        set theme(value: Theme) {
            theme = value;
        },
        reset,
        processFile,
        loadDemoData,
        get confettiEnabled() {
            return confettiEnabled;
        },
        set confettiEnabled(value: boolean) {
            confettiEnabled = value;
        },
        get breakdownMetric() {
            return breakdownMetric;
        },
        set breakdownMetric(value: 'count' | 'duration') {
            breakdownMetric = value;
        }
    };
}

export const appStore = createAppStore();
