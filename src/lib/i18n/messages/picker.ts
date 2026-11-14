import type { Locale } from '#lib/types/index.js';
import { picker as en } from './en/picker.js';
import { picker as es } from './es/picker.js';
import { picker as pt } from './pt/picker.js';
import { picker as fr } from './fr/picker.js';
import { picker as de } from './de/picker.js';
import { picker as nl } from './nl/picker.js';

export const PICKERS: Record<Locale, typeof en> = { en, es, pt, fr, de, nl };
