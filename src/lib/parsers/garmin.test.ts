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

    it('parses number with comma thousands separator (English)', () => {
        expect(parseGarminDistance('1,500')).toBe(1500);
    });

    it('parses number with comma decimal separator (European)', () => {
        expect(parseGarminDistance('45,25')).toBe(45.25);
    });

    it('parses number with dot thousands and comma decimal (European)', () => {
        expect(parseGarminDistance('1.234,56')).toBe(1234.56);
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

    it('parses number with comma thousands (English)', () => {
        expect(parseGarminCalories('2,800')).toBe(2800);
    });

    it('parses number with dot thousands (European)', () => {
        expect(parseGarminCalories('1.540')).toBe(1540);
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

    it('handles swimming distance converted from meters to km', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const swim = result.activities.find((a) => a.type === 'swimming');

        expect(swim).toBeDefined();
        // Swimming distances are in meters in Garmin CSV, we convert to km
        // 1,500 meters = 1.5 km
        expect(swim?.distance).toBe(1.5);
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

    it('detects non-English headers and returns wrong-language error', () => {
        // Spanish headers
        const spanishCsv = 'Tipo de actividad,Fecha,Título,Distancia,Calorías,Tiempo,Ascenso total\nCarrera,2025-01-01 08:00:00,Morning Run,10.0,600,00:50:00,100';
        const result = parseGarminCsv(spanishCsv, 2025);

        expect(result.activities).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('wrong-language');
        expect(result.errors[0].message).toContain('English');
    });
});

describe('parseGarminCsv with garmin-sample-2.csv', () => {
    it('parses sample 2 CSV file correctly', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);

        expect(result.errors).toHaveLength(0);
        // 177 activities from 2025 (excludes 24 from 2024 at the bottom)
        expect(result.activities.length).toBeGreaterThan(150);
    });

    it('correctly parses Cardio activities as cardio type', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const cardioActivities = result.activities.filter((a) => a.type === 'cardio');

        // There are many CrossFit activities in the file
        expect(cardioActivities.length).toBeGreaterThan(30);
        expect(cardioActivities.some((a) => a.title === 'CrossFit')).toBe(true);
    });

    it('correctly parses Running activities (not as other)', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const runningActivities = result.activities.filter((a) => a.type === 'running');

        // There are many running activities
        expect(runningActivities.length).toBeGreaterThan(50);
    });

    it('correctly parses Hiking activities', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);
        const hikingActivities = result.activities.filter((a) => a.type === 'hiking');

        expect(hikingActivities.length).toBeGreaterThan(15);
    });

    it('correctly parses duration from Total Time column', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);

        // All activities should have non-zero duration
        const activitiesWithDuration = result.activities.filter((a) => a.duration > 0);
        expect(activitiesWithDuration.length).toBe(result.activities.length);
    });

    it('finds the longest duration activity (personal record)', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample-2.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);

        // Find activity with longest duration
        const longestDuration = result.activities.reduce((max, a) =>
            a.duration > max.duration ? a : max, result.activities[0]);

        // There should be hiking activities with several hours duration
        expect(longestDuration.duration).toBeGreaterThan(3600 * 5); // > 5 hours
    });
});

describe('mapActivityType extended', () => {
    it('maps Cardio to cardio', () => {
        expect(mapActivityType('Cardio')).toBe('cardio');
    });

    it('maps CrossFit to cardio', () => {
        expect(mapActivityType('CrossFit')).toBe('cardio');
    });

    it('maps HIIT to cardio', () => {
        expect(mapActivityType('HIIT')).toBe('cardio');
    });

    it('maps Padel to other', () => {
        expect(mapActivityType('Padel')).toBe('other');
    });

    it('maps Skating to other', () => {
        expect(mapActivityType('Skating')).toBe('other');
    });
});

describe('parseGarminCsv favorite field', () => {
    it('parses Favorite column correctly', () => {
        const csvPath = join(__dirname, '__fixtures__', 'garmin-sample.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');

        const result = parseGarminCsv(csvContent, 2025);

        // All activities in the sample have Favorite=false
        expect(result.activities.every((a) => a.favorite === false)).toBe(true);
    });

    it('sets favorite to false when Favorite column is missing', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time,Total Ascent\nRunning,2025-01-01 08:00:00,Morning Run,10.0,600,00:50:00,100';
        const result = parseGarminCsv(csv, 2025);

        expect(result.activities).toHaveLength(1);
        expect(result.activities[0].favorite).toBe(false);
    });

    it('parses Favorite=true correctly', () => {
        const csv = 'Activity Type,Date,Favorite,Title,Distance,Calories,Time,Total Ascent\nRunning,2025-01-01 08:00:00,true,Best Run Ever,10.0,600,00:50:00,100';
        const result = parseGarminCsv(csv, 2025);

        expect(result.activities).toHaveLength(1);
        expect(result.activities[0].favorite).toBe(true);
        expect(result.activities[0].title).toBe('Best Run Ever');
    });
});

describe('parseGarminCsv with special formats', () => {
    it('handles whole-row quoted format correctly', () => {
        const csv = '"Activity Type,Date,Title,Distance,Calories,Time"\n' +
            '"Running,2025-01-01 08:00:00,Morning Run,""10,0"",600,00:50:00"';
        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        expect(result.activities[0].title).toBe('Morning Run');
        expect(result.activities[0].distance).toBe(10.0);
    });

    it('handles whole-row quoted format with internal newlines', () => {
        const csv = '"Activity Type,Date,Title,Distance,Calories,Time"\n' +
            '"Running,2025-01-01 08:00:00,""Multi\nLine Title"",10.0,600,00:50:00"';
        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        expect(result.activities[0].title).toBe('Multi\nLine Title');
    });

    it('handles mixed quoted and unquoted header/rows', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time\n' +
            '"Running,2025-01-01 08:00:00,Morning Run,10.0,600,00:50:00"';
        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        expect(result.activities[0].title).toBe('Morning Run');
    });
});
