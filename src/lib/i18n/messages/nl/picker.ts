import type { picker as en } from '../en/picker.js';
export const picker: typeof en = {
	language: 'Taal',
	languageButton: (code: string, name: string) => `${code}, taal: ${name}`,
	prompt: 'Bekijk in het Nederlands',
	dismiss: 'Taalsuggestie sluiten'
};
