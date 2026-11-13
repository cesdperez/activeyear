import type { picker as en } from '../en/picker.js';
export const picker: typeof en = {
	language: 'Idioma',
	languageButton: (code: string, name: string) => `${code}, idioma: ${name}`,
	prompt: 'Ver en español',
	dismiss: 'Descartar sugerencia de idioma'
};
