import Papa from 'papaparse';
import type {
    Activity,
    ActivityType,
    GarminRawActivity,
    ParseError,
    ParseResult
} from '../types/index.js';

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
    Running: 'running',
    'Trail Running': 'running',
    'Treadmill Running': 'running',
    Cycling: 'cycling',
    'Indoor Cycling': 'cycling',
    'Virtual Cycling': 'cycling',
    'Road Cycling': 'cycling',
    'Mountain Biking': 'cycling',
    'eMountain Biking': 'cycling',
    'Gravel Cycling': 'cycling',
    Swimming: 'swimming',
    'Pool Swim': 'swimming',
    'Open Water Swimming': 'swimming',
    Walking: 'walking',
    Hiking: 'hiking',
    'Strength Training': 'strength',
    Strength: 'strength',
    Yoga: 'yoga',
    Pilates: 'yoga',
    Cardio: 'cardio',
    CrossFit: 'cardio',
    HIIT: 'cardio',
    Padel: 'other',
    Skating: 'other',
    'Ice Skating': 'other',
    Multisport: 'other',
    'Rock Climbing': 'other'
};

// Activity types where distances are recorded in meters (not km)
const DISTANCE_IN_METERS_TYPES = new Set([
    'Pool Swim',
    'Open Water Swimming',
    'Swimming'
]);

/**
 * Parse Garmin time format (HH:MM:SS or MM:SS.S) to seconds
 */
export function parseGarminTime(timeStr: string): number {
    if (!timeStr || timeStr === '--') return 0;

    // Handle MM:SS.S format (e.g., "00:02:10.0")
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseFloat(parts[1]);
        return minutes * 60 + seconds;
    }
    return 0;
}

/**
 * Parse Garmin distance string to km
 */
export function parseGarminDistance(distanceStr: string): number {
    if (!distanceStr || distanceStr === '--') return 0;
    // Remove commas and parse (Garmin uses comma as thousands separator)
    const cleaned = distanceStr.replace(/,/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
}

/**
 * Parse Garmin calories string to number
 */
export function parseGarminCalories(caloriesStr: string): number {
    if (!caloriesStr || caloriesStr === '--') return 0;
    const cleaned = caloriesStr.replace(/,/g, '');
    const value = parseInt(cleaned, 10);
    return isNaN(value) ? 0 : value;
}

/**
 * Parse Garmin elevation string to meters
 */
export function parseGarminElevation(elevationStr: string): number {
    if (!elevationStr || elevationStr === '--') return 0;
    const cleaned = elevationStr.replace(/,/g, '');
    const value = parseInt(cleaned, 10);
    return isNaN(value) ? 0 : value;
}

/**
 * Map Garmin activity type to internal ActivityType
 */
export function mapActivityType(garminType: string): ActivityType {
    return ACTIVITY_TYPE_MAP[garminType] || 'other';
}

/**
 * Parse Garmin date format (YYYY-MM-DD HH:MM:SS) to Date
 */
export function parseGarminDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is in the target year
 */
export function isInYear(date: Date, year: number): boolean {
    return date.getFullYear() === year;
}

/**
 * Parse a Garmin CSV string and return activities for the specified year
 */
export function parseGarminCsv(csvContent: string, targetYear: number = 2025): ParseResult {
    const activities: Activity[] = [];
    const errors: ParseError[] = [];

    const parseResult = Papa.parse<GarminRawActivity>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
    });

    // Check if the expected headers are present (detect wrong language)
    const expectedHeaders = ['Activity Type', 'Date', 'Distance'];
    const actualHeaders = parseResult.meta.fields || [];
    const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));

    if (missingHeaders.length > 1) { // If multiple key headers are missing, it's likely the wrong language
        return {
            activities: [],
            errors: [{
                type: 'wrong-language',
                row: 0,
                message: 'Is your Garmin Connect in English? We couldn\'t find the expected headers. Please export your CSV in English.'
            }]
        };
    }

    if (parseResult.errors.length > 0) {
        parseResult.errors.forEach((error) => {
            errors.push({
                type: 'unknown',
                row: error.row ?? 0,
                message: error.message
            });
        });
    }

    parseResult.data.forEach((row, index) => {
        const rowNum = index + 2; // +2 because of header row and 1-indexing

        // Check required columns
        if (!row['Activity Type'] || !row['Date']) {
            errors.push({
                type: 'missing-column',
                row: rowNum,
                message: 'Missing required column (Activity Type or Date)'
            });
            return;
        }

        // Parse date
        const date = parseGarminDate(row['Date']);
        if (!date) {
            errors.push({
                type: 'invalid-date',
                row: rowNum,
                message: `Invalid date format: ${row['Date']}`
            });
            return;
        }

        // Filter to target year
        if (!isInYear(date, targetYear)) {
            return;
        }

        // Parse distance - swimming activities are in meters, convert to km
        let distance = parseGarminDistance(row['Distance']);
        if (DISTANCE_IN_METERS_TYPES.has(row['Activity Type'])) {
            distance = distance / 1000; // Convert meters to km
        }

        const activity: Activity = {
            date,
            type: mapActivityType(row['Activity Type']),
            title: row['Title'] || '',
            distance,
            duration: parseGarminTime(row['Total Time'] || row['Time']),
            calories: parseGarminCalories(row['Calories']),
            elevation: parseGarminElevation(row['Total Ascent'])
        };

        activities.push(activity);
    });

    return { activities, errors };
}
