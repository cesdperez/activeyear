import { ROUTED_LOCALES } from '#lib/constants/locales.js';

export const trailingSlash = 'always';
export const entries = () => [{}, ...ROUTED_LOCALES.map((lang) => ({ lang }))];
