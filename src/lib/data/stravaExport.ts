import type { ExportStep } from '#lib/types/index.js';

export const STRAVA_EXPORT_STEPS: ExportStep[] = [
	{ text: 'Log in at', link: { href: 'https://www.strava.com/account', label: 'strava.com' } },
	{ text: 'Go to Settings → My Account → Download or Delete Your Account' },
	{ text: 'Click Request your archive' },
	{ text: 'Open the download link Strava emails you and unzip it' },
	{ text: 'Upload activities.csv' }
];

export const STRAVA_EXPORT_NOTE =
	'Upload only activities.csv. Your Strava language must be English.';
