import { ROUTED_LOCALES } from '#lib/constants/locales.js';

export const csr = false;
// Cloudflare Pages serves the nearest 404.html up the path, so /de/anything gets /de/404.html.
export const entries = () => [{}, ...ROUTED_LOCALES.map((lang) => ({ lang }))];
