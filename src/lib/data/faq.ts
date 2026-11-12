import { TARGET_YEAR } from '#lib/constants/time.js';
import type { FaqItem } from '#lib/types/index.js';

export const FAQ: FaqItem[] = [
	{
		question: 'What is this?',
		answer: `A free ${TARGET_YEAR} year in review for Garmin athletes. Upload your activity export and see your year in sport: total distance, elevation, time and calories, a breakdown by sport, personal records, highlights and your longest streak.`
	},
	{
		question: 'Is my data private?',
		answer:
			'Yes. The file is read and analysed on your device. Nothing is uploaded, and there is no account to create.'
	},
	{
		question: 'Which file does it need?',
		answer:
			'The Activities CSV exported from Garmin Connect in English. It covers running, cycling, swimming, walking, hiking, strength, yoga, paddling, rowing and cardio.'
	},
	{
		question: 'What can I share?',
		answer:
			'Three story-sized cards (1080 × 1920 PNG): a summary, a sport breakdown and your highlights, in Neon, Minimal or Retro style.'
	},
	{
		question: 'Does it work with Strava?',
		answer: 'Not yet. Only Garmin Connect exports are supported.'
	},
	{
		question: 'Is it free?',
		answer: 'Yes. No sign-up, no ads, and the code is open source on GitHub.'
	}
];
