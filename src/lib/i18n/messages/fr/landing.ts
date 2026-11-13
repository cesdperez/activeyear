import type { landing as en } from '../en/landing.js';
export const landing: typeof en = {
	tagline: (year: number) => `Votre année sportive ${year}`,
	noscript:
		'ActiveYear a besoin de JavaScript pour lire votre CSV Garmin ou Strava. Tout est traité dans votre navigateur et vos données ne quittent jamais votre appareil. Activez JavaScript et rechargez cette page.',
	demo: 'Pas de fichier CSV ? Découvrez l’application avec des données de démonstration',
	how: 'Comment obtenir vos données'
};
