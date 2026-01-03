import { describe, it, expect } from 'vitest';
import { parseGarminCsv } from './garmin.js';

describe('Garmin Parser - Meter-based Activities', () => {
    it('correctly handles Track Running distance in meters (exact row)', () => {
        const csv = 'Activity Type,Date,Favorite,Title,Distance,Calories,Time\n' +
            'Track Running,2025-10-15 18:01:12,false,Parksville Track Running,"6,640",513,00:58:51';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('running');
        expect(activity.distance).toBe(6.64);
        expect(activity.calories).toBe(513);
        expect(activity.duration).toBe(58 * 60 + 51);
    });

    it('correctly handles Indoor Rowing distance in meters (exact row)', () => {
        const csv = 'Activity Type,Date,Favorite,Title,Distance,Calories,Time\n' +
            'Indoor Rowing,2025-01-21 16:50:29,false,Endurance row,"11,093",383,01:00:09.0';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('rowing');
        expect(activity.distance).toBe(11.093);
        expect(activity.calories).toBe(383);
        expect(activity.duration).toBe(3609); // 1h 00m 09s
    });

    it('correctly handles Rowing distance in meters', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time\n' +
            'Rowing,2025-01-21 16:50:29,Morning Row,"5,000",300,00:25:00';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('rowing');
        expect(activity.distance).toBe(5.0);
    });
});
