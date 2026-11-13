import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	sports: {
		running: 'Laufen',
		cycling: 'Radfahren',
		swimming: 'Schwimmen',
		walking: 'Gehen',
		hiking: 'Wandern',
		strength: 'Krafttraining',
		yoga: 'Yoga',
		paddling: 'Paddeln',
		rowing: 'Rudern',
		cardio: 'Cardio',
		winter: 'Wintersport',
		racket: 'Schlägersport',
		climbing: 'Klettern',
		other: 'Sonstiges'
	},
	nouns: {
		activity: (count: number) => plural('de', count, { one: 'Aktivität', other: 'Aktivitäten' }),
		swim: (count: number) =>
			plural('de', count, { one: 'Schwimmeinheit', other: 'Schwimmeinheiten' }),
		run: (count: number) => plural('de', count, { one: 'Lauf', other: 'Läufe' }),
		ride: (count: number) => plural('de', count, { one: 'Radtour', other: 'Radtouren' }),
		walk: (count: number) => plural('de', count, { one: 'Spaziergang', other: 'Spaziergänge' }),
		workout: (count: number) => plural('de', count, { one: 'Training', other: 'Trainings' }),
		second: (count: number) => plural('de', count, { one: 'Sekunde', other: 'Sekunden' }),
		minute: (count: number) => plural('de', count, { one: 'Minute', other: 'Minuten' }),
		hour: (count: number) => plural('de', count, { one: 'Stunde', other: 'Stunden' }),
		activityLabel: (count: number) =>
			plural('de', count, { one: 'Aktivität', other: 'Aktivitäten' })
	},
	// "Stück" stays singular after a number, as in "3 Stück Pizza".
	pizza: () => 'Stück Pizza abtrainiert',
	lessPizza: 'Weniger als ein Stück Pizza abtrainiert',
	earthPartial: (share) => `${share} einer Erdumrundung`,
	earthLaps: (laps) => `${laps} Erdumrundungen`,
	everestPartial: (share) => `${share} der Höhe des Mount Everest`,
	everestMultiple: (times) => `${times}-mal so hoch wie der Mount Everest`,
	lotr: 'Herr-der-Ringe-Marathons',
	dayByDay: 'Tag für Tag',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('de', count, { one: 'aktiver Tag', other: 'aktive Tage' })} von ${days} im Jahr ${year}`,
		summarySoFar: (n, count, days, year) =>
			`${n} ${plural('de', count, { one: 'aktiver Tag', other: 'aktive Tage' })} von ${days} im Jahr ${year} bisher`,
		highlightsMarked: 'Highlights markiert',
		recordsMarked: 'Bestleistungen markiert',
		highlight: 'Highlight',
		record: 'Bestleistung'
	}
};
