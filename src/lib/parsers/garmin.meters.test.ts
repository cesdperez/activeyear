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

    it('correctly handles Paddlesport distance in meters (SUP)', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time\n' +
            'SUP,2025-07-15 10:00:00,Summer SUP,"3,500",250,01:10:00';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('paddling');
        expect(activity.distance).toBe(3.5);
    });

    it('correctly handles Paddlesport distance in meters (Kayaking)', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time\n' +
            'Kayaking,2025-08-10 14:00:00,Lake Kayak,"8,200",400,01:45:00';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('paddling');
        expect(activity.distance).toBe(8.2);
    });

    it('correctly handles Indoor Track distance in meters', () => {
        const csv = 'Activity Type,Date,Title,Distance,Calories,Time\n' +
            'Indoor Track,2025-02-15 18:00:00,Indoor Track Session,"2,400",180,00:15:00';

        const result = parseGarminCsv(csv, 2025);
        expect(result.activities).toHaveLength(1);
        const activity = result.activities[0];
        expect(activity.type).toBe('running');
        expect(activity.distance).toBe(2.4);
    });
});
