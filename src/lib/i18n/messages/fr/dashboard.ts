import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	supportExport:
		'Vous avez aimé votre bilan ? ActiveYear est gratuit et fait par une seule personne.',
	supportFooter: 'Vous aimez ActiveYear ?',
	buyMeAGel: 'Offrez-moi un gel',
	opensKofi: '(ouvre Ko-fi dans un nouvel onglet)',
	customPicks: 'Votre sélection personnelle.',
	highlightPresets: 'Sélections de moments forts',
	searchActivities: 'Rechercher vos activités',
	searchPlaceholder: 'Ajoutez une activité',
	searchHint: 'Recherchez par titre, sport, mois ou distance',
	noSearchMatches: 'Aucune activité correspondante',
	noPicks: 'Aucun moment fort sélectionné. Choisissez une sélection ou recherchez vos activités.',
	removeHighlight: (x: string) => `Retirer ${x} des moments forts`,
	removedHighlight: (x: string) => `${x} retiré`,
	addedHighlight: (x: string) => `${x} ajouté`,
	highlightLimit: (n: number) =>
		`${n} moments forts maximum. Retirez-en un pour en ajouter un autre.`,
	searchResults: (n: number) => `${n} ${n === 1 ? 'résultat' : 'résultats'}`,
	presets: {
		longest: { label: 'Plus longues', description: 'Vos séances les plus longues de l’année.' },
		farthest: { label: 'Plus loin', description: 'Les jours où vous êtes allé le plus loin.' },
		climbs: { label: 'Plus de dénivelé', description: 'Vos plus grands dénivelés positifs.' },
		'per-sport': {
			label: 'Le meilleur par sport',
			description: 'Votre séance la plus longue dans chaque sport.'
		},
		'best-month': { label: 'Mois épique', description: 'Le meilleur de votre mois le plus actif.' },
		favorites: {
			label: 'Favoris Garmin',
			description: 'Les activités marquées comme favorites dans Garmin Connect.'
		}
	},

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
	yourYearSoFar: (year) => `Votre année ${year} jusqu’ici`,
	yourYear: (year) => `Votre année ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('fr', count, { one: 'activité', other: 'activités' })}`,
	activitySummaryDays: (n, count) =>
		`sur ${n} ${plural('fr', count, { one: 'jour actif', other: 'jours actifs' })}`,
	activeDaysLabel: (count) => plural('fr', count, { one: 'Jour actif', other: 'Jours actifs' }),
	dayStreak: 'Jours de suite',
	percentOfYearSoFar: (percent) => `${percent} de l’année jusqu’ici`,
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
	quarters: 'Trimestres',
	rest: 'Repos',
	noActivities: 'Aucune activité',
	longestBreak: 'Plus longue pause',
	day: 'jour',
	days: 'jours',
	to: 'au',
	noRestDay: 'Aucun jour de repos entre les activités.',
	byWeekday: 'Par jour de la semaine',
	averageActivity: 'Moyenne par activité',
	activeDays: 'Jours actifs',
	longestStreakDays: 'Plus longue série en jours',
	totals: 'Totaux',
	weekday: 'Jour',
	sport: 'Sport',
	distance: 'Distance'
};
