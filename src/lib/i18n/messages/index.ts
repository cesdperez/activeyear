import type { Locale } from '#lib/types/index.js';
import { en } from './en/index.js';
import { es } from './es/index.js';
import { pt } from './pt/index.js';
import { fr } from './fr/index.js';
import { de } from './de/index.js';
import { nl } from './nl/index.js';
export type Messages = typeof en;
export const MESSAGES: Record<Locale, Messages> = { en, es, pt, fr, de, nl };
