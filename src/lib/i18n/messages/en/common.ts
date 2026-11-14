import { sports } from './sports.js';
import { plural } from '#lib/i18n/plural.js';
export const common = {
	otherSports: 'Other sports',
	sports,
	nouns: {
		activity: (count: number) => plural('en', count, { one: 'activity', other: 'activities' }),
		swim: (count: number) => plural('en', count, { one: 'swim', other: 'swims' }),
		run: (count: number) => plural('en', count, { one: 'run', other: 'runs' }),
		ride: (count: number) => plural('en', count, { one: 'ride', other: 'rides' }),
		walk: (count: number) => plural('en', count, { one: 'walk', other: 'walks' }),
		workout: (count: number) => plural('en', count, { one: 'workout', other: 'workouts' }),
		second: (count: number) => plural('en', count, { one: 'Second', other: 'Seconds' }),
		minute: (count: number) => plural('en', count, { one: 'Minute', other: 'Minutes' }),
		hour: (count: number) => plural('en', count, { one: 'Hour', other: 'Hours' }),
		activityLabel: (count: number) => plural('en', count, { one: 'Activity', other: 'Activities' })
	},
	pizza: (count: number) =>
		plural('en', count, { one: 'pizza slice burnt', other: 'pizza slices burnt' }),
	lessPizza: 'Less than a pizza slice burnt',
	earthPartial: (share: string) => `${share} of a lap around the globe`,
	earthLaps: (laps: string) => `${laps} laps around the globe`,
	everestPartial: (share: string) => `${share} of Mt.\u00a0Everest`,
	everestMultiple: (times: string) => `${times}x Mt.\u00a0Everest`,
	lotr: 'LotR marathons',
	dayByDay: 'Day by day',
	yearLane: {
		summary: (n: string, count: number, days: string, year: number) =>
			`${n} active ${plural('en', count, { one: 'day', other: 'days' })} out of ${days} in ${year}`,
		summarySoFar: (n: string, count: number, days: string, year: number) =>
			`${n} active ${plural('en', count, { one: 'day', other: 'days' })} out of ${days} in ${year} so far`,
		highlightsMarked: 'highlights marked',
		recordsMarked: 'personal records marked',
		highlight: 'Highlight',
		record: 'Personal record'
	},
	footer: {
		reportIssue: 'Report an issue',
		otherProjects: 'See my other projects',
		opensInNewTab: '(opens in a new tab)'
	}
};
