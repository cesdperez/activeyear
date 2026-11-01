<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
</script>

<div class="mt-24 text-center">
	<button
		class="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-zinc-400 transition-all duration-300 hover:bg-[var(--color-surface-elevated)] hover:text-white"
		onclick={() => appStore.reset()}
	>
		<span class="transition-transform duration-500 group-hover:-rotate-180">↺</span>
		Upload different file
	</button>
</div>
