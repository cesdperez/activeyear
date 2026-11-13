import type { HighlightPreset } from '#lib/types/index.js';

export const HIGHLIGHT_PRESETS: Record<HighlightPreset, { label: string; description: string }> = {
	longest: { label: 'Longest', description: 'Your longest sessions of the year.' },
	farthest: { label: 'Farthest', description: 'The days you went the distance.' },
	climbs: { label: 'Biggest climbs', description: 'Where you gained the most elevation.' },
	'per-sport': { label: 'Best of each sport', description: 'Your longest session in every sport.' },
	'best-month': { label: 'Epic month', description: 'The month you moved the most, at its best.' },
	favorites: {
		label: 'Garmin favorites',
		description: 'The activities you starred in Garmin Connect.'
	}
};

export const HIGHLIGHT_SEARCH_LIMIT = 8;
