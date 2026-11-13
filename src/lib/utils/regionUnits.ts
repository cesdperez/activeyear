import type { GarminUnits } from '#lib/types/index.js';

const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM']);

function region(language: string): string | undefined {
	try {
		return new Intl.Locale(language).region;
	} catch {
		return undefined;
	}
}

/** Guesses the unit system from browser languages such as `navigator.languages`. */
export function unitsForLanguages(languages: readonly string[]): GarminUnits {
	const first = languages.map(region).find((value) => value !== undefined);
	return first && IMPERIAL_REGIONS.has(first) ? 'imperial' : 'metric';
}
