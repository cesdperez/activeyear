<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';

	let { activityCount, activeDays }: { activityCount: number; activeDays: number } = $props();
	import { ArrowDown } from 'phosphor-svelte';
</script>

<header class="mb-16 text-center md:mb-24">
	<h1 class="glow-text mb-6 text-5xl font-bold tracking-tight md:text-7xl">
		Your {TARGET_YEAR}
	</h1>
	<div
		data-testid="activity-summary"
		class="inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.05)] bg-[var(--color-surface-elevated)] px-4 py-2"
	>
		<span class="font-mono font-bold text-[var(--color-accent)]">{activityCount}</span>
		<span class="text-[var(--color-text-muted)]">activities across</span>
		<span class="font-mono font-bold text-[var(--color-accent)]">{activeDays}</span>
		<span class="text-[var(--color-text-muted)]">active days</span>
	</div>

	<div class="mt-8">
		<button
			class="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] transition-colors duration-200 hover:text-white"
			onclick={() => {
				document.getElementById('export-panel')?.scrollIntoView({ behavior: 'smooth' });
			}}
		>
			<span>Jump to Export</span>
			<ArrowDown class="h-4 w-4 transition-transform group-hover:translate-y-1" />
		</button>
	</div>
</header>
