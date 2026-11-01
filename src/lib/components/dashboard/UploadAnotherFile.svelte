<script lang="ts">
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
		class="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 hover:bg-[var(--color-surface-elevated)] hover:text-white"
		onclick={uploadAnother}
	>
		<ArrowCounterClockwise
			class="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180"
			weight="bold"
			aria-hidden="true"
		/>
		Upload different file
	</button>
</div>
