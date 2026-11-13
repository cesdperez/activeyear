<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { sportIcons } from '#lib/constants/sports.js';
	import {
		activityTitle,
		formatDistance,
		formatDuration,
		formatShortDate
	} from '#lib/utils/format.js';
	import type { Activity, Unit } from '#lib/types/index.js';
	import { X } from 'phosphor-svelte';
	import { highlightsStore } from '#lib/stores/highlights.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';

	let { activity, unit }: { activity: Activity; unit: Unit } = $props();

	const IconComponent = $derived(sportIcons[activity.type]);
</script>

<li class="highlight-row" data-testid="highlight-row">
	<span class="date stat-value">{formatShortDate(i18n.locale, new Date(activity.date))}</span>
	<span class="sport" title={i18n.m.common.sports[activity.type]}>
		<IconComponent class="h-5 w-5" weight="bold" aria-hidden="true" />
		<span class="sr-only">{i18n.m.common.sports[activity.type]}</span>
	</span>
	<span
		class="title font-semibold wrap-anywhere text-[var(--color-text-primary)]"
		data-testid="highlight-title"
		title={activity.title}
	>
		{activityTitle(i18n.locale, activity)}
	</span>
	<span class="figures stat-value">
		{#if activity.distance > 0}<span>{formatDistance(i18n.locale, activity.distance, unit)}</span
			>{/if}
		<span>{formatDuration(i18n.locale, activity.duration)}</span>
	</span>
	<button
		class="remove"
		aria-label={i18n.m.dashboard.removeHighlight(activityTitle(i18n.locale, activity))}
		disabled={exportLock.isExporting}
		onclick={() => highlightsStore.removeHighlight(activity)}
		><X class="h-4 w-4" weight="bold" aria-hidden="true" /></button
	>
</li>

<style>
	.highlight-row {
		display: grid;
		grid-template-columns: 3.75rem 1.5rem minmax(0, 1fr) auto;
		grid-template-areas:
			'date sport title remove'
			'date sport figures remove';
		align-items: center;
		column-gap: 0.75rem;
		row-gap: 0.125rem;
		padding: 0.75rem 0;
		border-top: 1px solid var(--color-border);
	}

	.date {
		grid-area: date;
		font-size: 1.125rem;
		color: var(--color-accent);
	}

	.sport {
		grid-area: sport;
		color: var(--color-text-muted);
	}

	.title {
		grid-area: title;
	}

	.figures {
		grid-area: figures;
		display: flex;
		gap: 1rem;
		font-size: 1.0625rem;
		color: var(--color-text-muted);
	}

	.remove {
		grid-area: remove;
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-control);
		color: var(--color-text-dim);
	}

	.remove:enabled:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-hover);
	}

	.remove:disabled {
		opacity: 0.5;
	}

	@media (min-width: 768px) {
		.highlight-row {
			grid-template-columns: 4.5rem 1.5rem minmax(0, 1fr) 13rem 2.25rem;
			grid-template-areas: 'date sport title figures remove';
		}

		.figures {
			justify-content: flex-end;
		}
	}
</style>
