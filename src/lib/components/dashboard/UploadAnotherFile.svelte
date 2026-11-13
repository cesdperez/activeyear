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

<div class="mt-24 text-center">
	<button
		class="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 enabled:hover:bg-[var(--color-surface-elevated)] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
		disabled={appStore.isExporting}
		onclick={uploadAnother}
	>
		<ArrowCounterClockwise
			class="h-4 w-4 transition-transform duration-500 group-enabled:group-hover:-rotate-180"
			weight="bold"
			aria-hidden="true"
		/>
		{i18n.m.dashboard.uploadDifferentFile}
	</button>
</div>
