<script lang="ts">
	import { ArrowLeft } from 'phosphor-svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { startOver } from './startOver.js';
</script>

<button
	type="button"
	aria-label={i18n.m.dashboard.backToStart}
	title={i18n.m.dashboard.backToStart}
	disabled={appStore.isExporting}
	onclick={startOver}
	class="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-[var(--radius-control)] text-sm text-[var(--color-text-dim)] transition-colors duration-150 hover:text-[var(--color-text-primary)] disabled:opacity-50"
>
	<ArrowLeft class="h-5 w-5" aria-hidden="true" />
	<span class="hidden sm:inline">{i18n.m.dashboard.backToStart}</span>
</button>
