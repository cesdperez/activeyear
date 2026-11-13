import type { landing as en } from '../en/landing.js';
export const landing: typeof en = {
	tagline: (year: number) => `Jouw sportjaar ${year}`,
	noscript:
		'ActiveYear heeft JavaScript nodig om je Garmin- of Strava-CSV te lezen. Alles wordt verwerkt in je browser en je gegevens verlaten nooit je apparaat. Schakel JavaScript in en laad deze pagina opnieuw.',
	mobileHint: 'Exporteer op een computer of probeer de demo.',
	demo: 'Geen CSV-bestand? Bekijk hoe het werkt met voorbeeldgegevens',
	how: 'Zo krijg je je gegevens'
};
