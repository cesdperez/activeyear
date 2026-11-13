import type { upload as en } from '../en/upload.js';
export const upload: typeof en = {
	garminUnits: 'Unités de votre compte Garmin',
	metric: 'Métrique',
	imperial: 'Impérial',
	drop: 'Déposez votre CSV Garmin ou Strava ici',
	browse: 'ou cliquez pour parcourir',
	saved: 'Année déjà enregistrée ? Déposez le fichier .json',
	privacy: 'Vos données ne quittent jamais ce navigateur',
	retry: 'Cliquez pour réessayer',
	analyzing: 'Analyse des activités...',
	invalidExtension: 'Veuillez importer un fichier CSV ou .json enregistré',
	unrecognised:
		'Ce fichier est inconnu. Importez le CSV des activités Garmin Connect ou activities.csv de votre export Strava en anglais, espagnol, allemand, français, italien, néerlandais ou portugais.',
	stravaUnsupportedLanguage:
		'Cet export Strava est dans une langue que nous ne savons pas encore lire. Réglez Strava en anglais, espagnol, allemand, français, italien, néerlandais ou portugais, demandez une nouvelle archive et importez son fichier activities.csv.',
	unknown: 'Impossible de traiter le fichier',
	'invalid-date': 'la date est invalide',
	'malformed-quotes': 'les guillemets ne correspondent pas',
	'missing-column': 'le type d’activité ou la date manque',
	singleRow: (row: number, reason: string) => `La ligne ${row} n’a pas pu être lue : ${reason}`,
	multipleRows: (count: string, row: number, reason: string) =>
		`${count} lignes n’ont pas pu être lues, par exemple la ligne ${row} : ${reason}`,
	noActivities: (year: number) => `Aucune activité de ${year} trouvée dans le fichier`,
	years: (range: string, year: number) =>
		`Ce fichier contient des activités de ${range}, aucune de ${year}`,
	range: (first: number, last: number) => `${first} à ${last}`,
	skipped: (count: string, noun: string) => `${count} ${noun} illisibles ignorées`,
	one: 'ligne',
	other: 'lignes',
	unsupportedVersion: 'Cette année enregistrée provient d’une autre version d’ActiveYear',
	wrongYear: (year: number, expected: number) =>
		`Ce fichier contient votre année ${year}, pas ${expected}`,
	invalidSaved: 'Ce fichier n’est pas une année enregistrée ActiveYear',
	loading: ['Échauffement des mollets...']
};
