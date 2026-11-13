import { plural } from '#lib/i18n/plural.js';
import type { common as en } from '../en/common.js';
export const common: typeof en = {
	otherSports: 'Otros deportes',
	sports: {
		running: 'Carrera',
		cycling: 'Ciclismo',
		swimming: 'Natación',
		walking: 'Caminata',
		hiking: 'Senderismo',
		strength: 'Fuerza',
		yoga: 'Yoga',
		paddling: 'Piragüismo',
		rowing: 'Remo',
		cardio: 'Cardio',
		winter: 'Deportes de invierno',
		racket: 'Deportes de raqueta',
		climbing: 'Escalada',
		other: 'Otros'
	},
	nouns: {
		activity: (count: number) => plural('es', count, { one: 'actividad', other: 'actividades' }),
		swim: (count: number) =>
			plural('es', count, { one: 'sesión de natación', other: 'sesiones de natación' }),
		run: (count: number) => plural('es', count, { one: 'carrera', other: 'carreras' }),
		ride: (count: number) =>
			plural('es', count, { one: 'salida en bici', other: 'salidas en bici' }),
		walk: (count: number) => plural('es', count, { one: 'caminata', other: 'caminatas' }),
		workout: (count: number) =>
			plural('es', count, { one: 'entrenamiento', other: 'entrenamientos' }),
		second: (count: number) => plural('es', count, { one: 'Segundo', other: 'Segundos' }),
		minute: (count: number) => plural('es', count, { one: 'Minuto', other: 'Minutos' }),
		hour: (count: number) => plural('es', count, { one: 'Hora', other: 'Horas' }),
		activityLabel: (count: number) =>
			plural('es', count, { one: 'Actividad', other: 'Actividades' })
	},
	pizza: (count: number) =>
		plural('es', count, {
			one: 'porción de pizza compensada',
			other: 'porciones de pizza compensadas'
		}),
	lessPizza: 'Menos de una porción de pizza compensada',
	earthPartial: (share) => `${share} de una vuelta al mundo`,
	earthLaps: (laps) => `${laps} vueltas al mundo`,
	everestPartial: (share) => `${share} de la altura del Everest`,
	everestMultiple: (times) => `${times} veces la altura del Everest`,
	lotr: 'maratones de El Señor de los Anillos',
	dayByDay: 'Día a día',
	yearLane: {
		summary: (n, count, days, year) =>
			`${n} ${plural('es', count, { one: 'día activo', other: 'días activos' })} de ${days} en ${year}`,
		summarySoFar: (n, count, days, year) =>
			`${n} ${plural('es', count, { one: 'día activo', other: 'días activos' })} de ${days} en ${year} hasta ahora`,
		highlightsMarked: 'destacados señalados',
		recordsMarked: 'mejores marcas señaladas',
		highlight: 'Destacado',
		record: 'Mejor marca'
	}
};
