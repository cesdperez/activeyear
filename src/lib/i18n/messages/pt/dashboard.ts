import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	backToStart: 'Voltar ao início',
	supportExport: 'Curtiu seu resumo? O ActiveYear é gratuito e feito por uma pessoa só.',
	supportFooter: 'Está curtindo o ActiveYear?',
	buyMeAGel: 'Me paga um gel',
	opensKofi: '(abre o Ko-fi em uma nova aba)',
	customPicks: 'Suas próprias escolhas.',
	highlightPresets: 'Seleções de destaques',
	searchActivities: 'Buscar atividades',
	searchPlaceholder: 'Adicione uma atividade',
	searchHint: 'Busque por título, esporte, mês ou distância',
	noSearchMatches: 'Nenhuma atividade encontrada',
	noPicks: 'Nenhum destaque escolhido. Escolha uma seleção ou busque suas atividades.',
	removeHighlight: (x: string) => `Remover ${x} dos destaques`,
	removedHighlight: (x: string) => `${x} removido`,
	addedHighlight: (x: string) => `${x} adicionado`,
	highlightLimit: (n: number) => `Máximo de ${n} destaques. Remova um para adicionar outro.`,
	searchResults: (n: number) => `${n} ${n === 1 ? 'resultado' : 'resultados'}`,
	presets: {
		longest: { label: 'Mais longas', description: 'Suas sessões mais longas do ano.' },
		farthest: { label: 'Mais distantes', description: 'Os dias em que você foi mais longe.' },
		climbs: { label: 'Maiores subidas', description: 'Onde você acumulou mais elevação.' },
		'per-sport': {
			label: 'Melhor de cada esporte',
			description: 'Sua sessão mais longa em cada esporte.'
		},
		'best-month': {
			label: 'Mês épico',
			description: 'O melhor do mês em que você mais se movimentou.'
		},
		favorites: {
			label: 'Favoritos do Garmin',
			description: 'As atividades marcadas como favoritas no Garmin Connect.'
		}
	},

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
	quarters: 'Trimestres',
	rest: 'Descanso',
	noActivities: 'Sem atividades',
	longestBreak: 'Maior pausa',
	day: 'dia',
	days: 'dias',
	to: 'a',
	noRestDay: 'Nenhum dia de descanso entre atividades.',
	byWeekday: 'Por dia da semana',
	averageActivity: 'Média por atividade',
	activeDays: 'Dias ativos',
	longestStreakDays: 'Maior sequência em dias',
	totals: 'Totais',
	weekday: 'Dia',
	sport: 'Esporte',
	distance: 'Distância'
};
