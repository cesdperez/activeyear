<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
</script>

<div class="flex p-1 bg-[var(--color-surface-elevated)] rounded-lg self-start">
	<button
		class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 {appStore.breakdownMetric ===
		'count'
			? 'bg-[var(--color-accent)] text-black'
			: 'text-zinc-500 hover:text-zinc-300'}"
		onclick={() => (appStore.breakdownMetric = "count")}
	>
		Activities
	</button>
	<button
		class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 {appStore.breakdownMetric ===
		'duration'
			? 'bg-[var(--color-accent)] text-black'
			: 'text-zinc-500 hover:text-zinc-300'}"
		onclick={() => (appStore.breakdownMetric = "duration")}
	>
		Time
	</button>
</div>
