import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Wat is dit?',
			answer: `Een gratis jaaroverzicht van ${TARGET_YEAR} voor Garmin en Strava. Upload je activiteitenexport om je afstand, hoogtemeters, tijd, sporten, records en langste reeks te bekijken.`
		},
		{
			question: 'Zijn mijn gegevens privé?',
			answer:
				'Ja. Je bestand wordt op je apparaat gelezen en verlaat het nooit. Geen account, cookies of tracking. We tellen alleen enkele anonieme gebeurtenissen, zoals welk thema je exporteert, om de app te verbeteren.'
		},
		{
			question: 'Welk bestand heb ik nodig?',
			answer: `De Activities-CSV van Garmin Connect of activities.csv uit je Strava-export. Upload je een Garmin-bestand, dan kies je daarna de eenheden van je account: ${upload.metric} of ${upload.imperial}.`
		},
		{
			question: 'Wat kan ik delen?',
			answer:
				'Drie kaarten op storyformaat: een samenvatting, je sporten en je hoogtepunten, in zes stijlen: Neon, Minimal, Retro, Classic, Synthwave en Lightmile.'
		},
		{
			question: 'Kan ik mijn overzicht later opnieuw openen?',
			answer: `Ja. Gebruik ${dashboard.saveMyYear} op je dashboard om een klein .json-bestand te downloaden. Sleep het naar het uploadvak om je overzicht opnieuw te openen.`
		},
		{
			question: 'Werkt het met Strava?',
			answer:
				'Ja. Vraag je accountgegevens op in de Strava-instellingen en upload daarna activities.csv.'
		},
		{
			question: 'Is het gratis?',
			answer: 'Ja. Zonder registratie of advertenties, en de code is open source op GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'Open een browser op een computer (niet de app) en log in op',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Ga naar Activiteiten → Alle activiteiten' },
		{ text: `Scroll naar beneden totdat alle activiteiten van ${TARGET_YEAR} zijn geladen` },
		{
			text: 'Klik rechtsboven op “Export CSV” (CSV exporteren). Het bestand wordt meteen gedownload.'
		}
	],
	garminNote:
		'De volledige gegevensexport van Garmin heb je niet nodig: die duurt dagen en bevat een ander bestand.',
	stravaSteps: [
		{
			text: 'Open een browser op een computer (niet de app) en log in op',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{
			text: 'Klik onder “Download or Delete Your Account” (Je account downloaden of verwijderen) op “Get Started” (Aan de slag) en daarna op “Request your archive” (Je archief aanvragen)'
		},
		{ text: 'Wacht op de e-mail met de downloadlink. Die komt meestal binnen een paar uur.' },
		{ text: 'Pak het bestand uit en upload activities.csv' }
	],
	stravaNote:
		'Stel de taal van Strava in op Engels, Spaans, Duits, Frans, Italiaans, Nederlands of Portugees.',
	heading: 'Vragen',
	guidesAria: 'Kies je gegevensbron'
};
