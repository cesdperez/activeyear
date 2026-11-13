import type { Activity, Locale, Unit } from '#lib/types/index.js';
import { INTL_LOCALES } from '#lib/constants/locales.js';
import { MESSAGES } from '#lib/i18n/messages/index.js';
import { ONE_HOUR_IN_SECONDS, ONE_MINUTE_IN_SECONDS } from '#lib/constants/time.js';
import { KM_TO_MILES, METERS_TO_FEET } from '#lib/constants/units.js';

export function activityTitle(locale: Locale, activity: Activity): string {
	return (
		activity.title ||
		MESSAGES[locale].common.sports[activity.type] ||
		MESSAGES[locale].export.activity
	);
}

const EARTH_CIRCUMFERENCE_KM = 40075;
const EVEREST_HEIGHT_M = 8848;
const PIZZA_SLICE_CALORIES = 285;

export function roundedDistance(km: number, unit: Unit): number {
	const value = unit === 'miles' ? km * KM_TO_MILES : km;
	return Number(value.toFixed(1));
}

export function roundedElevation(meters: number, unit: Unit): number {
	const step = unit === 'miles' ? 50 : 10;
	const value = unit === 'miles' ? meters * METERS_TO_FEET : meters;
	return Math.round(value / step) * step;
}

/**
 * Format distance with appropriate precision
 * - Under 100: one decimal
 * - 100+: no decimals
 */
export function formatDistance(locale: Locale, km: number, unit: Unit = 'km'): string {
	const value = unit === 'miles' ? km * KM_TO_MILES : km;
	const suffix = unit === 'miles' ? 'mi' : 'km';

	const oneDecimal = roundedDistance(km, unit);
	if (Number(oneDecimal) >= 100) {
		return `${formatCount(locale, Math.round(value))}${suffix}`;
	}
	return `${localeNumber(locale, Number(oneDecimal), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${suffix}`;
}

/** "Xh Ym", "Xh" on a whole hour, "Ym" under an hour, or "Xs" under a minute. */
export function formatDuration(locale: Locale, seconds: number): string {
	if (seconds <= 0) return '0m';
	const underAMinute = secondsUnderAMinute(seconds);
	if (underAMinute !== undefined) return `${underAMinute}s`;

	const hours = Math.floor(seconds / ONE_HOUR_IN_SECONDS);
	const minutes = Math.floor((seconds % ONE_HOUR_IN_SECONDS) / ONE_MINUTE_IN_SECONDS);

	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${formatCount(locale, hours)}h`;
	return `${formatCount(locale, hours)}h ${minutes}m`;
}

/** Whole seconds, at least 1, for a duration under a minute; `undefined` for none or a minute and up. */
export function secondsUnderAMinute(seconds: number): number | undefined {
	if (seconds <= 0 || seconds >= ONE_MINUTE_IN_SECONDS) return undefined;
	return Math.max(1, Math.floor(seconds));
}

/** Whether a formatted stat shows anything but zero, so "0.0km" and "0ft" do not count. */
export function showsValue(formatted: string): boolean {
	return /[1-9]/.test(formatted);
}

/** Whole number with thousands separators, matching the other stats. */
export function formatCount(locale: Locale, count: number): string {
	return localeNumber(locale, count);
}

// The theme fonts lack U+202F, the French group and percent space, so each engine would draw it
// with a different fallback font and width.
function localeNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions): string {
	return new Intl.NumberFormat(INTL_LOCALES[locale], options)
		.format(value)
		.replaceAll('\u202f', '\u00a0');
}

/** Whole percent, but "<1%" for a share that is above zero and would round to 0%. */
export function formatPercentOfYear(locale: Locale, percent: number): string {
	return formatShare(locale, percent, 0);
}

/** A share under 100%, floored to "<1%" (or "<0.1%") so a non-zero share never shows as 0. */
function formatShare(locale: Locale, percent: number, decimals: number): string {
	const smallest = 10 ** -decimals;
	if (percent > 0 && percent < smallest / 2) return `<${formatPercent(locale, smallest, decimals)}`;
	return formatPercent(locale, partialPercent(percent, decimals), decimals);
}

function partialPercent(percent: number, decimals: number): number {
	if (percent >= 100) return 100;
	// A share just under 100 would otherwise round up to a full 100.
	const highestPartial = 100 - 10 ** -decimals;
	return Math.min(Number(percent.toFixed(decimals)), highestPartial);
}

function formatPercent(locale: Locale, percent: number, decimals: number): string {
	return localeNumber(locale, percent / 100, {
		style: 'percent',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}

function fixed(locale: Locale, value: number, decimals: number): string {
	return localeNumber(locale, Number(value.toFixed(decimals)), {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: false
	});
}

/**
 * Format calories with thousands separator
 */
export function formatCalories(locale: Locale, calories: number): string {
	return `${localeNumber(locale, Math.round(calories))}kcal`;
}

/**
 * Format elevation rounded to nearest 10m (or 50ft)
 */
export function formatElevation(locale: Locale, meters: number, unit: Unit = 'km'): string {
	if (unit === 'miles') {
		const rounded = roundedElevation(meters, unit);
		return `${localeNumber(locale, rounded)}ft`;
	}
	const rounded = roundedElevation(meters, unit);
	return `${localeNumber(locale, rounded)}m`;
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
export function formatEarthLaps(locale: Locale, distanceKm: number): string {
	const laps = calculateEarthLaps(distanceKm);
	const common = MESSAGES[locale].common;
	if (laps < 1.0) return common.earthPartial(formatShare(locale, laps * 100, 1));
	return common.earthLaps(fixed(locale, laps, 2));
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
export function formatEverests(locale: Locale, elevationM: number): string {
	const everests = calculateEverests(elevationM);
	const common = MESSAGES[locale].common;
	if (everests < 1.0) return common.everestPartial(formatShare(locale, everests * 100, 0));
	return common.everestMultiple(fixed(locale, everests, 1));
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
export function formatPizzaSlices(locale: Locale, calories: number): string {
	const slices = calculatePizzaSlices(calories);
	if (slices === 0 && calories > 0) return MESSAGES[locale].common.lessPizza;
	return `${formatCount(locale, slices)} ${MESSAGES[locale].common.pizza(slices)}`;
}

export function formatActivityCount(locale: Locale, count: number, type: string): string {
	const nouns = MESSAGES[locale].common.nouns;
	const noun = nouns[type.toLowerCase() as keyof typeof nouns];
	return `${formatCount(locale, count)} ${noun ? noun(count) : count === 1 ? type : `${type}s`}`;
}

const LOTR_MARATHON_SECONDS = 42960; // 11h 56m (Extended Editions total)

/**
 * Calculate LotR marathons from seconds
 */
export function calculateLotRMarathons(seconds: number): number {
	return seconds / LOTR_MARATHON_SECONDS;
}

/**
 * Format LotR marathons for display
 */
export function formatLotRMarathons(locale: Locale, seconds: number): string {
	const marathons = calculateLotRMarathons(seconds);
	const shown =
		marathons > 0 && marathons < 0.05 ? `<${fixed(locale, 0.1, 1)}` : fixed(locale, marathons, 1);
	return `${shown} ${MESSAGES[locale].common.lotr}`;
}

export function formatDayMonth(locale: Locale, date: Date): string {
	return date.toLocaleDateString(INTL_LOCALES[locale], { month: 'long', day: 'numeric' });
}

export function formatShortDate(locale: Locale, date: Date): string {
	return date.toLocaleDateString(INTL_LOCALES[locale], { month: 'short', day: 'numeric' });
}
