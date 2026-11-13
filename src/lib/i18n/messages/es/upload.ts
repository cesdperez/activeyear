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
	invalidExtension: 'Sube un archivo CSV o un archivo .json guardado',
	unrecognised:
		'No pudimos reconocer este archivo. Sube el CSV de actividades de Garmin Connect o activities.csv de tu exportación de Strava en inglés.',
	stravaNotEnglish:
		'Esta exportación de Strava no está en inglés. Cambia el idioma de Strava a inglés, solicita un nuevo archivo y sube activities.csv.',
	unknown: 'No se pudo procesar el archivo',
	'invalid-date': 'la fecha no es válida',
	'malformed-quotes': 'las comillas no coinciden',
	'missing-column': 'falta el tipo de actividad o la fecha',
	singleRow: (row: number, reason: string) => `No se pudo leer la fila ${row}: ${reason}`,
	multipleRows: (count: string, row: number, reason: string) =>
		`No se pudieron leer ${count} filas, por ejemplo la fila ${row}: ${reason}`,
	noActivities: (year: number) => `No se encontraron actividades de ${year} en el archivo`,
	years: (range: string, year: number) =>
		`Este archivo contiene actividades de ${range}, ninguna de ${year}`,
	range: (first: number, last: number) => `${first} a ${last}`,
	skipped: (count: string, noun: string) => `Se omitieron ${count} ${noun} que no se pudieron leer`,
	one: 'fila',
	other: 'filas',
	unsupportedVersion: 'Este año guardado es de otra versión de ActiveYear',
	wrongYear: (year: number, expected: number) =>
		`Este archivo contiene tu año ${year}, no ${expected}`,
	invalidSaved: 'Este archivo no es un año guardado de ActiveYear',
	loading: ['Calentando las piernas...']
};
