import type { notFound as en } from '../en/notFound.js';
export const notFound: typeof en = {
	heading: 'Page introuvable',
	body: 'Cette page s’est accordé un jour de repos.',
	back: (site: string) => `Retour à ${site}`
};
