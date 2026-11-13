import {
	PersonSimpleRun,
	PersonSimpleBike,
	PersonSimpleSwim,
	PersonSimpleWalk,
	Mountains,
	Barbell,
	PersonSimpleTaiChi,
	Target,
	Heartbeat,
	Waves,
	Anchor,
	PersonSimpleSki,
	Racquet,
	HandGrabbing
} from 'phosphor-svelte';
import type { ActivityType, Theme } from '#lib/types/index.js';

export const ACTIVITY_TYPES: ActivityType[] = [
	'running',
	'cycling',
	'swimming',
	'walking',
	'hiking',
	'strength',
	'yoga',
	'paddling',
	'rowing',
	'cardio',
	'winter',
	'racket',
	'climbing',
	'other'
];

// Sport icons mapping (using Phosphor for bold, activity-specific icons)
export const sportIcons: Record<ActivityType, typeof PersonSimpleRun> = {
	running: PersonSimpleRun,
	cycling: PersonSimpleBike,
	swimming: PersonSimpleSwim,
	walking: PersonSimpleWalk,
	hiking: Mountains,
	strength: Barbell,
	yoga: PersonSimpleTaiChi,
	paddling: Waves,
	rowing: Anchor,
	cardio: Heartbeat,
	winter: PersonSimpleSki,
	racket: Racquet,
	climbing: HandGrabbing,
	other: Target
};
export interface SportPalette {
	/** Ranked colours, wrapping when a year has more sports than colours. */
	colors: string[];
	other: string;
}

const RETRO_SECONDARY_COLORS = ['#5fe08a', '#ff7a7a', '#6fa8ff', '#ff7ccf', '#ff9f45'];

export const SPORT_PALETTES: Record<Theme, SportPalette> = {
	neon: {
		colors: [
			'#48d8e4',
			'#ff7d66',
			'#d3e85e',
			'#ffbf47',
			'#b69cff',
			'#ff80b5',
			'#6d8dff',
			'#5be3a6',
			'#ff9d52',
			'#e6d7a8',
			'#9fd0ff',
			'#e66b8f',
			'#a8e0c6'
		],
		other: '#7f8f97'
	},
	minimalist: { colors: ['#c4281c', '#0f1417', '#525c61', '#8b9499'], other: '#c3c9cc' },
	retro: {
		colors: ['#ffd23a', ...RETRO_SECONDARY_COLORS],
		other: '#a9a1dc'
	},
	classic: {
		colors: ['#22d3ee', '#ff7d66', '#d3e85e', '#ffbf47', '#b69cff', '#ff80b5'],
		other: '#a1a1aa'
	},
	synthwave: {
		colors: ['#facc15', ...RETRO_SECONDARY_COLORS],
		other: '#a5a0d8'
	}
};
