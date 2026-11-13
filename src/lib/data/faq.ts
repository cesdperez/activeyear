import type { Locale } from '#lib/types/index.js';
import { faq as en } from '#lib/i18n/messages/en/faq.js';
import { faq as es } from '#lib/i18n/messages/es/faq.js';
import { faq as pt } from '#lib/i18n/messages/pt/faq.js';
import { faq as fr } from '#lib/i18n/messages/fr/faq.js';
import { faq as de } from '#lib/i18n/messages/de/faq.js';
import { faq as nl } from '#lib/i18n/messages/nl/faq.js';

export const faqMessages: Record<Locale, typeof en> = { en, es, pt, fr, de, nl };
export const faqItems = (locale: Locale) => faqMessages[locale].items;
