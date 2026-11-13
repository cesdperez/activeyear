import type { landing as en } from '../en/landing.js';
export const landing: typeof en = {
	tagline: (year: number) => `Dein Sportjahr ${year}`,
	noscript:
		'ActiveYear benötigt JavaScript, um deine Garmin- oder Strava-CSV zu lesen. Alles wird in deinem Browser verarbeitet und deine Daten verlassen nie dein Gerät. Aktiviere JavaScript und lade die Seite neu.',
	mobileHint: 'Exportiere am Computer oder probiere die Demo aus.',
	demo: 'Keine CSV-Datei? Probiere es mit Beispieldaten aus',
	how: 'So erhältst du deine Daten'
};
