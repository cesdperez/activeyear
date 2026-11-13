import { TARGET_YEAR } from '#lib/constants/time.js';
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
			answer:
				'De Activities-CSV van Garmin Connect of activities.csv uit de export van je Strava-account, in het Engels. Het omvat hardlopen, fietsen, zwemmen, wandelen, hiken, krachttraining, yoga, peddelen, roeien, cardio, wintersport, racketsport en klimmen.'
		},
		{
			question: 'Wat kan ik delen?',
			answer:
				'Drie kaarten op storyformaat (1080 × 1920 PNG): een samenvatting, een verdeling per sport en je hoogtepunten, in Neon-, Minimal- of Retro-stijl.'
		},
		{
			question: 'Kan ik mijn overzicht later opnieuw openen?',
			answer:
				'Ja. Gebruik Mijn jaar opslaan op je dashboard om een klein .json-bestand te downloaden. Sleep het later naar het uploadvak om je overzicht opnieuw te openen. Het blijft op je apparaat.'
		},
		{
			question: 'Werkt het met Strava?',
			answer:
				'Ja. Upload activities.csv uit de export van je Strava-account (Settings, My Account, Download or Delete Your Account), met Strava ingesteld op Engels.'
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
		{ text: 'Ga naar Activities → All Activities' },
		{ text: `Scroll naar beneden totdat alle activiteiten van ${TARGET_YEAR} zijn geladen` },
		{ text: 'Klik op Export CSV (pictogram rechtsboven)' }
	],
	garminNote: 'Gebruik de website op een computer. De Garmin Connect-app kan niet exporteren.',
	stravaSteps: [
		{ text: 'Log in op', link: { href: 'https://www.strava.com/account', label: 'strava.com' } },
		{ text: 'Ga naar Settings → My Account → Download or Delete Your Account' },
		{ text: 'Klik op Request your archive' },
		{ text: 'Open de downloadlink die Strava je mailt en pak het bestand uit' },
		{ text: 'Upload activities.csv' }
	],
	stravaNote: 'Upload alleen activities.csv. De taal van Strava moet Engels zijn.',
	heading: 'Vragen',
	guidesAria: 'Kies je gegevensbron'
};
