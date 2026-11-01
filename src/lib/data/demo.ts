import { TARGET_YEAR } from '../constants/time.js';
import type { Activity, ActivityType } from '../types/index.js';

interface SessionPlan {
	type: ActivityType;
	count: number;
	titles: string[];
	/** Averages per session; each session scales them by the same random factor. */
	distance: number;
	duration: number;
	calories: number;
	elevation: number;
}

// Chosen so the totals and weekday shape stay near the earlier hand-written demo.
const DEMO_SEED = 2292;
const ACTIVE_DAYS = 180;
const DOUBLE_SESSION_DAYS = 65;
const LONGEST_STREAK = 12;
// A round total keeps the Time Active card on one line.
const TOTAL_DURATION = 150 * 60 * 60;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday first, like `WeeklyPattern`: busy weekends, quiet Fridays. */
const ACTIVE_DAY_WEIGHTS = [27, 24, 26, 22, 18, 33, 30];
const DOUBLE_SESSION_WEIGHTS = [11, 8, 10, 8, 6, 11, 11];

const REGULAR_SESSIONS: SessionPlan[] = [
	{
		type: 'running',
		count: 117,
		titles: ['Morning Run', 'Easy Run', 'Tempo Run', 'Evening Run'],
		distance: 5.9,
		duration: 1760,
		calories: 480,
		elevation: 37
	},
	{
		type: 'strength',
		count: 58,
		titles: ['Gym Session', 'Core Workout'],
		distance: 0,
		duration: 1200,
		calories: 280,
		elevation: 0
	},
	{
		type: 'cycling',
		count: 43,
		titles: ['Commute Ride', 'Evening Ride', 'Hill Repeats'],
		distance: 22.4,
		duration: 2760,
		calories: 700,
		elevation: 145
	},
	{
		type: 'swimming',
		count: 14,
		titles: ['Pool Swim'],
		distance: 1.46,
		duration: 1680,
		calories: 330,
		elevation: 0
	},
	{
		type: 'yoga',
		count: 5,
		titles: ['Yoga Flow'],
		distance: 0,
		duration: 2880,
		calories: 250,
		elevation: 0
	}
];

// Noon UTC keeps the same calendar day in local time, which the weekly pattern reads.
function dayOfYear(index: number): Date {
	return new Date(Date.UTC(TARGET_YEAR, 0, 1 + index, 12));
}

function onDate(month: number, day: number): Date {
	return new Date(Date.UTC(TARGET_YEAR, month - 1, day, 12));
}

function indexOfDate(date: Date): number {
	return Math.round((date.getTime() - dayOfYear(0).getTime()) / DAY_MS);
}

function mondayFirstWeekday(index: number): number {
	return (dayOfYear(index).getUTCDay() + 6) % 7;
}

function daysInTargetYear(): number {
	return indexOfDate(new Date(Date.UTC(TARGET_YEAR + 1, 0, 1, 12)));
}

function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Weighted sampling without replacement: a higher weight tends to sort earlier. */
function weightedOrder(
	indices: number[],
	weightOf: (index: number) => number,
	random: () => number
): number[] {
	return indices
		.map((index) => ({ index, key: random() ** (1 / weightOf(index)) }))
		.sort((a, b) => b.key - a.key)
		.map(({ index }) => index);
}

function shuffled<T>(items: T[], random: () => number): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

const highlights: Activity[] = [
	{
		type: 'running',
		title: "New Year's Resolution Run",
		date: onDate(1, 1),
		distance: 5.0,
		duration: 1800,
		calories: 350,
		elevation: 25,
		favorite: true
	},
	{
		type: 'cycling',
		title: 'Century Ride Achievement',
		date: onDate(3, 15),
		distance: 160.0,
		duration: 21600,
		calories: 4200,
		elevation: 1100,
		favorite: true
	},
	{
		type: 'running',
		title: 'First Half Marathon',
		date: onDate(4, 20),
		distance: 21.1,
		duration: 6300,
		calories: 1450,
		elevation: 85,
		favorite: true
	},
	{
		type: 'hiking',
		title: 'Summit Sunrise Hike',
		date: onDate(6, 21),
		distance: 18.5,
		duration: 25200,
		calories: 2100,
		elevation: 1450,
		favorite: true
	},
	{
		type: 'swimming',
		title: 'Open Water 5K',
		date: onDate(7, 14),
		distance: 5.0,
		duration: 5400,
		calories: 650,
		elevation: 0,
		favorite: true
	},
	{
		type: 'running',
		title: 'Marathon Finisher',
		date: onDate(10, 12),
		distance: 42.2,
		duration: 12600,
		calories: 2800,
		elevation: 150,
		favorite: true
	}
];

const keySessions: Activity[] = [
	{
		type: 'cycling',
		title: 'Sunday Long Ride',
		date: onDate(6, 15),
		distance: 85.0,
		duration: 14400,
		calories: 1500,
		elevation: 800,
		favorite: false
	},
	{
		type: 'hiking',
		title: 'Mountain Summit',
		date: onDate(8, 1),
		distance: 15.0,
		duration: 21600,
		calories: 3200,
		elevation: 1200,
		favorite: false
	}
];

function streakBlock(): number[] {
	const start = indexOfDate(onDate(9, 1));
	return Array.from({ length: LONGEST_STREAK }, (_, i) => start + i);
}

function runLength(active: Set<number>, index: number): number {
	let length = 1;
	for (let i = index - 1; active.has(i); i--) length++;
	for (let i = index + 1; active.has(i); i++) length++;
	return length;
}

/** Active day indices: the fixed dates, a streak block, then weighted picks kept shorter than the block. */
function pickActiveDays(fixedDays: number[], random: () => number): Set<number> {
	const block = streakBlock();
	const active = new Set([...fixedDays, ...block]);
	const blockEdges = new Set([block[0] - 1, block[block.length - 1] + 1]);
	const candidates = Array.from({ length: daysInTargetYear() }, (_, i) => i).filter(
		(i) => !active.has(i) && !blockEdges.has(i)
	);

	for (const day of weightedOrder(
		candidates,
		(i) => ACTIVE_DAY_WEIGHTS[mondayFirstWeekday(i)],
		random
	)) {
		if (active.size === ACTIVE_DAYS) break;
		if (runLength(active, day) < LONGEST_STREAK) active.add(day);
	}

	return active;
}

function regularSessionDays(fixedDays: number[], random: () => number): number[] {
	const active = pickActiveDays(fixedDays, random);
	const openDays = [...active].filter((day) => !fixedDays.includes(day));
	const doubleDays = weightedOrder(
		[...active],
		(i) => DOUBLE_SESSION_WEIGHTS[mondayFirstWeekday(i)],
		random
	).slice(0, DOUBLE_SESSION_DAYS);

	return [...openDays, ...doubleDays].sort((a, b) => a - b);
}

function regularSessions(fixedDays: number[], random: () => number): Activity[] {
	const days = regularSessionDays(fixedDays, random);
	const plans = shuffled(
		REGULAR_SESSIONS.flatMap((plan) => Array.from({ length: plan.count }, () => plan)),
		random
	);
	const seenPerSport = new Map<ActivityType, number>();

	return plans.map((plan, i) => {
		const seen = seenPerSport.get(plan.type) ?? 0;
		seenPerSport.set(plan.type, seen + 1);
		const scale = 0.75 + random() * 0.5;

		return {
			type: plan.type,
			title: plan.titles[seen % plan.titles.length],
			date: dayOfYear(days[i]),
			distance: Math.round(plan.distance * scale * 10) / 10,
			duration: Math.round(plan.duration * scale),
			calories: Math.round(plan.calories * scale),
			elevation: Math.round(plan.elevation * scale),
			favorite: false
		};
	});
}

function sumDurations(activities: Activity[]): number {
	return activities.reduce((sum, a) => sum + a.duration, 0);
}

/** Scales the durations to add up to `total`, giving the rounding remainder to the last one. */
function withTotalDuration(activities: Activity[], total: number): Activity[] {
	const ratio = total / sumDurations(activities);
	const scaled = activities.map((a) => ({ ...a, duration: Math.round(a.duration * ratio) }));
	scaled[scaled.length - 1].duration += total - sumDurations(scaled);
	return scaled;
}

function buildDemoActivities(): Activity[] {
	const fixed = [...highlights, ...keySessions];
	const fixedDays = fixed.map((a) => indexOfDate(a.date));
	const regular = withTotalDuration(
		regularSessions(fixedDays, seededRandom(DEMO_SEED)),
		TOTAL_DURATION - sumDurations(fixed)
	);

	return [...fixed, ...regular].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** A deterministic sample year: 245 activities over 180 active days of `TARGET_YEAR`. */
export const demoActivities: Activity[] = buildDemoActivities();
