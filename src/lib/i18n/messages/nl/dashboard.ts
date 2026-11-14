import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	backToStart: 'Terug naar het begin',
	supportExport: 'Genoten van je overzicht? ActiveYear is gratis en gemaakt door één persoon.',
	cutShort: (date: string) =>
		`Je export begint op ${date}. Als je jaar eerder begon, scrol dan in Garmin Connect naar het einde van Alle activiteiten en exporteer opnieuw.`,
	supportFooter: 'Bevalt ActiveYear je?',
	buyMeAGel: 'Trakteer me op een gel',
	opensKofi: '(opent ko-fi in een nieuw tabblad)',
	customPicks: 'Je eigen selectie.',
	highlightPresets: 'Hoogtepuntselecties',
	addActivity: 'Voeg een activiteit toe',
	searchHint: 'Zoek op titel, sport, maand of afstand',
	searchResultsCapped: (shown: string, total: string) =>
		`${shown} van ${total} getoond. Voeg woorden toe om je zoekopdracht te verfijnen.`,
	noSearchMatches: 'Geen activiteiten gevonden',
	noPicks: 'Geen hoogtepunten gekozen. Kies een selectie of zoek je activiteiten.',
	removeHighlight: (title: string, date: string) =>
		`${title}, ${date}, uit hoogtepunten verwijderen`,
	removedHighlight: (x: string) => `${x} verwijderd`,
	addedHighlight: (x: string) => `${x} toegevoegd`,
	highlightLimit: (n: number) =>
		`Maximaal ${n} hoogtepunten. Verwijder er één om een ander toe te voegen.`,
	searchResults: (n: number) =>
		`${n} ${plural('nl', n, { one: 'resultaat', other: 'resultaten' })}`,
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
	saveMyYear: 'Mijn jaar opslaan',
	reopenRecap: 'Open dit overzicht later zonder opnieuw te exporteren',
	distanceUnit: 'Afstandseenheid',
	celebrationConfetti: 'Feestelijke confetti',
	yourYearSoFar: (year) => `Jouw jaar ${year} tot nu toe`,
	yourYear: (year) => `Jouw jaar ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('nl', count, { one: 'activiteit', other: 'activiteiten' })}`,
	activitySummaryDays: (n, count) =>
		`op ${n} ${plural('nl', count, { one: 'actieve dag', other: 'actieve dagen' })}`,
	activeDaysLabel: (count) => plural('nl', count, { one: 'Actieve dag', other: 'Actieve dagen' }),
	dayStreak: 'Dagen op rij',
	percentOfYearSoFar: (percent) => `${percent} van het jaar tot nu toe`,
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
	demoData: 'Voorbeeldgegevens',
	noData: 'Geen gegevens',
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
