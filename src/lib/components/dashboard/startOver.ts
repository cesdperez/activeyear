import { tick } from 'svelte';
import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';
import { uploadStore } from '#lib/stores/upload.svelte.js';
import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';

// True while the current history entry is the one pushed over the start screen, so Back lands there.
let entryOverStart = false;

export async function startOver() {
	entryOverStart = false;
	uploadStore.reset();
	await tick();
	window.scrollTo({ top: 0, behavior: 'instant' });
	document.getElementById(UPLOAD_ZONE_ID)?.focus();
}

/** Gives the dashboard its own history entry so browser Back returns to the start screen. */
export function pushDashboardEntry() {
	if (page.state.dashboard) return;
	pushState('', { dashboard: true });
	entryOverStart = true;
}

/** Marks a page reached by switching language as a dashboard entry. */
export function markDashboardEntry() {
	replaceState('', { dashboard: true });
	entryOverStart = false;
}

export function leaveDashboard() {
	if (entryOverStart) {
		history.back();
		return;
	}
	replaceState('', {});
	void startOver();
}
