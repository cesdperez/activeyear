import { MESSAGES } from './messages/index.js';
import { page } from '$app/state';
import { localeFromParam } from './locale.js';

export const i18n = {
	get locale() {
		return localeFromParam(page.params.lang);
	},
	get m() {
		return MESSAGES[this.locale];
	}
};
