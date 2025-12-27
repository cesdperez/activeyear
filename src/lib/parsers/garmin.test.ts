import { describe, it, expect } from 'vitest';
import {
    parseGarminCsv,
    parseGarminTime,
    parseGarminDistance,
    parseGarminCalories,
    parseGarminElevation,
    mapActivityType,
    parseGarminDate,
    isInYear
} from './garmin.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('parseGarminTime', () => {
    it('parses HH:MM:SS format', () => {
        expect(parseGarminTime('01:30:45')).toBe(5445); // 1h30m45s = 5445s
    });

    it('parses HH:MM:SS.S format with decimal seconds', () => {
        expect(parseGarminTime('00:02:10.0')).toBe(130);
    });

    it('returns 0 for empty string', () => {
        expect(parseGarminTime('')).toBe(0);
    });

    it('returns 0 for "--"', () => {
        expect(parseGarminTime('--')).toBe(0);
    });

    it('parses hours correctly', () => {
        expect(parseGarminTime('03:34:48')).toBe(12888); // 3h34m48s
    });
});

describe('parseGarminDistance', () => {
    it('parses simple decimal', () => {
        expect(parseGarminDistance('10.33')).toBe(10.33);
    });

    it('parses number with comma thousands separator', () => {
        expect(parseGarminDistance('1,500')).toBe(1500);
    });

    it('returns 0 for "--"', () => {
        expect(parseGarminDistance('--')).toBe(0);
    });

    it('returns 0 for empty string', () => {
        expect(parseGarminDistance('')).toBe(0);
    });
});

describe('parseGarminCalories', () => {
    it('parses simple integer', () => {
        expect(parseGarminCalories('658')).toBe(658);
    });

    it('parses number with comma', () => {
        expect(parseGarminCalories('2,800')).toBe(2800);
    });

    it('returns 0 for "--"', () => {
        expect(parseGarminCalories('--')).toBe(0);
    });
});

describe('parseGarminElevation', () => {
    it('parses simple integer', () => {
        expect(parseGarminElevation('32')).toBe(32);
    });

    it('parses number with comma', () => {
        expect(parseGarminElevation('1,185')).toBe(1185);
    });

    it('returns 0 for "--"', () => {
        expect(parseGarminElevation('--')).toBe(0);
    });
});

describe('mapActivityType', () => {
    it('maps Running to running', () => {
        expect(mapActivityType('Running')).toBe('running');
    });

    it('maps Indoor Cycling to cycling', () => {
        expect(mapActivityType('Indoor Cycling')).toBe('cycling');
    });

    it('maps Virtual Cycling to cycling', () => {
        expect(mapActivityType('Virtual Cycling')).toBe('cycling');
    });

    it('maps Pool Swim to swimming', () => {
        expect(mapActivityType('Pool Swim')).toBe('swimming');
    });

    it('maps Open Water Swimming to swimming', () => {
        expect(mapActivityType('Open Water Swimming')).toBe('swimming');
    });

    it('maps Strength Training to strength', () => {
        expect(mapActivityType('Strength Training')).toBe('strength');
    });

    it('maps Yoga to yoga', () => {
        expect(mapActivityType('Yoga')).toBe('yoga');
    });

    it('maps Walking to walking', () => {
        expect(mapActivityType('Walking')).toBe('walking');
    });

    it('maps unknown types to other', () => {
        expect(mapActivityType('Bouldering')).toBe('other');
        expect(mapActivityType('Multisport')).toBe('other');
    });
});

describe('parseGarminDate', () => {
    it('parses Garmin date format', () => {
        const date = parseGarminDate('2025-12-27 14:12:58');
        expect(date).not.toBeNull();
        expect(date?.getFullYear()).toBe(2025);
        expect(date?.getMonth()).toBe(11); // December (0-indexed)
        expect(date?.getDate()).toBe(27);
    });

    it('returns null for empty string', () => {
        expect(parseGarminDate('')).toBeNull();
    });

    it('returns null for invalid date', () => {
        expect(parseGarminDate('not-a-date')).toBeNull();
    });
});

describe('isInYear', () => {
    it('returns true for matching year', () => {
        expect(isInYear(new Date('2025-06-15'), 2025)).toBe(true);
    });

    it('returns false for different year', () => {
        expect(isInYear(new Date('2024-12-31'), 2025)).toBe(false);
    });
});

describe('parseGarminCsv', () => {
    it('parses sample CSV file correctly', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);

        expect(result.errors).toHaveLength(0);
        // Should exclude the 2024 activity (10 rows - 1 from 2024 = 9? Actually 9 data rows, 1 is 2024)
        expect(result.activities).toHaveLength(8);
    });

    it('filters to specified year only', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result2025 = parseGarminCsv(csvContent, 2025);
        const result2024 = parseGarminCsv(csvContent, 2024);

        expect(result2025.activities).toHaveLength(8);
        expect(result2024.activities).toHaveLength(1);
        expect(result2024.activities[0].title).toBe('Last Year Run');
    });

    it('correctly parses activity types', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const types = result.activities.map((a) => a.type);

        expect(types).toContain('running');
        expect(types).toContain('cycling');
        expect(types).toContain('strength');
        expect(types).toContain('yoga');
        expect(types).toContain('swimming');
        expect(types).toContain('walking');
    });

    it('correctly parses marathon activity', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const marathon = result.activities.find((a) => a.title === 'Valencia Marathon');

        expect(marathon).toBeDefined();
        expect(marathon?.distance).toBe(42.63);
        expect(marathon?.calories).toBe(2800);
        expect(marathon?.duration).toBe(12888); // 3:34:48 in seconds
        expect(marathon?.elevation).toBe(105);
    });

    it('handles swimming distance with thousands separator', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const swim = result.activities.find((a) => a.type === 'swimming');

        expect(swim).toBeDefined();
        expect(swim?.distance).toBe(1500);
    });

    it('handles activities with missing distance (like yoga)', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const yoga = result.activities.find((a) => a.type === 'yoga');

        expect(yoga).toBeDefined();
        expect(yoga?.distance).toBe(0);
    });

    it('returns empty array for empty CSV', () => {
        const result = parseGarminCsv('', 2025);
        expect(result.activities).toHaveLength(0);
    });

    it('handles CSV with only header row', () => {
        const result = parseGarminCsv('Activity Type,Date,Title,Distance,Calories,Time,Total Ascent', 2025);
        expect(result.activities).toHaveLength(0);
    });
});
