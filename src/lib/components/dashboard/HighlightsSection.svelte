<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { Plus, Check } from 'phosphor-svelte';
	import { highlightsStore } from '#lib/stores/highlights.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
	import {
		activityTitle,
		formatDistance,
		formatDuration,
		formatShortDate
	} from '#lib/utils/format.js';
	import type { Activity } from '#lib/types/index.js';
	import SectionHeading from './SectionHeading.svelte';
	import HighlightItem from './HighlightItem.svelte';

	let query = $state('');
	let announcement = $state('');
	let results = $derived(query.trim() ? highlightsStore.searchActivities(query) : []);
	let caption = $derived(
		highlightsStore.highlightPreset === 'custom'
			? i18n.m.dashboard.customPicks
			: i18n.m.dashboard.presets[highlightsStore.highlightPreset].description
	);

	function toggle(activity: Activity) {
		const selected = highlightsStore.isHighlight(activity);
		if (selected) highlightsStore.removeHighlight(activity);
		else highlightsStore.addHighlight(activity);
		announcement = selected
			? i18n.m.dashboard.removedHighlight(activityTitle(i18n.locale, activity))
			: i18n.m.dashboard.addedHighlight(activityTitle(i18n.locale, activity));
	}
</script>

<section class="mb-20 md:mb-28">
	<SectionHeading title={i18n.m.dashboard.highlights} class="mb-2" />
	<p class="mb-6 text-[var(--color-text-muted)]">{caption}</p>
	<div class="mb-6 grid gap-3 lg:grid-cols-[auto_minmax(16rem,1fr)] lg:items-start">
		<div role="group" aria-label={i18n.m.dashboard.highlightPresets} class="segmented">
			{#each highlightsStore.highlightPresets as preset (preset)}
				<button
					aria-pressed={highlightsStore.highlightPreset === preset}
					disabled={exportLock.isExporting}
					onclick={() => highlightsStore.applyHighlightPreset(preset)}
					>{i18n.m.dashboard.presets[preset].label}</button
				>
			{/each}
		</div>
		<div class="relative">
			<label for="highlight-search" class="sr-only">{i18n.m.dashboard.searchActivities}</label>
			<input
				id="highlight-search"
				type="search"
				placeholder={i18n.m.dashboard.searchPlaceholder}
				aria-describedby="highlight-search-hint"
				bind:value={query}
				oninput={() => (announcement = '')}
				onkeydown={(event) => {
					if (event.key === 'Escape') {
						query = '';
						announcement = '';
					}
				}}
				disabled={exportLock.isExporting}
				class="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-dim)] focus-visible:border-[var(--color-accent)] disabled:opacity-50"
			/>
			<p
				id="highlight-search-hint"
				class="mt-2 text-sm text-[var(--color-text-muted)]"
				class:sr-only={query.trim()}
			>
				{i18n.m.dashboard.searchHint}
			</p>
			<div class="sr-only" aria-live="polite">
				{announcement || (query.trim() ? i18n.m.dashboard.searchResults(results.length) : '')}
			</div>
			{#if query.trim()}
				{#if !highlightsStore.canAddHighlight}<p
						class="mt-2 text-sm text-[var(--color-text-muted)]"
					>
						{i18n.m.dashboard.highlightLimit(HIGHLIGHTS_LIMIT)}
					</p>{/if}
				{#if results.length}
					<ul class="panel mt-2 divide-y divide-[var(--color-border)] overflow-hidden">
						{#each results as activity (activity)}
							{@const selected = highlightsStore.isHighlight(activity)}
							<li>
								<button
									class="flex w-full items-center gap-3 px-4 py-3 text-left enabled:hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
									aria-pressed={selected}
									disabled={exportLock.isExporting ||
										(!selected && !highlightsStore.canAddHighlight)}
									onclick={() => toggle(activity)}
									><span class="min-w-0 flex-1"
										><span class="block font-semibold wrap-anywhere"
											>{activityTitle(i18n.locale, activity)}</span
										><span class="block text-sm text-[var(--color-text-muted)]"
											>{formatShortDate(i18n.locale, new Date(activity.date))}, {#if activity.distance > 0}{formatDistance(
													i18n.locale,
													activity.distance,
													exportSettings.unit
												)},
											{/if}{formatDuration(i18n.locale, activity.duration)}, {i18n.m.common.sports[
												activity.type
											] || activity.type}</span
										></span
									>{#if selected}<Check
											class="h-5 w-5 shrink-0 text-[var(--color-accent)]"
											weight="bold"
											aria-hidden="true"
										/>{:else}<Plus
											class="h-5 w-5 shrink-0 text-[var(--color-text-muted)]"
											weight="bold"
											aria-hidden="true"
										/>{/if}</button
								>
							</li>
						{/each}
					</ul>
				{:else}<p class="mt-2 text-sm text-[var(--color-text-muted)]">
						{i18n.m.dashboard.noSearchMatches}
					</p>{/if}
			{/if}
		</div>
	</div>
	{#if highlightsStore.highlights.length > 0}
		<ol class="border-b border-[var(--color-border)]">
			{#each highlightsStore.highlights as activity, i (i)}<HighlightItem
					{activity}
					unit={exportSettings.unit}
				/>{/each}
		</ol>
	{:else}
		<p
			class="border-y border-[var(--color-border)] py-8 text-center text-[var(--color-text-muted)]"
		>
			{i18n.m.dashboard.noPicks}
		</p>
	{/if}
</section>
