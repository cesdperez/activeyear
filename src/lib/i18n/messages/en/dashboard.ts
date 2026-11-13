import { plural } from '#lib/i18n/plural.js';

export const dashboard = {
	supportExport: 'Enjoyed your recap? ActiveYear is free and made by one person.',
	cutShort: (date: string) =>
		`Your export starts on ${date}. If your year started earlier, scroll to the bottom of All Activities in Garmin Connect and export again.`,
	supportFooter: 'Enjoying ActiveYear?',
	buyMeAGel: 'Buy me a gel',
	opensKofi: '(opens Ko-fi in a new tab)',
	customPicks: 'Your own picks.',
	highlightPresets: 'Highlight presets',
	searchActivities: 'Search your activities',
	searchPlaceholder: 'Add an activity',
	searchHint: 'Search by title, sport, month or distance',
	noSearchMatches: 'No activities match',
	noPicks: 'No highlights picked. Pick a preset or search your activities.',
	removeHighlight: (x: string) => `Remove ${x} from highlights`,
	removedHighlight: (x: string) => `Removed ${x}`,
	addedHighlight: (x: string) => `Added ${x}`,
	highlightLimit: (n: number) => `${n} highlights max. Remove one to add another.`,
	searchResults: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
	presets: {
		longest: { label: 'Longest', description: 'Your longest sessions of the year.' },
		farthest: { label: 'Farthest', description: 'The days you went the distance.' },
		climbs: { label: 'Biggest climbs', description: 'Where you gained the most elevation.' },
		'per-sport': {
			label: 'Best of each sport',
			description: 'Your longest session in every sport.'
		},
		'best-month': {
			label: 'Epic month',
			description: 'The month you moved the most, at its best.'
		},
		favorites: {
			label: 'Garmin favorites',
			description: 'The activities you starred in Garmin Connect.'
		}
	},

	totalDistance: 'Total distance',
	elevationGained: 'Elevation gained',
	timeActive: 'Time active',
	caloriesBurned: 'Calories burned',
	personalRecords: 'Personal records',
	bySport: 'By sport',
	whenYouTrain: 'When you train',
	uploadDifferentFile: 'Upload different file',
	saveMyYear: 'Save my year',
	reopenRecap: 'Reopen this recap later without exporting again',
	distanceUnit: 'Distance unit',
	disableCelebration: 'Disable celebration mode',
	enableCelebration: 'Enable celebration mode',
	celebrationConfetti: 'Celebration confetti',
	yourYear: (year: number) => `Your ${year}`,
	activitySummaryActivities: (n: string, count: number) =>
		`${n} ${plural('en', count, { one: 'activity', other: 'activities' })} across`,
	activitySummaryDays: (n: string, count: number) =>
		`${n} ${plural('en', count, { one: 'active day', other: 'active days' })}`,
	activeDaysLabel: (count: number) =>
		plural('en', count, { one: 'Active day', other: 'Active days' }),
	dayStreak: 'Day streak',
	percentOfYear: (percent: string) => `${percent} of the year`,
	longestDistance: 'Longest distance',
	longestDuration: 'Longest duration',
	biggestBurn: 'Biggest burn',
	breakdownMetric: 'Breakdown metric',
	activities: 'Activities',
	time: 'Time',
	highlights: 'Highlights',
	stravaHighlights: "Your longest sessions of the year. Strava exports don't include favorites.",
	noHighlights: 'No highlights yet',
	garminFavoritesHint:
		'Mark activities as favorites in Garmin Connect by tapping the star icon on any activity, then re-export your data to see them here.',
	quarter: (quarter: number) => `Q${quarter}`,
	jumpExport: 'Jump to Export',
	fewerStats: 'Fewer stats',
	moreStats: 'More stats',
	quarters: 'Quarters',
	rest: 'Rest',
	noActivities: 'No activities',
	longestBreak: 'Longest break',
	day: 'day',
	days: 'days',
	to: 'to',
	noRestDay: 'No rest day between activities.',
	byWeekday: 'By weekday',
	averageActivity: 'Average per activity',
	activeDays: 'Active days',
	longestStreakDays: 'Longest streak in days',
	totals: 'Totals',
	weekday: 'Day',
	sport: 'Sport',
	distance: 'Distance'
};
