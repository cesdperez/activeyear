import type { notFound as en } from '../en/notFound.js';
export const notFound: typeof en = {
	heading: 'Seite nicht gefunden',
	body: 'Diese Seite hat heute Ruhetag.',
	back: (site: string) => `Zurück zu ${site}`
};
