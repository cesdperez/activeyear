import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: '¿Qué es esto?',
			answer: `Un resumen gratuito de ${TARGET_YEAR} para deportistas de Garmin y Strava. Sube tu archivo de actividades y descubre tu año deportivo: distancia, desnivel, tiempo y calorías totales, desglose por deporte, récords personales, destacados y tu racha más larga.`
		},
		{
			question: '¿Mis datos son privados?',
			answer:
				'Sí. El archivo se lee y analiza en tu dispositivo y no necesitas crear una cuenta. Registramos algunos recuentos anónimos, como el tema que exportas y si las cargas funcionan, para mejorar la aplicación. Sin cookies ni seguimiento, y tus datos de actividad nunca salen de tu dispositivo.'
		},
		{
			question: '¿Qué archivo necesito?',
			answer: `El CSV de Activities de Garmin Connect o activities.csv de la exportación de tu cuenta de Strava, en inglés, español, alemán, francés, italiano, neerlandés o portugués. Si tu cuenta de Garmin usa unidades imperiales, elige ${upload.imperial} en la pantalla de carga. Incluye carrera, ciclismo, natación, caminata, senderismo, fuerza, yoga, deportes de remo, cardio, deportes de invierno, deportes de raqueta y escalada.`
		},
		{
			question: '¿Qué puedo compartir?',
			answer:
				'Tres tarjetas para stories (PNG de 1080 × 1920): un resumen, un desglose por deporte y tus destacados, en seis estilos: Neon, Minimal, Retro, Classic, Synthwave y Lightmile.'
		},
		{
			question: '¿Puedo volver a abrir mi resumen más tarde?',
			answer: `Sí. Usa ${dashboard.saveMyYear} en tu panel para descargar un pequeño archivo .json y arrástralo al área de carga cuando quieras volver a abrir el resumen. Permanece en tu dispositivo.`
		},
		{
			question: '¿Funciona con Strava?',
			answer:
				'Sí. Sube activities.csv de la exportación de tu cuenta de Strava, que se pide en «Settings» (Ajustes) → «My Account» (Mi cuenta) → «Download or Delete Your Account» (Descargar o eliminar tu cuenta). Strava debe estar configurado en inglés, español, alemán, francés, italiano, neerlandés o portugués.'
		},
		{
			question: '¿Es gratis?',
			answer: 'Sí. Sin registro ni anuncios, y el código es abierto en GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'Inicia sesión en',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Ve a Actividades → Todas las actividades' },
		{ text: `Desplázate hasta que se carguen todas las actividades de ${TARGET_YEAR}` },
		{
			text: 'Haz clic en «Export CSV» (Exportar CSV), arriba a la derecha. El archivo se descarga al momento.'
		}
	],
	garminNote:
		'Usa la web en un ordenador: la aplicación no permite exportar. No pidas la exportación completa de datos de Garmin: tarda días y trae otro archivo.',
	stravaSteps: [
		{
			text: 'Inicia sesión en',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{
			text: 'En «Download or Delete Your Account» (Descargar o eliminar tu cuenta), haz clic en «Get Started» (Empezar) y luego en «Request your archive» (Solicitar tu archivo)'
		},
		{ text: 'Espera el correo con el enlace de descarga. Suele llegar en unas pocas horas.' },
		{ text: 'Descomprime el archivo y sube activities.csv' }
	],
	stravaNote:
		'Strava debe estar configurado en inglés, español, alemán, francés, italiano, neerlandés o portugués.',
	heading: 'Preguntas',
	guidesAria: 'Elige la fuente de tus datos'
};
