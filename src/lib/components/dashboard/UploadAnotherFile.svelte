<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { leaveDashboard } from './startOver.js';
	import { ArrowCounterClockwise } from 'phosphor-svelte';
</script>

<button class="btn-secondary w-full" disabled={exportLock.isExporting} onclick={leaveDashboard}>
	<ArrowCounterClockwise class="h-4 w-4" weight="bold" aria-hidden="true" />
	{i18n.m.dashboard.uploadDifferentFile}
</button>
