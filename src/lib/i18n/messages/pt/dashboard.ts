import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	totalDistance: 'Distância total',
	elevationGained: 'Elevação acumulada',
	timeActive: 'Tempo ativo',
	caloriesBurned: 'Calorias queimadas',
	personalRecords: 'Recordes pessoais',
	bySport: 'Por esporte',
	whenYouTrain: 'Quando você treina',
	uploadDifferentFile: 'Enviar outro arquivo',
	saveMyYear: 'Salvar meu ano',
	reopenRecap: 'Abra este resumo depois sem exportar novamente',
	distanceUnit: 'Unidade de distância',
	disableCelebration: 'Desativar modo de celebração',
	enableCelebration: 'Ativar modo de celebração',
	celebrationConfetti: 'Confete de celebração',
	yourYear: (year) => `Seu ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('pt', count, { one: 'atividade', other: 'atividades' })}`,
	activitySummaryDays: (n, count) =>
		`em ${n} ${plural('pt', count, { one: 'dia ativo', other: 'dias ativos' })}`,
	activeDaysLabel: (count) => plural('pt', count, { one: 'Dia ativo', other: 'Dias ativos' }),
	streakCaption: (count) =>
		plural('pt', count, {
			one: 'dia ativo consecutivo',
			other: 'máximo de dias ativos consecutivos'
		}),
	dayStreak: 'Sequência de dias',
	percentOfYear: (percent) => `${percent} do ano`,
	longestDistance: 'Maior distância',
	longestDuration: 'Maior duração',
	biggestBurn: 'Mais calorias queimadas',
	breakdownMetric: 'Métrica da distribuição',
	activities: 'Atividades',
	time: 'Tempo',
	highlights: 'Destaques',
	stravaHighlights:
		'Suas sessões mais longas do ano. As exportações do Strava não incluem favoritos.',
	noHighlights: 'Ainda não há destaques',
	garminFavoritesHint:
		'Marque atividades como favoritas no Garmin Connect tocando na estrela de qualquer atividade e exporte seus dados novamente para vê-las aqui.',
	quarter: (quarter) => `T${quarter}`,
	jumpExport: 'Ir para exportação',
	fewerStats: 'Menos estatísticas',
	moreStats: 'Mais estatísticas',
	moreStatsTitle: 'Mais estatísticas',
	quarters: 'Trimestres',
	rest: 'Descanso',
	noActivities: 'Sem atividades',
	longestBreak: 'Maior pausa',
	day: 'dia',
	days: 'dias',
	to: 'a',
	noRestDay: 'Nenhum dia de descanso entre atividades.',
	byWeekday: 'Por dia da semana',
	averageActivity: 'Média por atividade'
};
