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
import type { ActivityType } from '#lib/types/index.js';

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
	'#2dd4bf',
	'#ef4444',
	'#facc15',
	'#4ade80'
];

export const OTHER_SPORT_COLOR = '#94a3b8';
