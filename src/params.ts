import { defineParams } from '@sveltejs/kit/params';
export const params = defineParams({
	locale: (param: string) => (['es', 'pt', 'fr', 'de', 'nl'].includes(param) ? param : undefined)
});
