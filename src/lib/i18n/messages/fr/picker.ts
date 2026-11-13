import type { picker as en } from '../en/picker.js';
export const picker: typeof en = {
	language: 'Langue',
	languageButton: (code: string, name: string) => `${code}, langue : ${name}`,
	prompt: 'Voir en français',
	dismiss: 'Fermer la suggestion de langue'
};
