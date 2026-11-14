<script lang="ts">
	import { tick } from 'svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { Plus, Check } from 'phosphor-svelte';
	import { highlightsStore } from '#lib/stores/highlights.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
	import {
		activityTitle,
		formatCount,
		formatDistance,
		formatDuration,
		formatShortDate
	} from '#lib/utils/format.js';
	import type { Activity } from '#lib/types/index.js';
	import SectionHeading from './SectionHeading.svelte';
	import HighlightItem from './HighlightItem.svelte';

	let query = $state('');
	let open = $state(false);
	let announcement = $state('');
	// Survives edits that turn the preset into 'custom', so the climbs stay visible while tweaking.
	let rankedByClimb = $state(highlightsStore.highlightPreset === 'climbs');
	let searchInput = $state<HTMLInputElement>();
	let searchWrapper = $state<HTMLDivElement>();
	let list = $state<HTMLOListElement>();
	let search = $derived(
		query.trim() ? highlightsStore.searchActivities(query) : { matches: [], total: 0 }
	);
	let capped = $derived(search.total > search.matches.length);
	let caption = $derived(
		highlightsStore.highlightPreset === 'custom'
			? i18n.m.dashboard.customPicks
			: i18n.m.dashboard.presets[highlightsStore.highlightPreset].description
	);
	let resultsSummary = $derived(
		capped
			? i18n.m.dashboard.searchResultsCapped(
					formatCount(i18n.locale, search.matches.length),
					formatCount(i18n.locale, search.total)
				)
			: i18n.m.dashboard.searchResults(search.total)
	);
	let limitMessage = $derived(i18n.m.dashboard.highlightLimit(HIGHLIGHTS_LIMIT));
	let searchAnnouncement = $derived(
		[resultsSummary, highlightsStore.canAddHighlight ? '' : limitMessage].filter(Boolean).join(' ')
	);

	function resultDetails(activity: Activity): string {
		return [
			formatShortDate(i18n.locale, new Date(activity.date)),
			activity.distance > 0 && formatDistance(i18n.locale, activity.distance, exportSettings.unit),
			formatDuration(i18n.locale, activity.duration),
			i18n.m.common.sports[activity.type] || activity.type
		]
			.filter(Boolean)
			.join(', ');
	}

	function toggle(activity: Activity) {
		const selected = highlightsStore.isHighlight(activity);
		if (!selected && !highlightsStore.canAddHighlight) {
			announcement = limitMessage;
			return;
		}
		if (selected) highlightsStore.removeHighlight(activity);
		else highlightsStore.addHighlight(activity);
		announcement = selected
			? i18n.m.dashboard.removedHighlight(activityTitle(i18n.locale, activity))
			: i18n.m.dashboard.addedHighlight(activityTitle(i18n.locale, activity));
	}

	async function remove(activity: Activity, index: number) {
		highlightsStore.removeHighlight(activity);
		announcement = i18n.m.dashboard.removedHighlight(activityTitle(i18n.locale, activity));
		await tick();
		const next = list?.querySelectorAll<HTMLButtonElement>('button.remove')[index];
		(next ?? searchInput)?.focus();
	}
</script>

<svelte:document
	onpointerdown={(event) => {
		if (!searchWrapper?.contains(event.target as Node)) open = false;
	}}
/>

<section class="mb-20 md:mb-28">
	<SectionHeading title={i18n.m.dashboard.highlights} class="mb-2" />
	<p class="mb-6 text-[var(--color-text-muted)]">{caption}</p>
	<div class="mb-6 grid gap-3 lg:grid-cols-[auto_minmax(16rem,1fr)] lg:items-start">
		<div
			data-section-lead
			role="group"
			aria-label={i18n.m.dashboard.highlightPresets}
			class="segmented lg:mt-[1.625rem]"
		>
			{#each highlightsStore.highlightPresets as preset (preset)}
				<button
					aria-pressed={highlightsStore.highlightPreset === preset}
					disabled={exportLock.isExporting}
					onclick={() => {
						highlightsStore.applyHighlightPreset(preset);
						rankedByClimb = preset === 'climbs';
					}}>{i18n.m.dashboard.presets[preset].label}</button
				>
			{/each}
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative"
			bind:this={searchWrapper}
			onfocusout={(event) => {
				// WebKit reports no related target when a click moves focus from the input to a button.
				if (event.relatedTarget instanceof Element && !searchWrapper?.contains(event.relatedTarget))
					open = false;
			}}
			onkeydown={(event) => {
				if (event.key === 'Escape') {
					query = '';
					announcement = '';
					if (document.activeElement !== searchInput) searchInput?.focus();
				}
			}}
		>
			<div class="relative">
				<label for="highlight-search" class="mb-1.5 block text-sm font-medium"
					>{i18n.m.dashboard.addActivity}</label
				>
				<input
					data-section-lead
					id="highlight-search"
					type="search"
					aria-describedby={highlightsStore.canAddHighlight
						? 'highlight-search-hint'
						: 'highlight-search-hint highlight-search-limit'}
					bind:this={searchInput}
					bind:value={query}
					onfocus={() => (open = true)}
					oninput={() => {
						open = true;
						announcement = '';
					}}
					disabled={exportLock.isExporting}
					class="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-input-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-base text-[var(--color-text-primary)] focus-visible:border-[var(--color-accent)] disabled:opacity-50 pointer-coarse:h-[3.125rem]"
				/>
				{#if open && query.trim()}
					<div
						class="panel absolute top-full right-0 left-0 z-20 mt-2 max-h-[min(28rem,60vh)] overflow-y-auto shadow-xl"
					>
						{#if search.matches.length}
							<ul class="divide-y divide-[var(--color-border)]">
								{#each search.matches as activity (activity)}
									{@const selected = highlightsStore.isHighlight(activity)}
									{@const unavailable = !selected && !highlightsStore.canAddHighlight}
									<li>
										<button
											class="flex w-full items-center gap-3 px-4 py-3 text-left enabled:hover:bg-[var(--color-surface-hover)] disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:hover:bg-transparent {selected
												? 'bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]'
												: ''}"
											aria-pressed={selected}
											aria-disabled={unavailable || undefined}
											disabled={exportLock.isExporting}
											onclick={() => toggle(activity)}
											><span class="min-w-0 flex-1"
												><span class="block font-semibold wrap-anywhere"
													>{activityTitle(i18n.locale, activity)}</span
												><span class="block text-sm text-[var(--color-text-muted)]"
													>{resultDetails(activity)}</span
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
							{#if capped}<p class="px-4 py-2 text-sm text-[var(--color-text-muted)]">
									{resultsSummary}
								</p>{/if}
						{:else}<p class="px-4 py-3 text-sm text-[var(--color-text-muted)]">
								{i18n.m.dashboard.noSearchMatches}
							</p>{/if}
						<div
							class="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2"
						>
							<span class="text-sm text-[var(--color-text-muted)]"
								>{i18n.m.dashboard.pickedCount(
									highlightsStore.highlights.length,
									HIGHLIGHTS_LIMIT
								)}</span
							>
							<button
								class="btn-secondary min-h-11 px-4 text-[var(--color-accent)]"
								disabled={exportLock.isExporting}
								onclick={() => {
									query = '';
									open = false;
									searchInput?.focus();
								}}>{i18n.m.dashboard.searchDone}</button
							>
						</div>
					</div>
				{/if}
			</div>
			<p id="highlight-search-hint" class="mt-2 text-sm text-[var(--color-text-muted)]">
				{i18n.m.dashboard.searchHint}
			</p>
			<div class="sr-only" aria-live="polite">
				{announcement || (query.trim() ? searchAnnouncement : '')}
			</div>
			{#if !highlightsStore.canAddHighlight}<p
					id="highlight-search-limit"
					class="mt-2 text-sm text-[var(--color-text-muted)]"
				>
					{limitMessage}
				</p>{/if}
		</div>
	</div>
	{#if highlightsStore.highlights.length > 0}
		<ol class="border-b border-[var(--color-border)]" bind:this={list}>
			{#each highlightsStore.highlights as activity, i (activity)}<HighlightItem
					{activity}
					unit={exportSettings.unit}
					showElevation={rankedByClimb}
					onremove={() => remove(activity, i)}
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
