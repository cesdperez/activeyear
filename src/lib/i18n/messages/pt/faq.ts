import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'O que é isto?',
			answer: `Uma retrospectiva gratuita de ${TARGET_YEAR} para Garmin e Strava. Envie sua exportação de atividades para ver sua distância, elevação, tempo, esportes, recordes e maior sequência.`
		},
		{
			question: 'Meus dados são privados?',
			answer:
				'Sim. Seu arquivo é lido no seu dispositivo e nunca sai dele. Sem conta, cookies ou rastreamento. Contamos apenas alguns eventos anônimos, como o tema que você exporta, para melhorar o aplicativo.'
		},
		{
			question: 'Qual arquivo preciso usar?',
			answer: `O CSV de Activities do Garmin Connect ou o activities.csv da sua exportação do Strava. Se sua conta Garmin usa unidades imperiais, escolha ${upload.imperial} na tela de envio.`
		},
		{
			question: 'O que posso compartilhar?',
			answer:
				'Três cards para stories: um resumo, seus esportes e seus destaques, em seis estilos: Neon, Minimal, Retro, Classic, Synthwave e Lightmile.'
		},
		{
			question: 'Posso abrir meu resumo novamente depois?',
			answer: `Sim. Use ${dashboard.saveMyYear} no painel para baixar um pequeno arquivo .json. Arraste-o para a área de envio para reabrir seu resumo.`
		},
		{
			question: 'Funciona com o Strava?',
			answer:
				'Sim. Solicite a exportação da sua conta nas configurações do Strava e envie o arquivo activities.csv.'
		},
		{
			question: 'É grátis?',
			answer: 'Sim. Sem cadastro nem anúncios, e o código é aberto no GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'No navegador de um computador (não no aplicativo), entre em',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Acesse Atividades → Todas as atividades' },
		{ text: `Role a página até carregar todas as atividades de ${TARGET_YEAR}` },
		{
			text: 'Clique em “Export CSV” (Exportar CSV), no canto superior direito. O arquivo é baixado na hora.'
		}
	],
	garminNote:
		'Não peça a exportação completa de dados da Garmin: ela leva dias e traz outro arquivo.',
	stravaSteps: [
		{
			text: 'No navegador de um computador (não no aplicativo), entre em',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{
			text: 'Em “Download or Delete Your Account” (Baixar ou excluir sua conta), clique em “Get Started” (Começar) e depois em “Request your archive” (Solicitar seu arquivo)'
		},
		{ text: 'Aguarde o e-mail com o link de download. Ele costuma chegar em poucas horas.' },
		{ text: 'Descompacte o arquivo e envie activities.csv' }
	],
	stravaNote:
		'O Strava deve estar configurado em inglês, espanhol, alemão, francês, italiano, holandês ou português.',
	heading: 'Perguntas',
	guidesAria: 'Escolha a origem dos seus dados'
};
