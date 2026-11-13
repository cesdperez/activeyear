import type { upload as en } from '../en/upload.js';
export const upload: typeof en = {
	garminUnits: 'Unidades da sua conta Garmin',
	metric: 'Métrico',
	imperial: 'Imperial',
	drop: 'Arraste seu CSV do Garmin ou Strava aqui',
	browse: 'ou clique para procurar',
	saved: 'Já salvou seu ano? Arraste o arquivo .json',
	privacy: 'Seus dados nunca saem deste navegador',
	retry: 'Clique para tentar novamente',
	analyzing: 'Analisando atividades...',
	invalidExtension: 'Envie um arquivo CSV ou .json salvo',
	unrecognised:
		'Não foi possível reconhecer este arquivo. Envie o CSV de atividades do Garmin Connect ou activities.csv da exportação do Strava em inglês.',
	stravaNotEnglish:
		'Esta exportação do Strava não está em inglês. Altere o idioma do Strava para inglês, solicite um novo arquivo e envie activities.csv.',
	unknown: 'Não foi possível processar o arquivo',
	'invalid-date': 'a data é inválida',
	'malformed-quotes': 'as aspas não correspondem',
	'missing-column': 'falta o tipo de atividade ou a data',
	singleRow: (row: number, reason: string) => `Não foi possível ler a linha ${row}: ${reason}`,
	multipleRows: (count: string, row: number, reason: string) =>
		`Não foi possível ler ${count} linhas, por exemplo a linha ${row}: ${reason}`,
	noActivities: (year: number) => `Nenhuma atividade de ${year} encontrada no arquivo`,
	years: (range: string, year: number) =>
		`Este arquivo contém atividades de ${range}, nenhuma de ${year}`,
	range: (first: number, last: number) => `${first} a ${last}`,
	skipped: (count: string, noun: string) =>
		`${count} ${noun} não puderam ser lidas e foram ignoradas`,
	one: 'linha',
	other: 'linhas',
	unsupportedVersion: 'Este ano salvo é de outra versão do ActiveYear',
	wrongYear: (year: number, expected: number) =>
		`Este arquivo contém seu ano ${year}, não ${expected}`,
	invalidSaved: 'Este arquivo não é um ano salvo do ActiveYear',
	loading: ['Aquecendo as pernas...']
};
