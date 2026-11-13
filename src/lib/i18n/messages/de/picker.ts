import type { picker as en } from '../en/picker.js';
export const picker: typeof en = {
	language: 'Sprache',
	languageButton: (code: string, name: string) => `${code}, Sprache: ${name}`,
	prompt: 'Auf Deutsch ansehen',
	dismiss: 'Sprachvorschlag schließen'
};
