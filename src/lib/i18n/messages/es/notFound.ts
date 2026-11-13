import type { notFound as en } from '../en/notFound.js';
export const notFound: typeof en = {
	heading: 'Página no encontrada',
	body: 'Esta página se ha tomado un día de descanso.',
	back: (site: string) => `Volver a ${site}`
};
