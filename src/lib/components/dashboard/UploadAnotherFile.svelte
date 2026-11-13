<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { startOver } from './startOver.js';
	import { ArrowCounterClockwise } from 'phosphor-svelte';
</script>

<button class="btn-secondary w-full" disabled={appStore.isExporting} onclick={startOver}>
	<ArrowCounterClockwise class="h-4 w-4" weight="bold" aria-hidden="true" />
	{i18n.m.dashboard.uploadDifferentFile}
</button>
