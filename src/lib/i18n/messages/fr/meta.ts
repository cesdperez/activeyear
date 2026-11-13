import { TARGET_YEAR } from '#lib/constants/time.js';
import type { meta as en } from '../en/meta.js';

export const meta: typeof en = {
	title: `Bilan annuel Garmin et Strava ${TARGET_YEAR} : votre année sportive | ActiveYear`,
	description: `Transformez vos activités Garmin Connect ou Strava en bilan gratuit de ${TARGET_YEAR} : distance, dénivelé, records et cartes à partager. Privé, dans votre navigateur et sans connexion.`,
	imageAlt: `Tableau de bord ActiveYear : votre année ${TARGET_YEAR} avec distance, dénivelé, durée et calories cumulés`
};
