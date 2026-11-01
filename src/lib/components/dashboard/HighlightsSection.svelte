<script lang="ts">
	import type { Activity, Unit } from '#lib/types/index.js';
	import { Star } from 'phosphor-svelte';
	import SectionHeading from './SectionHeading.svelte';
	import HighlightItem from './HighlightItem.svelte';

	let { highlights, unit }: { highlights: Activity[]; unit: Unit } = $props();
</script>

<section class="mb-16">
	<SectionHeading title="Highlights" />

	{#if highlights.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each highlights as activity, i (i)}
				<HighlightItem {activity} {unit} delay={450 + i * 50} />
			{/each}
		</div>
	{:else}
		<div
			class="stat-card flex flex-col items-center justify-center p-8 text-center"
			style="animation-delay: 450ms"
		>
			<div
				class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)]/10"
			>
				<Star class="h-10 w-10 text-yellow-500" weight="fill" aria-hidden="true" />
			</div>
			<p class="mb-4 text-lg text-[var(--color-text-muted)]">No highlights yet</p>
			<p class="max-w-md text-sm text-[var(--color-text-muted)]">
				Mark activities as favorites in Garmin Connect by tapping the star icon on any activity,
				then re-export your data to see them here.
			</p>
		</div>
	{/if}
</section>
