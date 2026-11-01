<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
</script>

<div class="flex self-start rounded-lg bg-[var(--color-surface-elevated)] p-1">
	<button
		class="rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 {appStore.breakdownMetric ===
		'count'
			? 'bg-[var(--color-accent)] text-black'
			: 'text-zinc-500 hover:text-zinc-300'}"
		onclick={() => (appStore.breakdownMetric = 'count')}
	>
		Activities
	</button>
	<button
		class="rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 {appStore.breakdownMetric ===
		'duration'
			? 'bg-[var(--color-accent)] text-black'
			: 'text-zinc-500 hover:text-zinc-300'}"
		onclick={() => (appStore.breakdownMetric = 'duration')}
	>
		Time
	</button>
</div>
