import type { landing as en } from '../en/landing.js';
export const landing: typeof en = {
	tagline: (year: number) => `Tu ${year} en el deporte`,
	noscript:
		'ActiveYear necesita JavaScript para leer tu CSV de Garmin o Strava. Todo se procesa en tu navegador y tus datos nunca salen de tu dispositivo. Activa JavaScript y vuelve a cargar esta página.',
	mobileHint: 'Exporta en un ordenador o prueba la demo.',
	demo: '¿No tienes un archivo CSV? Descubre cómo funciona con datos de ejemplo',
	how: 'Cómo obtener tus datos'
};
