import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';
import type { faq as en } from '../en/faq.js';

export const faq: typeof en = {
	items: [
		{
			question: 'Wat is dit?',
			answer: `Een gratis jaaroverzicht van ${TARGET_YEAR} voor sporters op Garmin en Strava. Upload je activiteitenexport en bekijk je sportjaar: totale afstand, hoogtemeters, tijd en calorieën, een verdeling per sport, persoonlijke records, hoogtepunten en je langste reeks.`
		},
		{
			question: 'Zijn mijn gegevens privé?',
			answer:
				'Ja. Het bestand wordt op je apparaat gelezen en geanalyseerd en je hoeft geen account aan te maken. We registreren enkele anonieme tellingen, zoals welk thema je exporteert en of uploads werken, om de app te verbeteren. Geen cookies, geen tracking en je activiteitsgegevens verlaten je apparaat nooit.'
		},
		{
			question: 'Welk bestand heb ik nodig?',
			answer: `De Activities-CSV van Garmin Connect of activities.csv uit de export van je Strava-account, in het Engels, Spaans, Duits, Frans, Italiaans, Nederlands of Portugees. Gebruikt je Garmin-account imperiale eenheden, kies dan ${upload.imperial} op het uploadscherm. Het omvat hardlopen, fietsen, zwemmen, wandelen, hiken, krachttraining, yoga, peddelen, roeien, cardio, wintersport, racketsport en klimmen.`
		},
		{
			question: 'Wat kan ik delen?',
			answer:
				'Drie kaarten op storyformaat (1080 × 1920 PNG): een samenvatting, een verdeling per sport en je hoogtepunten, in zes stijlen: Neon, Minimal, Retro, Classic, Synthwave en Lightmile.'
		},
		{
			question: 'Kan ik mijn overzicht later opnieuw openen?',
			answer: `Ja. Gebruik ${dashboard.saveMyYear} op je dashboard om een klein .json-bestand te downloaden. Sleep het later naar het uploadvak om je overzicht opnieuw te openen. Het blijft op je apparaat.`
		},
		{
			question: 'Werkt het met Strava?',
			answer:
				'Ja. Upload activities.csv uit de export van je Strava-account. Die vraag je aan via “Settings” (Instellingen) → “My Account” (Mijn account) → “Download or Delete Your Account” (Je account downloaden of verwijderen). Strava moet op Engels, Spaans, Duits, Frans, Italiaans, Nederlands of Portugees staan.'
		},
		{
			question: 'Is het gratis?',
			answer: 'Ja. Zonder registratie of advertenties, en de code is open source op GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'Log in op',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Ga naar Activiteiten → Alle activiteiten' },
		{ text: `Scroll naar beneden totdat alle activiteiten van ${TARGET_YEAR} zijn geladen` },
		{
			text: 'Klik rechtsboven op “Export CSV” (CSV exporteren). Het bestand wordt meteen gedownload.'
		}
	],
	garminNote:
		'Gebruik de website op een computer: de app kan niet exporteren. De volledige gegevensexport van Garmin heb je niet nodig: die duurt dagen en bevat een ander bestand.',
	stravaSteps: [
		{ text: 'Log in op', link: { href: 'https://www.strava.com/account', label: 'strava.com' } },
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
