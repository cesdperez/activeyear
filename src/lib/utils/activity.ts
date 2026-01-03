import type { SportBreakdown } from '$lib/types';
import { ONE_HOUR_IN_SECONDS } from '../constants/time.js';


/**
 * Consolidates sports with less than 1 hour of total duration into an "other" category.
 */
export function consolidateBreakdown(breakdown: SportBreakdown[]): SportBreakdown[] {
    const result: SportBreakdown[] = [];
    let otherEntry: SportBreakdown | null = null;

    for (const sport of breakdown) {
        if (sport.type === 'other') {
            // Keep track of existing "other" entry
            if (!otherEntry) {
                otherEntry = { ...sport };
            } else {
                otherEntry.distance += sport.distance;
                otherEntry.duration += sport.duration;
                otherEntry.count += sport.count;
            }
        } else if (sport.duration < ONE_HOUR_IN_SECONDS) {
            // Consolidate small sports into "other"
            if (!otherEntry) {
                otherEntry = {
                    type: 'other',
                    distance: 0,
                    duration: 0,
                    count: 0,
                };
            }
            otherEntry.distance += sport.distance;
            otherEntry.duration += sport.duration;
            otherEntry.count += sport.count;
        } else {
            result.push({ ...sport });
        }
    }

    // Add the consolidated "other" if it exists
    if (otherEntry && otherEntry.count > 0) {
        result.push(otherEntry);
    }

    return result;
}
