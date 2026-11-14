import { sports } from './sports.js';
import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	otherSports: 'Autres sports',
	sports,
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
		plural('fr', count, { one: 'part de pizza éliminée', other: 'parts de pizza éliminées' }),
	lessPizza: 'Moins d’une part de pizza éliminée',
	earthPartial: (share) => `${share} d’un tour du monde`,
	earthLaps: (laps) => `${laps} tours du monde`,
	everestPartial: (share) => `${share} de l’Everest`,
	everestMultiple: (times) => `${times} fois l’Everest`,
	lotr: 'marathons du SdA',
	dayByDay: 'Jour après jour',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('fr', count, { one: 'jour actif', other: 'jours actifs' })} sur ${days} en ${year}`,
		summarySoFar: (n, count, days, year) =>
			`${n} ${plural('fr', count, { one: 'jour actif', other: 'jours actifs' })} sur ${days} en ${year} jusqu’ici`,
		highlightsMarked: 'temps forts signalés',
		recordsMarked: 'records personnels signalés',
		highlight: 'Temps fort',
		record: 'Record personnel'
	},
	footer: {
		reportIssue: 'Signaler un problème',
		otherProjects: 'Voir mes autres projets'
	},
	opensInNewTab: '(s’ouvre dans un nouvel onglet)'
};
