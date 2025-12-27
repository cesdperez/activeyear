import type { Unit } from '../types/index.js';

const EARTH_CIRCUMFERENCE_KM = 40075;
const EVEREST_HEIGHT_M = 8848;
const PIZZA_SLICE_CALORIES = 285;
const KM_TO_MILES = 0.621371;

/**
 * Format distance with appropriate precision
 * - Under 100: no decimals
 * - 100+: one decimal
 */
export function formatDistance(km: number, unit: Unit = 'km'): string {
    const value = unit === 'miles' ? km * KM_TO_MILES : km;
    const suffix = unit === 'miles' ? 'mi' : 'km';

    if (value < 100) {
        return `${Math.round(value)} ${suffix}`;
    }
    return `${value.toFixed(1)} ${suffix}`;
}

/**
 * Format duration in seconds to "Xh Ym" format
 */
export function formatDuration(seconds: number): string {
    if (seconds <= 0) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
}

/**
 * Format calories with thousands separator
 */
export function formatCalories(calories: number): string {
    return Math.round(calories / 100) * 100 > 0
        ? Math.round(calories).toLocaleString('en-US')
        : '0';
}

/**
 * Format elevation rounded to nearest 10m
 */
export function formatElevation(meters: number): string {
    const rounded = Math.round(meters / 10) * 10;
    return `${rounded.toLocaleString('en-US')}m`;
}

/**
 * Calculate Earth laps from total distance in km
 */
export function calculateEarthLaps(distanceKm: number): number {
    return distanceKm / EARTH_CIRCUMFERENCE_KM;
}

/**
 * Format Earth laps for display
 */
export function formatEarthLaps(distanceKm: number): string {
    const laps = calculateEarthLaps(distanceKm);
    if (laps < 0.01) {
        return `${(laps * 100).toFixed(1)}% around Earth`;
    }
    return `${laps.toFixed(2)}× around Earth`;
}

/**
 * Calculate Everests climbed from total elevation in meters
 */
export function calculateEverests(elevationM: number): number {
    return elevationM / EVEREST_HEIGHT_M;
}

/**
 * Format Everests for display
 */
export function formatEverests(elevationM: number): string {
    const everests = calculateEverests(elevationM);
    if (everests < 0.1) {
        return `${(everests * 100).toFixed(0)}% of Everest`;
    }
    return `${everests.toFixed(1)} Everests`;
}

/**
 * Calculate pizza slices from calories
 */
export function calculatePizzaSlices(calories: number): number {
    return Math.round(calories / PIZZA_SLICE_CALORIES);
}

/**
 * Format pizza slices for display
 */
export function formatPizzaSlices(calories: number): string {
    const slices = calculatePizzaSlices(calories);
    return `${slices.toLocaleString('en-US')} slices`;
}

/**
 * Format activity count with type name
 */
export function formatActivityCount(count: number, type: string): string {
    const pluralType = count === 1 ? type : `${type}s`;
    return `${count} ${pluralType}`;
}
