import { faqMessages } from '#lib/data/faq.js';
import type { Locale } from '#lib/types/index.js';

export const stravaExportSteps = (locale: Locale) => faqMessages[locale].stravaSteps;
export const stravaExportNote = (locale: Locale) => faqMessages[locale].stravaNote;
