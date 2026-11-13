import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';

export const faq = {
	items: [
		{
			question: 'What is this?',
			answer: `A free ${TARGET_YEAR} year in review for Garmin and Strava athletes. Upload your activity export and see your year in sport: total distance, elevation, time and calories, a breakdown by sport, personal records, highlights and your longest streak.`
		},
		{
			question: 'Is my data private?',
			answer:
				'Yes. The file is read and analysed on your device, and there is no account to create. We record a few anonymous counts (like which theme you export and whether uploads work) to improve the app. No cookies, no tracking, and your activity data never leaves your device.'
		},
		{
			question: 'Which file does it need?',
			answer: `The Activities CSV from Garmin Connect or activities.csv from your Strava account export, in English, Spanish, German, French, Italian, Dutch or Portuguese. If your Garmin account uses imperial units, choose ${upload.imperial} on the upload screen. It covers running, cycling, swimming, walking, hiking, strength, yoga, paddling, rowing, cardio, winter sports, racket sports and climbing.`
		},
		{
			question: 'What can I share?',
			answer:
				'Three story-sized cards (1080 × 1920 PNG): a summary, a sport breakdown and your highlights, in Neon, Minimal or Retro style.'
		},
		{
			question: 'Can I reopen my recap later?',
			answer: `Yes. Use ${dashboard.saveMyYear} on your dashboard to download a small .json file, then drop it on the upload area any time to reopen the recap. It stays on your device.`
		},
		{
			question: 'Does it work with Strava?',
			answer:
				'Yes. Upload activities.csv from your Strava account export (Settings, My Account, Download or Delete Your Account), with Strava set to English, Spanish, German, French, Italian, Dutch or Portuguese.'
		},
		{
			question: 'Is it free?',
			answer: 'Yes. No sign-up, no ads, and the code is open source on GitHub.',
			tip: { text: 'If you enjoy it, tips are welcome:', label: 'buy me a gel on Ko-fi' }
		}
	],
	garminSteps: [
		{
			text: 'Log in at',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Go to Activities → All Activities' },
		{ text: `Scroll down until all ${TARGET_YEAR} activities are loaded` },
		{ text: 'Click Export CSV (top-right icon)' }
	],
	garminNote: "Use the website on a computer. The Garmin Connect app can't export.",
	stravaSteps: [
		{ text: 'Log in at', link: { href: 'https://www.strava.com/account', label: 'strava.com' } },
		{ text: 'Go to Settings → My Account → Download or Delete Your Account' },
		{ text: 'Click Request your archive' },
		{ text: 'Open the download link Strava emails you and unzip it' },
		{ text: 'Upload activities.csv' }
	],
	stravaNote:
		'Upload only activities.csv. Strava must be set to English, Spanish, German, French, Italian, Dutch or Portuguese.',
	heading: 'Questions',
	guidesAria: 'Choose your data source'
};
