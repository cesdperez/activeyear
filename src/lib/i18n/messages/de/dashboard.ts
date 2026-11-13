import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	supportExport:
		'Hat dir dein Rückblick gefallen? ActiveYear ist kostenlos und von einer Person gemacht.',
	cutShort: (date: string) =>
		`Dein Export beginnt am ${date}. Wenn dein Jahr früher begann, scrolle in Garmin Connect bis zum Ende von Alle Aktivitäten und exportiere erneut.`,
	supportFooter: 'Gefällt dir ActiveYear?',
	buyMeAGel: 'Spendier mir ein Gel',
	opensKofi: '(öffnet Ko-fi in einem neuen Tab)',
	customPicks: 'Deine eigene Auswahl.',
	highlightPresets: 'Highlight-Auswahl',
	searchActivities: 'Aktivitäten suchen',
	searchPlaceholder: 'Aktivität hinzufügen',
	searchHint: 'Suche nach Titel, Sportart, Monat oder Distanz',
	noSearchMatches: 'Keine passenden Aktivitäten',
	noPicks: 'Keine Highlights ausgewählt. Wähle eine Auswahl oder suche deine Aktivitäten.',
	removeHighlight: (x: string) => `${x} aus Highlights entfernen`,
	removedHighlight: (x: string) => `${x} entfernt`,
	addedHighlight: (x: string) => `${x} hinzugefügt`,
	highlightLimit: (n: number) =>
		`Maximal ${n} Highlights. Entferne eines, um ein anderes hinzuzufügen.`,
	searchResults: (n: number) => `${n} ${n === 1 ? 'Ergebnis' : 'Ergebnisse'}`,
	presets: {
		longest: { label: 'Längste', description: 'Deine längsten Einheiten des Jahres.' },
		farthest: {
			label: 'Weiteste',
			description: 'Die Tage, an denen du am weitesten gekommen bist.'
		},
		climbs: {
			label: 'Größte Anstiege',
			description: 'Hier hast du die meisten Höhenmeter gesammelt.'
		},
		'per-sport': {
			label: 'Beste je Sportart',
			description: 'Deine längste Einheit in jeder Sportart.'
		},
		'best-month': { label: 'Epischer Monat', description: 'Das Beste aus deinem aktivsten Monat.' },
		favorites: {
			label: 'Garmin-Favoriten',
			description: 'Deine in Garmin Connect favorisierten Aktivitäten.'
		}
	},

	totalDistance: 'Gesamtdistanz',
	elevationGained: 'Höhenmeter',
	timeActive: 'Aktive Zeit',
	caloriesBurned: 'Verbrannte Kalorien',
	personalRecords: 'Bestleistungen',
	bySport: 'Nach Sportart',
	whenYouTrain: 'Wann du trainierst',
	uploadDifferentFile: 'Andere Datei hochladen',
	saveMyYear: 'Mein Jahr speichern',
	reopenRecap: 'Diesen Rückblick später ohne erneuten Export öffnen',
	distanceUnit: 'Distanzeinheit',
	disableCelebration: 'Feiermodus deaktivieren',
	enableCelebration: 'Feiermodus aktivieren',
	celebrationConfetti: 'Konfetti zur Feier',
	yourYear: (year) => `Dein Jahr ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('de', count, { one: 'Aktivität', other: 'Aktivitäten' })}`,
	activitySummaryDays: (n, count) =>
		`an ${n} ${plural('de', count, { one: 'aktivem Tag', other: 'aktiven Tagen' })}`,
	activeDaysLabel: (count) => plural('de', count, { one: 'Aktiver Tag', other: 'Aktive Tage' }),
	dayStreak: 'Tage in Folge',
	percentOfYear: (percent) => `${percent} des Jahres`,
	longestDistance: 'Längste Distanz',
	longestDuration: 'Längste Dauer',
	biggestBurn: 'Meiste Kalorien',
	breakdownMetric: 'Kennzahl der Verteilung',
	activities: 'Aktivitäten',
	time: 'Zeit',
	highlights: 'Höhepunkte',
	stravaHighlights:
		'Deine längsten Einheiten des Jahres. Strava-Exporte enthalten keine Favoriten.',
	noHighlights: 'Noch keine Höhepunkte',
	garminFavoritesHint:
		'Markiere Aktivitäten in Garmin Connect über das Sternsymbol als Favoriten und exportiere deine Daten erneut, um sie hier zu sehen.',
	quarter: (quarter) => `Q${quarter}`,
	jumpExport: 'Zum Export',
	fewerStats: 'Weniger Statistiken',
	moreStats: 'Mehr Statistiken',
	quarters: 'Quartale',
	rest: 'Pause',
	noActivities: 'Keine Aktivitäten',
	longestBreak: 'Längste Pause',
	day: 'Tag',
	days: 'Tage',
	to: 'bis',
	noRestDay: 'Kein Ruhetag zwischen Aktivitäten.',
	byWeekday: 'Nach Wochentag',
	averageActivity: 'Durchschnitt pro Aktivität',
	activeDays: 'Aktive Tage',
	longestStreakDays: 'Längste Serie in Tagen',
	totals: 'Gesamtwerte',
	weekday: 'Tag',
	sport: 'Sportart',
	distance: 'Distanz'
};
