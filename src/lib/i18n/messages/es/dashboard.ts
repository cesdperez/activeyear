import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	totalDistance: 'Distancia total',
	elevationGained: 'Desnivel acumulado',
	timeActive: 'Tiempo activo',
	caloriesBurned: 'Calorías quemadas',
	personalRecords: 'Mejores marcas',
	bySport: 'Por deporte',
	whenYouTrain: 'Cuándo entrenas',
	uploadDifferentFile: 'Subir otro archivo',
	saveMyYear: 'Guardar mi año',
	reopenRecap: 'Abre este resumen más tarde sin volver a exportar',
	distanceUnit: 'Unidad de distancia',
	disableCelebration: 'Desactivar el modo celebración',
	enableCelebration: 'Activar el modo celebración',
	celebrationConfetti: 'Confeti de celebración',
	yourYear: (year) => `Tu ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('es', count, { one: 'actividad', other: 'actividades' })}`,
	activitySummaryDays: (n, count) =>
		`en ${n} ${plural('es', count, { one: 'día activo', other: 'días activos' })}`,
	activeDaysLabel: (count) => plural('es', count, { one: 'Día activo', other: 'Días activos' }),
	streakCaption: (count) =>
		plural('es', count, {
			one: 'día activo consecutivo',
			other: 'máximo de días activos consecutivos'
		}),
	dayStreak: 'Racha de días',
	percentOfYear: (percent) => `${percent} del año`,
	longestDistance: 'Mayor distancia',
	longestDuration: 'Mayor duración',
	biggestBurn: 'Más calorías quemadas',
	breakdownMetric: 'Métrica del desglose',
	activities: 'Actividades',
	time: 'Tiempo',
	highlights: 'Momentos destacados',
	stravaHighlights:
		'Tus sesiones más largas del año. Las exportaciones de Strava no incluyen favoritos.',
	noHighlights: 'Aún no hay momentos destacados',
	garminFavoritesHint:
		'Marca actividades como favoritas en Garmin Connect tocando la estrella de cualquier actividad y vuelve a exportar tus datos para verlas aquí.',
	quarter: (quarter) => `T${quarter}`,
	jumpExport: 'Ir a exportar',
	fewerStats: 'Menos estadísticas',
	moreStats: 'Más estadísticas',
	moreStatsTitle: 'Más estadísticas',
	quarters: 'Trimestres',
	rest: 'Descanso',
	noActivities: 'Sin actividades',
	longestBreak: 'Descanso más largo',
	day: 'día',
	days: 'días',
	to: 'a',
	noRestDay: 'Sin días de descanso entre actividades.',
	byWeekday: 'Por día de la semana',
	averageActivity: 'Promedio por actividad'
};
