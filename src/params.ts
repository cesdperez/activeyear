import { ROUTED_LOCALES } from './lib/constants/locales.ts';
import { defineParams } from '@sveltejs/kit/params';
export const params = defineParams({
	locale: (param: string) =>
		(ROUTED_LOCALES as readonly string[]).includes(param) ? param : undefined
});
