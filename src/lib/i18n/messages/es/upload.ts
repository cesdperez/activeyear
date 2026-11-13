import { plural } from '#lib/i18n/plural.js';
import type { upload as en } from '../en/upload.js';
export const upload: typeof en = {
	garminUnits: 'Unidades de tu cuenta de Garmin',
	metric: 'Métrico',
	imperial: 'Imperial',
	drop: 'Arrastra aquí tu CSV de Garmin o Strava',
	browse: 'o haz clic para buscar',
	saved: '¿Ya guardaste tu año? Arrastra el archivo .json',
	privacy: 'Tus datos nunca salen de este navegador',
	retry: 'Haz clic para intentarlo de nuevo',
	analyzing: 'Analizando actividades...',
	invalidExtension: 'Sube un archivo CSV o un archivo .json guardado.',
	zipArchive:
		'Este es un archivo .zip. Descomprime tu exportación de Strava y sube su activities.csv, o sube el CSV de actividades de Garmin Connect.',
	unrecognised:
		'No pudimos reconocer este archivo. Sube el CSV de actividades de Garmin Connect o activities.csv de tu exportación de Strava en inglés, español, alemán, francés, italiano, neerlandés o portugués.',
	stravaUnsupportedLanguage:
		'Esta exportación de Strava está en un idioma que aún no podemos leer. Configura Strava en inglés, español, alemán, francés, italiano, neerlandés o portugués, solicita un nuevo archivo y sube su activities.csv.',
	unknown: 'No se pudo procesar el archivo.',
	'invalid-date': 'la fecha no es válida',
	'malformed-quotes': 'las comillas no coinciden',
	'missing-column': 'falta el tipo de actividad o la fecha',
	singleRow: (row: number, reason: string) => `No se pudo leer la fila ${row}: ${reason}.`,
	multipleRows: (count: string, row: number, reason: string) =>
		`No se pudieron leer ${count} filas, por ejemplo la fila ${row}: ${reason}.`,
	noActivities: (year: number) => `No se encontraron actividades de ${year} en el archivo.`,
	years: (range: string, year: number) =>
		`Este archivo contiene actividades de ${range}, ninguna de ${year}.`,
	exportAgain: (year: number) => `Vuelve a exportar tus actividades para incluir ${year}.`,
	range: (first: number, last: number) => `${first} a ${last}`,
	skipped: (count: number, formatted: string) =>
		plural('es', count, {
			one: `Se omitió ${formatted} fila que no se pudo leer`,
			other: `Se omitieron ${formatted} filas que no se pudieron leer`
		}),
	unsupportedVersion: 'Este año guardado es de otra versión de ActiveYear.',
	wrongYear: (year: number, expected: number) =>
		`Este archivo contiene tu año ${year}, no ${expected}. Sube tu exportación de ${expected}.`,
	invalidSaved: 'Este archivo no es un año guardado de ActiveYear.',
	garminDataExport:
		'Este archivo es de una exportación de datos de Garmin. Sube en su lugar el CSV de actividades de Garmin Connect.',
	loading: ['Calentando las piernas...']
};
