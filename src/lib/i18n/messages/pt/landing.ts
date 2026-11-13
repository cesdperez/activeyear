import type { landing as en } from '../en/landing.js';
export const landing: typeof en = {
	tagline: (year: number) => `Seu ${year} no esporte`,
	noscript:
		'O ActiveYear precisa de JavaScript para ler seu CSV do Garmin ou Strava. Tudo é processado no navegador e seus dados nunca saem do seu dispositivo. Ative o JavaScript e recarregue esta página.',
	demo: 'Não tem um arquivo CSV? Veja como funciona com dados de exemplo',
	how: 'Como obter seus dados'
};
