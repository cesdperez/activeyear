<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
</script>

<div class="mt-24 text-center">
	<button
		class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-[var(--color-surface-elevated)] transition-all duration-300 group"
		onclick={() => appStore.reset()}
	>
		<span class="group-hover:-rotate-180 transition-transform duration-500"
			>↺</span
		>
		Upload different file
	</button>
</div>
