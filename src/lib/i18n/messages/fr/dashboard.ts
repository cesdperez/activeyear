import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	backToStart: 'Retour à l’accueil',
	supportExport:
		'Vous avez aimé votre bilan ? ActiveYear est gratuit et fait par une seule personne.',
	cutShort: (date: string) =>
		`Votre export commence le ${date}. Si votre année a commencé plus tôt, faites défiler Toutes les activités jusqu’en bas dans Garmin Connect, puis exportez à nouveau.`,
	supportFooter: 'Vous aimez ActiveYear ?',
	buyMeAGel: 'Offrez-moi un gel',
	opensKofi: '(ouvre ko-fi dans un nouvel onglet)',
	customPicks: 'Votre sélection personnelle.',
	highlightPresets: 'Sélections de temps forts',
	addActivity: 'Ajoutez une activité',
	searchHint: 'Recherchez par titre, sport, mois ou distance',
	searchResultsCapped: (shown: string, total: string) =>
		`${shown} sur ${total} affichés. Ajoutez des mots pour affiner la recherche.`,
	noSearchMatches: 'Aucune activité correspondante',
	noPicks: 'Aucun temps fort sélectionné. Choisissez une sélection ou recherchez vos activités.',
	removeHighlight: (title: string, date: string) => `Retirer ${title}, ${date}, des temps forts`,
	removedHighlight: (x: string) => `${x} retiré`,
	addedHighlight: (x: string) => `${x} ajouté`,
	highlightLimit: (n: number) =>
		`${n} temps forts maximum. Retirez-en un pour en ajouter un autre.`,
	searchResults: (n: number) => `${n} ${plural('fr', n, { one: 'résultat', other: 'résultats' })}`,
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
	demoData: 'Données d’exemple',
	noData: 'Aucune donnée',
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
