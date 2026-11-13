<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { sportIcons } from '#lib/constants/sports.js';
	import {
		activityTitle,
		formatDistance,
		formatDuration,
		formatElevation,
		formatShortDate
	} from '#lib/utils/format.js';
	import type { Activity, Unit } from '#lib/types/index.js';
	import { ArrowUp, X } from 'phosphor-svelte';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';

	let {
		activity,
		unit,
		showElevation,
		onremove
	}: { activity: Activity; unit: Unit; showElevation: boolean; onremove: () => void } = $props();

	const IconComponent = $derived(sportIcons[activity.type]);
</script>

<li class="highlight-row" class:with-elevation={showElevation} data-testid="highlight-row">
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
		<span>{activity.distance > 0 ? formatDistance(i18n.locale, activity.distance, unit) : ''}</span>
		{#if showElevation}<span class="elevation"
				><ArrowUp class="h-3.5 w-3.5" weight="bold" aria-hidden="true" /><span class="sr-only"
					>{i18n.m.dashboard.elevationGained}</span
				>{formatElevation(i18n.locale, activity.elevation, unit)}</span
			>{/if}
		<span>{formatDuration(i18n.locale, activity.duration)}</span>
	</span>
	<button
		class="remove"
		aria-label={i18n.m.dashboard.removeHighlight(activityTitle(i18n.locale, activity))}
		disabled={exportLock.isExporting}
		onclick={onremove}><X class="h-4 w-4" weight="bold" aria-hidden="true" /></button
	>
</li>

<style>
	.highlight-row {
		--figure-column: 4.25rem;
		display: grid;
		grid-template-columns: 3.75rem 1.5rem minmax(0, 1fr) auto;
		grid-template-areas:
			'date sport title remove'
			'date sport figures remove';
		align-items: center;
		column-gap: 0.75rem;
		row-gap: 0.125rem;
		padding: 0.5rem 0;
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
		flex-wrap: wrap;
		column-gap: 0.75rem;
		font-size: 1.0625rem;
		white-space: nowrap;
		color: var(--color-text-muted);
	}

	/* A minimum width rather than a fixed one, so a long value wraps on a 320px phone instead of overflowing. */
	.figures > span {
		min-width: 3.5rem;
	}

	.elevation {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
	}

	.remove {
		grid-area: remove;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--radius-control);
		color: var(--color-text-dim);
	}

	@media (hover: hover) {
		.remove:enabled:hover {
			color: var(--color-text-primary);
			background: var(--color-surface-hover);
		}
	}

	.remove:disabled {
		opacity: 0.5;
	}

	@media (min-width: 768px) {
		.highlight-row {
			grid-template-columns: 4.5rem 1.5rem minmax(0, 1fr) auto 2.75rem;
			grid-template-areas: 'date sport title figures remove';
		}

		.figures {
			display: grid;
			grid-template-columns: repeat(2, var(--figure-column));
			text-align: right;
		}

		.with-elevation .figures {
			grid-template-columns: repeat(3, var(--figure-column));
		}

		.elevation {
			justify-content: flex-end;
		}
	}
</style>
