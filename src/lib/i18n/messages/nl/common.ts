import { sports } from './sports.js';
import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	otherSports: 'Overige sporten',
	sports,
	nouns: {
		activity: (count: number) => plural('nl', count, { one: 'activiteit', other: 'activiteiten' }),
		swim: (count: number) => plural('nl', count, { one: 'zwemsessie', other: 'zwemsessies' }),
		run: (count: number) =>
			plural('nl', count, { one: 'hardloopsessie', other: 'hardloopsessies' }),
		ride: (count: number) => plural('nl', count, { one: 'fietstocht', other: 'fietstochten' }),
		walk: (count: number) => plural('nl', count, { one: 'wandeling', other: 'wandelingen' }),
		workout: (count: number) => plural('nl', count, { one: 'training', other: 'trainingen' }),
		second: (count: number) => plural('nl', count, { one: 'Seconde', other: 'Seconden' }),
		minute: (count: number) => plural('nl', count, { one: 'Minuut', other: 'Minuten' }),
		hour: (count: number) => plural('nl', count, { one: 'Uur', other: 'Uren' }),
		activityLabel: (count: number) =>
			plural('nl', count, { one: 'Activiteit', other: 'Activiteiten' })
	},
	pizza: (count: number) =>
		plural('nl', count, { one: 'stuk pizza weggetraind', other: 'stukken pizza weggetraind' }),
	lessPizza: 'Minder dan een stuk pizza weggetraind',
	earthPartial: (share) => `${share} van een rondje om de aarde`,
	earthLaps: (laps) => `${laps} rondjes om de aarde`,
	everestPartial: (share) => `${share} van de Mount\u00a0Everest`,
	everestMultiple: (times) => `${times} keer de Mount\u00a0Everest`,
	lotr: 'LotR-marathons',
	dayByDay: 'Dag na dag',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('nl', count, { one: 'actieve dag', other: 'actieve dagen' })} van de ${days} in ${year}`,
		summarySoFar: (n, count, days, year) =>
			`${n} ${plural('nl', count, { one: 'actieve dag', other: 'actieve dagen' })} van de ${days} in ${year} tot nu toe`,
		highlightsMarked: 'hoogtepunten gemarkeerd',
		recordsMarked: 'persoonlijke records gemarkeerd',
		highlight: 'Hoogtepunt',
		record: 'Persoonlijk record'
	}
};
