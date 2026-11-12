import { TARGET_YEAR } from '#lib/constants/time.js';
import type { ExportStep } from '#lib/types/index.js';

export const GARMIN_EXPORT_STEPS: ExportStep[] = [
	{ text: 'Log in at', link: { href: 'https://connect.garmin.com', label: 'connect.garmin.com' } },
	{ text: 'Go to Activities → All Activities' },
	{ text: `Scroll down until all ${TARGET_YEAR} activities are loaded` },
	{ text: 'Click Export CSV (top-right icon)' }
];

export const GARMIN_EXPORT_NOTE =
	"Use the website on a computer. The Garmin Connect app can't export.";
