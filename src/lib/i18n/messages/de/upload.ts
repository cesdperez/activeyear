import type { upload as en } from '../en/upload.js';
export const upload: typeof en = {
	drop: 'Ziehe deine Garmin- oder Strava-CSV hierher',
	browse: 'oder klicke zum Auswählen',
	saved: 'Dein Jahr schon gespeichert? Ziehe die .json-Datei hierher',
	privacy: 'Deine Daten verlassen diesen Browser nie',
	retry: 'Klicke, um es erneut zu versuchen',
	analyzing: 'Aktivitäten werden analysiert...',
	invalidExtension: 'Bitte lade eine CSV- oder gespeicherte .json-Datei hoch',
	unrecognised:
		'Diese Datei wurde nicht erkannt. Lade die Aktivitäten-CSV von Garmin Connect oder activities.csv aus deinem Strava-Export auf Englisch hoch.',
	stravaNotEnglish:
		'Dieser Strava-Export ist nicht auf Englisch. Stelle Strava auf Englisch, fordere ein neues Archiv an und lade activities.csv hoch.',
	unknown: 'Datei konnte nicht verarbeitet werden',
	'invalid-date': 'das Datum ist ungültig',
	'malformed-quotes': 'die Anführungszeichen stimmen nicht überein',
	'missing-column': 'Aktivitätstyp oder Datum fehlt',
	singleRow: (row: number, reason: string) => `Zeile ${row} konnte nicht gelesen werden: ${reason}`,
	multipleRows: (count: string, row: number, reason: string) =>
		`${count} Zeilen konnten nicht gelesen werden, z. B. Zeile ${row}: ${reason}`,
	noActivities: (year: number) => `Keine Aktivitäten aus ${year} in der Datei gefunden`,
	years: (range: string, year: number) =>
		`Diese Datei enthält Aktivitäten von ${range}, keine aus ${year}`,
	range: (first: number, last: number) => `${first} bis ${last}`,
	skipped: (count: string, noun: string) => `${count} nicht lesbare ${noun} übersprungen`,
	one: 'Zeile',
	other: 'Zeilen',
	unsupportedVersion: 'Dieses gespeicherte Jahr stammt aus einer anderen Version von ActiveYear',
	wrongYear: (year: number, expected: number) =>
		`Diese Datei enthält dein Jahr ${year}, nicht ${expected}`,
	invalidSaved: 'Diese Datei ist kein gespeichertes ActiveYear-Jahr',
	loading: ['Waden werden aufgewärmt...']
};
