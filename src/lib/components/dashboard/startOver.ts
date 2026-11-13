import { tick } from 'svelte';
import { uploadStore } from '#lib/stores/upload.svelte.js';
import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';

export async function startOver() {
	uploadStore.reset();
	await tick();
	window.scrollTo({ top: 0, behavior: 'instant' });
	document.getElementById(UPLOAD_ZONE_ID)?.focus();
}
