<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { tick } from 'svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';
	import { ArrowCounterClockwise } from 'phosphor-svelte';

	async function uploadAnother() {
		appStore.reset();
		await tick();
		document.getElementById(UPLOAD_ZONE_ID)?.focus();
	}
</script>

<button class="btn-secondary w-full" disabled={appStore.isExporting} onclick={uploadAnother}>
	<ArrowCounterClockwise class="h-4 w-4" weight="bold" aria-hidden="true" />
	{i18n.m.dashboard.uploadDifferentFile}
</button>
