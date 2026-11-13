<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { Plus, Check } from 'phosphor-svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
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
	let results = $derived(query.trim() ? appStore.searchActivities(query) : []);
	let caption = $derived(
		appStore.highlightPreset === 'custom'
			? i18n.m.dashboard.customPicks
			: i18n.m.dashboard.presets[appStore.highlightPreset].description
	);

	function toggle(activity: Activity) {
		const selected = appStore.isHighlight(activity);
		if (selected) appStore.removeHighlight(activity);
		else appStore.addHighlight(activity);
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
			{#each appStore.highlightPresets as preset (preset)}
				<button
					aria-pressed={appStore.highlightPreset === preset}
					disabled={appStore.isExporting}
					onclick={() => appStore.applyHighlightPreset(preset)}
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
				disabled={appStore.isExporting}
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
				{#if !appStore.canAddHighlight}<p class="mt-2 text-sm text-[var(--color-text-muted)]">
						{i18n.m.dashboard.highlightLimit(HIGHLIGHTS_LIMIT)}
					</p>{/if}
				{#if results.length}
					<ul class="panel mt-2 divide-y divide-[var(--color-border)] overflow-hidden">
						{#each results as activity (activity)}
							{@const selected = appStore.isHighlight(activity)}
							<li>
								<button
									class="flex w-full items-center gap-3 px-4 py-3 text-left enabled:hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
									aria-pressed={selected}
									disabled={appStore.isExporting || (!selected && !appStore.canAddHighlight)}
									onclick={() => toggle(activity)}
									><span class="min-w-0 flex-1"
										><span class="block font-semibold wrap-anywhere"
											>{activityTitle(i18n.locale, activity)}</span
										><span class="block text-sm text-[var(--color-text-muted)]"
											>{formatShortDate(i18n.locale, new Date(activity.date))}, {#if activity.distance > 0}{formatDistance(
													i18n.locale,
													activity.distance,
													appStore.unit
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
	{#if appStore.highlights.length > 0}
		<ol class="border-b border-[var(--color-border)]">
			{#each appStore.highlights as activity, i (i)}<HighlightItem
					{activity}
					unit={appStore.unit}
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
