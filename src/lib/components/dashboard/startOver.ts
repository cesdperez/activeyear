import { tick } from 'svelte';
import { appStore } from '#lib/stores/app.svelte.js';
import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';

export async function startOver() {
	appStore.reset();
	await tick();
	window.scrollTo({ top: 0, behavior: 'instant' });
	document.getElementById(UPLOAD_ZONE_ID)?.focus();
}
