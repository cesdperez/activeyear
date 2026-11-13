import { MESSAGES } from '#lib/i18n/messages/index.js';
import type { Locale } from '#lib/types/index.js';

export const faqItems = (locale: Locale) => MESSAGES[locale].faq.items;
