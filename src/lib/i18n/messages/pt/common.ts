import { sports } from './sports.js';
import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	otherSports: 'Outros esportes',
	sports,
	nouns: {
		activity: (count: number) => plural('pt', count, { one: 'atividade', other: 'atividades' }),
		swim: (count: number) =>
			plural('pt', count, { one: 'sessão de natação', other: 'sessões de natação' }),
		run: (count: number) => plural('pt', count, { one: 'corrida', other: 'corridas' }),
		ride: (count: number) => plural('pt', count, { one: 'pedalada', other: 'pedaladas' }),
		walk: (count: number) => plural('pt', count, { one: 'caminhada', other: 'caminhadas' }),
		workout: (count: number) => plural('pt', count, { one: 'treino', other: 'treinos' }),
		second: (count: number) => plural('pt', count, { one: 'Segundo', other: 'Segundos' }),
		minute: (count: number) => plural('pt', count, { one: 'Minuto', other: 'Minutos' }),
		hour: (count: number) => plural('pt', count, { one: 'Hora', other: 'Horas' }),
		activityLabel: (count: number) => plural('pt', count, { one: 'Atividade', other: 'Atividades' })
	},
	pizza: (count: number) =>
		plural('pt', count, { one: 'fatia de pizza queimada', other: 'fatias de pizza queimadas' }),
	lessPizza: 'Menos de uma fatia de pizza queimada',
	earthPartial: (share) => `${share} de uma volta ao mundo`,
	earthLaps: (laps) => `${laps} voltas ao mundo`,
	everestPartial: (share) => `${share} da altura do Everest`,
	everestMultiple: (times) => `${times} vezes a altura do Everest`,
	lotr: 'maratonas do SdA',
	dayByDay: 'Dia a dia',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('pt', count, { one: 'dia ativo', other: 'dias ativos' })} de ${days} em ${year}`,
		summarySoFar: (n, count, days, year) =>
			`${n} ${plural('pt', count, { one: 'dia ativo', other: 'dias ativos' })} de ${days} em ${year} até agora`,
		highlightsMarked: 'destaques marcados',
		recordsMarked: 'recordes pessoais marcados',
		highlight: 'Destaque',
		record: 'Recorde pessoal'
	},
	footer: {
		reportIssue: 'Relatar um problema',
		otherProjects: 'Ver meus outros projetos',
		opensInNewTab: '(abre em uma nova aba)'
	}
};
