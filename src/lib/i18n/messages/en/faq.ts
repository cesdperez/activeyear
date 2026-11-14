import { TARGET_YEAR } from '#lib/constants/time.js';
import { dashboard } from './dashboard.js';
import { upload } from './upload.js';

export const faq = {
	items: [
		{
			question: 'What is this?',
			answer: `A free ${TARGET_YEAR} year in review for Garmin and Strava. Upload your activity export to see your distance, elevation, time, sports, records and longest streak.`
		},
		{
			question: 'Is my data private?',
			answer:
				'Yes. Your file is read on your device and never leaves it. No account, no cookies, no tracking. We only count a few anonymous events, like which theme you export, to improve the app.'
		},
		{
			question: 'Which file does it need?',
			answer: `The Activities CSV from Garmin Connect, or activities.csv from your Strava export. If your Garmin account uses imperial units, choose ${upload.imperial} on the upload screen.`
		},
		{
			question: 'What can I share?',
			answer:
				'Three story-sized cards (a summary, your sports and your highlights) in six styles: Neon, Minimal, Retro, Classic, Synthwave and Lightmile.'
		},
		{
			question: 'Can I reopen my recap later?',
			answer: `Yes. Use ${dashboard.saveMyYear} on your dashboard to download a small .json file. Drop it on the upload area to reopen your recap.`
		},
		{
			question: 'Does it work with Strava?',
			answer: 'Yes. Request your account export in Strava settings, then upload its activities.csv.'
		},
		{
			question: 'Is it free?',
			answer: 'Yes. No sign-up, no ads, and the code is open source on GitHub.'
		}
	],
	garminSteps: [
		{
			text: 'In a browser on a computer (not the app), log in at',
			link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' }
		},
		{ text: 'Go to Activities → All Activities' },
		{ text: `Scroll down until all ${TARGET_YEAR} activities are loaded` },
		{ text: 'Click Export CSV (top right). The file downloads right away.' }
	],
	garminNote: "Skip Garmin's full data export, which takes days and holds a different file.",
	stravaSteps: [
		{
			text: 'In a browser on a computer (not the app), log in at',
			link: { href: 'https://www.strava.com/account', label: 'strava.com' }
		},
		{ text: 'Under Download or Delete Your Account, click Get Started, then Request your archive' },
		{ text: 'Wait for the email with the download link. It usually arrives within a few hours.' },
		{ text: 'Unzip it and upload activities.csv' }
	],
	stravaNote:
		'Strava must be set to English, Spanish, German, French, Italian, Dutch or Portuguese.',
	heading: 'Questions',
	guidesAria: 'Choose your data source'
};
