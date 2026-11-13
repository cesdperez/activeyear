import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'O que é isto?',
			answer: `Uma retrospectiva gratuita de ${TARGET_YEAR} para atletas do Garmin e Strava. Envie sua exportação de atividades e veja seu ano no esporte: distância, elevação, tempo e calorias totais, divisão por esporte, recordes pessoais, destaques e sua maior sequência.`
		},
		{
			question: 'Meus dados são privados?',
			answer:
				'Sim. O arquivo é lido e analisado no seu dispositivo e não é preciso criar uma conta. Registramos algumas contagens anônimas, como o tema que você exporta e se os envios funcionam, para melhorar o aplicativo. Sem cookies, sem rastreamento e seus dados de atividades nunca saem do seu dispositivo.'
		},
		{
			question: 'Qual arquivo preciso usar?',
			answer: `O CSV de Activities do Garmin Connect ou o activities.csv da exportação da sua conta do Strava, em inglês, espanhol, alemão, francês, italiano, holandês ou português. Se sua conta Garmin usa unidades imperiais, escolha ${upload.imperial} na tela de envio. Inclui corrida, ciclismo, natação, caminhada, trilha, força, yoga, esportes a remo, cardio, esportes de inverno, esportes de raquete e escalada.`
		},
		{
			question: 'O que posso compartilhar?',
			answer:
				'Três cards para stories (PNG de 1080 × 1920): um resumo, uma divisão por esporte e seus destaques, nos estilos Neon, Minimal ou Retro.'
		},
		{
			question: 'Posso abrir meu resumo novamente depois?',
			answer: `Sim. Use ${dashboard.saveMyYear} no painel para baixar um pequeno arquivo .json e arraste-o para a área de envio quando quiser reabrir o resumo. Ele fica no seu dispositivo.`
		},
		{
			question: 'Funciona com o Strava?',
			answer:
				'Sim. Envie activities.csv da exportação da sua conta do Strava (Settings, My Account, Download or Delete Your Account), com o Strava configurado em inglês, espanhol, alemão, francês, italiano, holandês ou português.'
		},
		{
			question: 'É grátis?',
			answer: 'Sim. Sem cadastro nem anúncios, e o código é aberto no GitHub.',
			tip: {
				text: 'Se você gosta do app, pode deixar uma gorjeta:',
				label: 'me paga um gel no Ko-fi'
			}
		}
	],
	garminSteps: [
		{ text: 'Entre em', link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' } },
		{ text: 'Acesse Activities → All Activities' },
		{ text: `Role a página até carregar todas as atividades de ${TARGET_YEAR}` },
		{ text: 'Clique em Export CSV (ícone no canto superior direito)' }
	],
	garminNote: 'Use o site em um computador. O aplicativo Garmin Connect não permite exportar.',
	stravaSteps: [
		{ text: 'Entre em', link: { href: 'https://www.strava.com/account', label: 'strava.com' } },
		{ text: 'Acesse Settings → My Account → Download or Delete Your Account' },
		{ text: 'Clique em Request your archive' },
		{ text: 'Abra o link de download enviado pelo Strava por e-mail e descompacte o arquivo' },
		{ text: 'Envie activities.csv' }
	],
	stravaNote:
		'Envie apenas activities.csv. O Strava deve estar configurado em inglês, espanhol, alemão, francês, italiano, holandês ou português.',
	heading: 'Perguntas',
	guidesAria: 'Escolha a origem dos seus dados'
};
