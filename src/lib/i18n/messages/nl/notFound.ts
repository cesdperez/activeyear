import type { notFound as en } from '../en/notFound.js';
export const notFound: typeof en = {
	heading: 'Pagina niet gevonden',
	body: 'Deze pagina neemt een rustdag.',
	back: (site: string) => `Terug naar ${site}`
};
