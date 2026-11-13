import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
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
	streakCaption: (count) =>
		plural('de', count, { one: 'aktiver Tag in Folge', other: 'meiste aktive Tage in Folge' }),
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
	moreStatsTitle: 'Mehr Statistiken',
	quarters: 'Quartale',
	rest: 'Pause',
	noActivities: 'Keine Aktivitäten',
	longestBreak: 'Längste Pause',
	day: 'Tag',
	days: 'Tage',
	to: 'bis',
	noRestDay: 'Kein Ruhetag zwischen Aktivitäten.',
	byWeekday: 'Nach Wochentag',
	averageActivity: 'Durchschnitt pro Aktivität'
};
