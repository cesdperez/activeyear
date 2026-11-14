import { LOCALES } from '#lib/constants/locales.js';
import { loadMessages } from './index.js';

await Promise.all(LOCALES.map(loadMessages));
