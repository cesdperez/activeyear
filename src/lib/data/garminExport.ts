import { faqMessages } from '#lib/data/faq.js';
import type { Locale } from '#lib/types/index.js';

export const garminExportSteps = (locale: Locale) => faqMessages[locale].garminSteps;
export const garminExportNote = (locale: Locale) => faqMessages[locale].garminNote;
