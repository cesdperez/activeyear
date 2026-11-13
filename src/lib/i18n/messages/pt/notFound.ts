import type { notFound as en } from '../en/notFound.js';
export const notFound: typeof en = {
	heading: 'Página não encontrada',
	body: 'Esta página tirou um dia de descanso.',
	back: (site: string) => `Voltar para o ${site}`
};
