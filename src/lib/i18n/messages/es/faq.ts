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
				'Tres tarjetas para stories (PNG de 1080 × 1920): un resumen, un desglose por deporte y tus destacados, en estilo Neon, Minimal o Retro.'
		},
		{
			question: '¿Puedo volver a abrir mi resumen más tarde?',
			answer: `Sí. Usa ${dashboard.saveMyYear} en tu panel para descargar un pequeño archivo .json y arrástralo al área de carga cuando quieras volver a abrir el resumen. Permanece en tu dispositivo.`
		},
		{
			question: '¿Funciona con Strava?',
			answer:
				'Sí. Sube activities.csv de la exportación de tu cuenta de Strava (Settings, My Account, Download or Delete Your Account), con Strava configurado en inglés, español, alemán, francés, italiano, neerlandés o portugués.'
		},
		{
			question: '¿Es gratis?',
			answer: 'Sí. Sin registro ni anuncios, y el código es abierto en GitHub.',
			tip: { text: 'Si te gusta, puedes dejar una propina:', label: 'invítame a un gel en Ko-fi' }
		}
	],
	garminSteps: [
		{
			text: 'Inicia sesión en',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Ve a Activities → All Activities' },
		{ text: `Desplázate hasta que se carguen todas las actividades de ${TARGET_YEAR}` },
		{ text: 'Haz clic en Export CSV (icono arriba a la derecha)' }
	],
	garminNote: 'Usa la web en un ordenador. La aplicación Garmin Connect no permite exportar.',
	stravaSteps: [
		{
			text: 'Inicia sesión en',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{ text: 'Ve a Settings → My Account → Download or Delete Your Account' },
		{ text: 'Haz clic en Request your archive' },
		{ text: 'Abre el enlace de descarga que Strava te envía por correo y descomprime el archivo' },
		{ text: 'Sube activities.csv' }
	],
	stravaNote:
		'Sube solo activities.csv. Strava debe estar configurado en inglés, español, alemán, francés, italiano, neerlandés o portugués.',
	heading: 'Preguntas',
	guidesAria: 'Elige la fuente de tus datos'
};
