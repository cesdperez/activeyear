import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	totalDistance: 'Distance totale',
	elevationGained: 'Dénivelé positif',
	timeActive: 'Temps actif',
	caloriesBurned: 'Calories brûlées',
	personalRecords: 'Records personnels',
	bySport: 'Par sport',
	whenYouTrain: 'Quand vous vous entraînez',
	uploadDifferentFile: 'Importer un autre fichier',
	saveMyYear: 'Enregistrer mon année',
	reopenRecap: 'Retrouvez ce bilan plus tard sans exporter à nouveau',
	distanceUnit: 'Unité de distance',
	disableCelebration: 'Désactiver le mode célébration',
	enableCelebration: 'Activer le mode célébration',
	celebrationConfetti: 'Confettis de célébration',
	yourYear: (year) => `Votre année ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('fr', count, { one: 'activité', other: 'activités' })}`,
	activitySummaryDays: (n, count) =>
		`sur ${n} ${plural('fr', count, { one: 'jour actif', other: 'jours actifs' })}`,
	activeDaysLabel: (count) => plural('fr', count, { one: 'Jour actif', other: 'Jours actifs' }),
	streakCaption: (count) =>
		plural('fr', count, {
			one: 'jour actif consécutif',
			other: 'plus longue série de jours actifs'
		}),
	dayStreak: 'Jours de suite',
	percentOfYear: (percent) => `${percent} de l’année`,
	longestDistance: 'Plus longue distance',
	longestDuration: 'Plus longue durée',
	biggestBurn: 'Plus de calories brûlées',
	breakdownMetric: 'Mesure de répartition',
	activities: 'Activités',
	time: 'Temps',
	highlights: 'Temps forts',
	stravaHighlights:
		'Vos séances les plus longues de l’année. Les exports Strava n’incluent pas les favoris.',
	noHighlights: 'Pas encore de temps forts',
	garminFavoritesHint:
		'Ajoutez des activités à vos favoris dans Garmin Connect en touchant l’étoile d’une activité, puis exportez à nouveau vos données pour les voir ici.',
	quarter: (quarter) => `T${quarter}`,
	jumpExport: 'Aller à l’export',
	fewerStats: 'Moins de statistiques',
	moreStats: 'Plus de statistiques',
	moreStatsTitle: 'Plus de statistiques',
	quarters: 'Trimestres',
	rest: 'Repos',
	noActivities: 'Aucune activité',
	longestBreak: 'Plus longue pause',
	day: 'jour',
	days: 'jours',
	to: 'au',
	noRestDay: 'Aucun jour de repos entre les activités.',
	byWeekday: 'Par jour de la semaine',
	averageActivity: 'Moyenne par activité'
};
