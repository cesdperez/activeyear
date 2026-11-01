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
	Anchor
} from 'phosphor-svelte';
import type { ActivityType } from '#lib/types/index.js';

// Sport type display names
export const sportNames: Record<ActivityType, string> = {
	running: 'Running',
	cycling: 'Cycling',
	swimming: 'Swimming',
	walking: 'Walking',
	hiking: 'Hiking',
	strength: 'Strength',
	yoga: 'Yoga',
	paddling: 'Paddling',
	rowing: 'Rowing',
	cardio: 'Cardio',
	other: 'Other'
};

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
	other: Target
};
// One colour per sport type except "other", so no two slices share a colour.
export const sportColors = [
	'#00d4ff',
	'#00ff88',
	'#ff6b6b',
	'#ffd93d',
	'#c084fc',
	'#fb923c',
	'#f472b6',
	'#4d7cff',
	'#a3e635',
	'#2dd4bf'
];

export const OTHER_SPORT_COLOR = '#94a3b8';
