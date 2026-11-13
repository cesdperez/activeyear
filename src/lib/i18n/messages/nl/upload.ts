import type { upload as en } from '../en/upload.js';
export const upload: typeof en = {
	garminUnits: 'Eenheden in je Garmin-account',
	metric: 'Metrisch',
	imperial: 'Imperiaal',
	drop: 'Sleep je Garmin- of Strava-CSV hierheen',
	browse: 'of klik om te bladeren',
	saved: 'Je jaar al opgeslagen? Sleep het .json-bestand hierheen',
	privacy: 'Je gegevens verlaten deze browser nooit',
	retry: 'Klik om opnieuw te proberen',
	analyzing: 'Activiteiten analyseren...',
	invalidExtension: 'Upload een CSV of opgeslagen .json-bestand',
	unrecognised:
		'Dit bestand is niet herkend. Upload de activiteiten-CSV van Garmin Connect of activities.csv uit je Strava-export in het Engels, Spaans, Duits, Frans, Italiaans, Nederlands of Portugees.',
	stravaUnsupportedLanguage:
		'Deze Strava-export is in een taal die we nog niet kunnen lezen. Stel Strava in op Engels, Spaans, Duits, Frans, Italiaans, Nederlands of Portugees, vraag een nieuw archief aan en upload de activities.csv daaruit.',
	unknown: 'Bestand kon niet worden verwerkt',
	'invalid-date': 'de datum is ongeldig',
	'malformed-quotes': 'de aanhalingstekens komen niet overeen',
	'missing-column': 'het activiteitstype of de datum ontbreekt',
	singleRow: (row: number, reason: string) => `Rij ${row} kon niet worden gelezen: ${reason}`,
	multipleRows: (count: string, row: number, reason: string) =>
		`${count} rijen konden niet worden gelezen, bijvoorbeeld rij ${row}: ${reason}`,
	noActivities: (year: number) => `Geen activiteiten uit ${year} gevonden in het bestand`,
	years: (range: string, year: number) =>
		`Dit bestand bevat activiteiten van ${range}, geen uit ${year}`,
	range: (first: number, last: number) => `${first} tot ${last}`,
	skipped: (count: string, noun: string) => `${count} onleesbare ${noun} overgeslagen`,
	one: 'rij',
	other: 'rijen',
	unsupportedVersion: 'Dit opgeslagen jaar komt uit een andere versie van ActiveYear',
	wrongYear: (year: number, expected: number) =>
		`Dit bestand bevat je jaar ${year}, niet ${expected}`,
	invalidSaved: 'Dit bestand is geen opgeslagen ActiveYear-jaar',
	loading: ['Kuiten opwarmen...']
};
