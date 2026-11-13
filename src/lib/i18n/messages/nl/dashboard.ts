import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	customPicks: 'Je eigen selectie.',
	highlightPresets: 'Hoogtepuntselecties',
	searchActivities: 'Zoek je activiteiten',
	searchPlaceholder: 'Voeg een activiteit toe',
	searchHint: 'Zoek op titel, sport, maand of afstand',
	noSearchMatches: 'Geen activiteiten gevonden',
	noPicks: 'Geen hoogtepunten gekozen. Kies een selectie of zoek je activiteiten.',
	removeHighlight: (x: string) => `${x} uit hoogtepunten verwijderen`,
	removedHighlight: (x: string) => `${x} verwijderd`,
	addedHighlight: (x: string) => `${x} toegevoegd`,
	highlightLimit: (n: number) =>
		`Maximaal ${n} hoogtepunten. Verwijder er één om een andere toe te voegen.`,
	searchResults: (n: number) => `${n} ${n === 1 ? 'resultaat' : 'resultaten'}`,
	presets: {
		longest: { label: 'Langste', description: 'Je langste sessies van het jaar.' },
		farthest: { label: 'Verste', description: 'De dagen waarop je het verst ging.' },
		climbs: {
			label: 'Grootste beklimmingen',
			description: 'Waar je de meeste hoogtemeters maakte.'
		},
		'per-sport': { label: 'Beste per sport', description: 'Je langste sessie in elke sport.' },
		'best-month': { label: 'Epische maand', description: 'Het beste van je actiefste maand.' },
		favorites: {
			label: 'Garmin-favorieten',
			description: 'De activiteiten die je in Garmin Connect als favoriet markeerde.'
		}
	},

	totalDistance: 'Totale afstand',
	elevationGained: 'Hoogtemeters',
	timeActive: 'Actieve tijd',
	caloriesBurned: 'Verbrande calorieën',
	personalRecords: 'Persoonlijke records',
	bySport: 'Per sport',
	whenYouTrain: 'Wanneer je traint',
	uploadDifferentFile: 'Ander bestand uploaden',
	saveMyYear: 'Mijn jaar opslaan',
	reopenRecap: 'Open dit overzicht later zonder opnieuw te exporteren',
	distanceUnit: 'Afstandseenheid',
	disableCelebration: 'Feestmodus uitschakelen',
	enableCelebration: 'Feestmodus inschakelen',
	celebrationConfetti: 'Feestelijke confetti',
	yourYear: (year) => `Jouw jaar ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('nl', count, { one: 'activiteit', other: 'activiteiten' })}`,
	activitySummaryDays: (n, count) =>
		`op ${n} ${plural('nl', count, { one: 'actieve dag', other: 'actieve dagen' })}`,
	activeDaysLabel: (count) => plural('nl', count, { one: 'Actieve dag', other: 'Actieve dagen' }),
	dayStreak: 'Dagen op rij',
	percentOfYear: (percent) => `${percent} van het jaar`,
	longestDistance: 'Langste afstand',
	longestDuration: 'Langste duur',
	biggestBurn: 'Meeste calorieën',
	breakdownMetric: 'Maatstaf voor verdeling',
	activities: 'Activiteiten',
	time: 'Tijd',
	highlights: 'Hoogtepunten',
	stravaHighlights: 'Je langste trainingen van het jaar. Strava-exports bevatten geen favorieten.',
	noHighlights: 'Nog geen hoogtepunten',
	garminFavoritesHint:
		'Markeer activiteiten als favoriet in Garmin Connect door op het sterretje bij een activiteit te tikken en exporteer je gegevens opnieuw om ze hier te zien.',
	quarter: (quarter) => `K${quarter}`,
	jumpExport: 'Naar exporteren',
	fewerStats: 'Minder statistieken',
	moreStats: 'Meer statistieken',
	quarters: 'Kwartalen',
	rest: 'Rust',
	noActivities: 'Geen activiteiten',
	longestBreak: 'Langste pauze',
	day: 'dag',
	days: 'dagen',
	to: 'tot',
	noRestDay: 'Geen rustdag tussen activiteiten.',
	byWeekday: 'Per weekdag',
	averageActivity: 'Gemiddelde per activiteit',
	activeDays: 'Actieve dagen',
	longestStreakDays: 'Langste reeks in dagen',
	totals: 'Totalen',
	weekday: 'Dag',
	sport: 'Sport',
	distance: 'Afstand'
};
