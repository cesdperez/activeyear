<script lang="ts">
	import { Star, Plus, Check } from 'phosphor-svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { HIGHLIGHT_PRESETS } from '#lib/constants/highlights.js';
	import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
	import { sportNames } from '#lib/constants/sports.js';
	import { formatDistance, formatDuration, formatShortDate } from '#lib/utils/format.js';
	import type { Activity } from '#lib/types/index.js';
	import SectionHeading from './SectionHeading.svelte';
	import HighlightItem from './HighlightItem.svelte';

	let query = $state('');
	let announcement = $state('');
	let results = $derived(query.trim() ? appStore.searchActivities(query) : []);
	let caption = $derived(
		appStore.highlightPreset === 'custom'
			? 'Your own picks.'
			: HIGHLIGHT_PRESETS[appStore.highlightPreset].description
	);

	function titleOf(activity: Activity) {
		return activity.title || sportNames[activity.type] || 'Activity';
	}

	function toggle(activity: Activity) {
		const selected = appStore.isHighlight(activity);
		if (selected) appStore.removeHighlight(activity);
		else appStore.addHighlight(activity);
		announcement = `${selected ? 'Removed' : 'Added'} ${titleOf(activity)}`;
	}
</script>

<section class="mb-16">
	<SectionHeading title="Highlights" class="mb-2" />
	<p class="mb-4 text-sm text-[var(--color-text-muted)]">{caption}</p>
	<div
		role="group"
		aria-label="Highlight presets"
		class="mb-4 flex flex-wrap gap-1 rounded-lg bg-[var(--color-surface-elevated)] p-1"
	>
		{#each appStore.highlightPresets as preset (preset)}
			{@const pressed = appStore.highlightPreset === preset}
			<button
				class="rounded-md px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 {pressed
					? 'bg-[var(--color-accent)] text-black'
					: 'text-[var(--color-text-dim)] enabled:hover:text-white'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
				aria-pressed={pressed}
				disabled={appStore.isExporting}
				onclick={() => appStore.applyHighlightPreset(preset)}
				>{HIGHLIGHT_PRESETS[preset].label}</button
			>
		{/each}
	</div>
	<div class="mb-8">
		<label for="highlight-search" class="sr-only">Search your activities</label>
		<input
			id="highlight-search"
			type="search"
			placeholder="Search by title, sport, month or distance"
			bind:value={query}
			oninput={() => (announcement = '')}
			onkeydown={(event) => {
				if (event.key === 'Escape') {
					query = '';
					announcement = '';
				}
			}}
			disabled={appStore.isExporting}
			class="w-full rounded-lg bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50"
		/>
		<div class="sr-only" aria-live="polite">
			{announcement ||
				(query.trim() ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : '')}
		</div>
		{#if query.trim()}
			{#if !appStore.canAddHighlight}<p class="mt-2 text-sm text-[var(--color-text-muted)]">
					{HIGHLIGHTS_LIMIT} highlights max. Remove one to add another.
				</p>{/if}
			{#if results.length}
				<ul class="mt-2 space-y-1">
					{#each results as activity (activity)}
						{@const selected = appStore.isHighlight(activity)}
						<li>
							<button
								class="flex w-full items-center gap-3 rounded-lg bg-[var(--color-surface-elevated)] p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50"
								aria-pressed={selected}
								disabled={appStore.isExporting || (!selected && !appStore.canAddHighlight)}
								onclick={() => toggle(activity)}
								><span class="min-w-0 flex-1"
									><span class="block font-bold wrap-anywhere">{titleOf(activity)}</span><span
										class="block text-sm text-[var(--color-text-muted)]"
										>{formatShortDate(new Date(activity.date))} · {#if activity.distance > 0}{formatDistance(
												activity.distance,
												appStore.unit
											)} ·
										{/if}{formatDuration(activity.duration)} · {sportNames[activity.type] ||
											activity.type}</span
									></span
								>{#if selected}<Check
										class="h-5 w-5 shrink-0 text-[var(--color-accent)]"
										aria-hidden="true"
									/>{:else}<Plus
										class="h-5 w-5 shrink-0 text-[var(--color-accent)]"
										aria-hidden="true"
									/>{/if}</button
							>
						</li>
					{/each}
				</ul>
			{:else}<p class="mt-2 text-sm text-[var(--color-text-muted)]">No activities match</p>{/if}
		{/if}
	</div>
	{#if appStore.highlights.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each appStore.highlights as activity, i (i)}<HighlightItem
					{activity}
					unit={appStore.unit}
					delay={450 + i * 50}
				/>{/each}
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
			<p class="max-w-md text-sm text-balance text-[var(--color-text-muted)]">
				No highlights picked. Pick a preset or search your activities.
			</p>
		</div>
	{/if}
</section>
