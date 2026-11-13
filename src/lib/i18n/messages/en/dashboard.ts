import { plural } from '#lib/i18n/plural.js';

export const dashboard = {
	totalDistance: 'Total Distance',
	elevationGained: 'Elevation Gained',
	timeActive: 'Time Active',
	caloriesBurned: 'Calories Burned',
	personalRecords: 'Personal Records',
	bySport: 'By Sport',
	whenYouTrain: 'When You Train',
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
		plural('en', count, { one: 'Active Day', other: 'Active Days' }),
	streakCaption: (count: number) =>
		plural('en', count, {
			one: 'most consecutive active day',
			other: 'most consecutive active days'
		}),
	dayStreak: 'Day Streak',
	percentOfYear: (percent: string) => `${percent} of the year`,
	longestDistance: 'Longest Distance',
	longestDuration: 'Longest Duration',
	biggestBurn: 'Biggest Burn',
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
	moreStatsTitle: 'More Stats',
	quarters: 'Quarters',
	rest: 'Rest',
	noActivities: 'No activities',
	longestBreak: 'Longest break',
	day: 'day',
	days: 'days',
	to: 'to',
	noRestDay: 'No rest day between activities.',
	byWeekday: 'By weekday',
	averageActivity: 'Average per activity'
};
