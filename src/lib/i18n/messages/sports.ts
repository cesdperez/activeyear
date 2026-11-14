import type { Locale } from '#lib/types/index.js';
import { sports as en } from './en/sports.js';
import { sports as es } from './es/sports.js';
import { sports as pt } from './pt/sports.js';
import { sports as fr } from './fr/sports.js';
import { sports as de } from './de/sports.js';
import { sports as nl } from './nl/sports.js';

export const SPORT_NAMES: Record<Locale, typeof en> = { en, es, pt, fr, de, nl };
