import { describe, expect, it, beforeAll } from 'vitest';
import { parseGarminCsv } from './garmin.js';
import { loadFixture } from './__fixtures__/load.js';
import { calculateYearStats, calculateSportBreakdown } from '../utils/stats.js';
import type { Activity, YearStats, SportBreakdown } from '../types/index.js';

describe('Integration: Real Garmin Export', () => {
	// Expected values based on actual CSV content
	// Note: CSV has 470 activities for 2025 (Garmin screenshot shows 485)
	// Some values differ from Garmin dashboard due to export timing and calculation methods
	const EXPECTED = {
		activityCount: 470, // Actual count in CSV for 2025
		totalDistanceKm: 5661, // Calculated from CSV (Garmin: 5690km)
		totalDurationMinutes: 24187, // Moving time for distance sports, Time for the rest and pool swims
		totalElevationMeters: 17459, // From Total Ascent column (Garmin shows "Climbing" which may differ)
		totalCalories: 209152, // Calculated from CSV
		activeDays: 298 // Same as Garmin
	};

	// Parse once before all tests
	let activities: Activity[];
	let stats: YearStats;
	let breakdown: SportBreakdown[];

	beforeAll(() => {
		const result = parseGarminCsv(loadFixture('garmin-activities.csv'), 2025);
		activities = result.activities;
		stats = calculateYearStats(activities);
		breakdown = calculateSportBreakdown(activities);
	});

	it('parses all 2025 activities from the export', () => {
		expect(activities.length).toBe(EXPECTED.activityCount);
	});

	it('calculates total distance correctly', () => {
		// Allow 1km tolerance for rounding differences
		expect(stats.totalDistance).toBeCloseTo(EXPECTED.totalDistanceKm, 0);
	});

	it('calculates total duration correctly', () => {
		// Duration is in seconds, convert to minutes for comparison
		const totalMinutes = stats.totalDuration / 60;

		// Allow 5 minute tolerance
		expect(totalMinutes).toBeCloseTo(EXPECTED.totalDurationMinutes, -1);
	});

	it('calculates total elevation correctly', () => {
		// Allow 100m tolerance for rounding differences
		expect(stats.totalElevation).toBeCloseTo(EXPECTED.totalElevationMeters, -2);
	});

	it('calculates total calories correctly', () => {
		// Allow 500 calorie tolerance
		expect(stats.totalCalories).toBeCloseTo(EXPECTED.totalCalories, -3);
	});

	it('calculates active days correctly', () => {
		expect(stats.activeDays).toBe(EXPECTED.activeDays);
	});

	it('includes swimming activities in breakdown', () => {
		const swimming = breakdown.find((b) => b.type === 'swimming');
		expect(swimming).toBeDefined();
		// Swimming distances should be in km (small numbers), not meters
		expect(swimming!.distance).toBeLessThan(100); // Should be ~52km, not 52000
	});
});
