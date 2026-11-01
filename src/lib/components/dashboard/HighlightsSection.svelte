<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { Star } from "phosphor-svelte";
	import SectionHeading from "./SectionHeading.svelte";
	import HighlightItem from "./HighlightItem.svelte";
</script>

<section class="mb-16">
	<SectionHeading title="Highlights" />

	{#if appStore.highlights.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each appStore.highlights as activity, i}
				<HighlightItem {activity} delay={450 + i * 50} />
			{/each}
		</div>
	{:else}
		<div
			class="stat-card p-8 flex flex-col items-center justify-center text-center"
			style="animation-delay: 450ms"
		>
			<div
				class="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-accent)]/10 mb-6"
			>
				<Star class="w-10 h-10 text-yellow-500" weight="fill" />
			</div>
			<p class="text-lg text-[var(--color-text-muted)] mb-4">
				No highlights yet
			</p>
			<p class="text-sm text-[var(--color-text-muted)] max-w-md">
				Mark activities as favorites in Garmin Connect by tapping
				the star icon on any activity, then re-export your data to
				see them here.
			</p>
		</div>
	{/if}
</section>
