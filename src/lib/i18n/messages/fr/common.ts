import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	sports: {
		running: 'Course à pied',
		cycling: 'Cyclisme',
		swimming: 'Natation',
		walking: 'Marche',
		hiking: 'Randonnée',
		strength: 'Musculation',
		yoga: 'Yoga',
		paddling: 'Sports de pagaie',
		rowing: 'Aviron',
		cardio: 'Cardio',
		winter: 'Sports d’hiver',
		racket: 'Sports de raquette',
		climbing: 'Escalade',
		other: 'Autres'
	},
	nouns: {
		activity: (count: number) => plural('fr', count, { one: 'activité', other: 'activités' }),
		swim: (count: number) =>
			plural('fr', count, { one: 'séance de natation', other: 'séances de natation' }),
		run: (count: number) => plural('fr', count, { one: 'course', other: 'courses' }),
		ride: (count: number) => plural('fr', count, { one: 'sortie à vélo', other: 'sorties à vélo' }),
		walk: (count: number) => plural('fr', count, { one: 'marche', other: 'marches' }),
		workout: (count: number) =>
			plural('fr', count, { one: 'entraînement', other: 'entraînements' }),
		second: (count: number) => plural('fr', count, { one: 'Seconde', other: 'Secondes' }),
		minute: (count: number) => plural('fr', count, { one: 'Minute', other: 'Minutes' }),
		hour: (count: number) => plural('fr', count, { one: 'Heure', other: 'Heures' }),
		activityLabel: (count: number) => plural('fr', count, { one: 'Activité', other: 'Activités' })
	},
	pizza: (count: number) =>
		plural('fr', count, { one: 'part de pizza brûlée', other: 'parts de pizza brûlées' }),
	lessPizza: 'Moins d’une part de pizza brûlée',
	earthLaps: 'tours du monde',
	earthPartial: 'd’un tour du monde',
	everest: 'de la hauteur de l’Everest',
	lotr: 'marathons du Seigneur des Anneaux',
	dayByDay: 'Jour après jour',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('fr', count, { one: 'jour actif', other: 'jours actifs' })} sur ${days} en ${year}`,
		highlightsMarked: 'temps forts signalés',
		recordsMarked: 'records personnels signalés',
		highlight: 'Temps fort',
		record: 'Record personnel'
	}
};
