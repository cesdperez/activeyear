import { plural } from '#lib/i18n/plural.js';
import type { dashboard as en } from '../en/dashboard.js';

export const dashboard: typeof en = {
	backToStart: 'Volver al inicio',
	supportExport: '¿Te gustó tu resumen? ActiveYear es gratis y lo hace una sola persona.',
	cutShort: (date: string) =>
		`Tu exportación empieza el ${date}. Si tu año empezó antes, desplázate hasta el final de Todas las actividades en Garmin Connect y vuelve a exportar.`,
	supportFooter: '¿Te gusta ActiveYear?',
	buyMeAGel: 'Invítame a un gel',
	opensKofi: '(abre Ko-fi en una pestaña nueva)',
	customPicks: 'Tu propia selección.',
	highlightPresets: 'Selecciones de destacados',
	addActivity: 'Añade una actividad',
	searchHint: 'Busca por título, deporte, mes o distancia',
	searchResultsCapped: (shown: string, total: string) =>
		`Se muestran ${shown} de ${total}. Añade palabras para afinar la búsqueda.`,
	noSearchMatches: 'No hay actividades coincidentes',
	noPicks: 'No has elegido destacados. Elige una selección o busca tus actividades.',
	removeHighlight: (title: string, date: string) => `Quitar ${title}, ${date}, de destacados`,
	removedHighlight: (x: string) => `Se quitó ${x}`,
	addedHighlight: (x: string) => `Se añadió ${x}`,
	highlightLimit: (n: number) => `Máximo ${n} destacados. Quita uno para añadir otro.`,
	searchResults: (n: number) =>
		`${n} ${plural('es', n, { one: 'resultado', other: 'resultados' })}`,
	presets: {
		longest: { label: 'Más largas', description: 'Tus sesiones más largas del año.' },
		farthest: { label: 'Más distancia', description: 'Los días en que llegaste más lejos.' },
		climbs: { label: 'Mayor desnivel', description: 'Donde acumulaste más desnivel.' },
		'per-sport': {
			label: 'Lo mejor de cada deporte',
			description: 'Tu sesión más larga de cada deporte.'
		},
		'best-month': { label: 'Mes épico', description: 'Lo mejor del mes en que más te moviste.' },
		favorites: {
			label: 'Favoritos de Garmin',
			description: 'Las actividades marcadas como favoritas en Garmin Connect.'
		}
	},

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
	celebrationConfetti: 'Confeti de celebración',
	yourYearSoFar: (year) => `Tu ${year} hasta ahora`,
	yourYear: (year) => `Tu ${year}`,
	activitySummaryActivities: (n, count) =>
		`${n} ${plural('es', count, { one: 'actividad', other: 'actividades' })}`,
	activitySummaryDays: (n, count) =>
		`en ${n} ${plural('es', count, { one: 'día activo', other: 'días activos' })}`,
	activeDaysLabel: (count) => plural('es', count, { one: 'Día activo', other: 'Días activos' }),
	dayStreak: 'Racha de días',
	percentOfYearSoFar: (percent) => `${percent} del año hasta ahora`,
	percentOfYear: (percent) => `${percent} del año`,
	longestDistance: 'Mayor distancia',
	longestDuration: 'Mayor duración',
	biggestBurn: 'Más calorías quemadas',
	breakdownMetric: 'Métrica del desglose',
	activities: 'Actividades',
	time: 'Tiempo',
	highlights: 'Destacados',
	stravaHighlights:
		'Tus sesiones más largas del año. Las exportaciones de Strava no incluyen favoritos.',
	noHighlights: 'Aún no hay destacados',
	garminFavoritesHint:
		'Marca actividades como favoritas en Garmin Connect tocando la estrella de cualquier actividad y vuelve a exportar tus datos para verlas aquí.',
	quarter: (quarter) => `T${quarter}`,
	jumpExport: 'Ir a exportar',
	fewerStats: 'Menos estadísticas',
	moreStats: 'Más estadísticas',
	quarters: 'Trimestres',
	rest: 'Descanso',
	demoData: 'Datos de ejemplo',
	noData: 'Sin datos',
	noActivities: 'Sin actividades',
	longestBreak: 'Descanso más largo',
	day: 'día',
	days: 'días',
	to: 'a',
	noRestDay: 'Sin días de descanso entre actividades.',
	byWeekday: 'Por día de la semana',
	averageActivity: 'Promedio por actividad',
	activeDays: 'Días activos',
	longestStreakDays: 'Racha más larga en días',
	totals: 'Totales',
	weekday: 'Día',
	sport: 'Deporte',
	distance: 'Distancia'
};
