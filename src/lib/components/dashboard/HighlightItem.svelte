<script lang="ts">
	import { sportNames, sportIcons } from '#lib/constants/sports.js';
	import { activityTitle, formatDistance, formatDuration } from '#lib/utils/format.js';
	import type { Activity, Unit } from '#lib/types/index.js';
	import { X } from 'phosphor-svelte';
	import { appStore } from '#lib/stores/app.svelte.js';

	interface Props {
		activity: Activity;
		unit: Unit;
		delay: number;
	}

	let { activity, unit, delay }: Props = $props();

	const IconComponent = $derived(sportIcons[activity.type]);
</script>

<div
	class="stat-card group relative flex items-center gap-4 p-4 pt-10"
	style="animation-delay: {delay}ms"
>
	<button
		class="absolute top-2 right-2 rounded p-1 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50"
		aria-label="Remove {activityTitle(activity)} from highlights"
		disabled={appStore.isExporting}
		onclick={() => appStore.removeHighlight(activity)}
		><X class="h-5 w-5" aria-hidden="true" /></button
	>
	<div
		class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
	>
		<IconComponent class="h-6 w-6" weight="bold" aria-hidden="true" />
	</div>
	<div class="min-w-0 flex-1">
		<div class="mb-1 flex items-start gap-2">
			<span class="line-clamp-3 font-bold wrap-anywhere text-white" title={activity.title}>
				{activityTitle(activity)}
			</span>
		</div>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
			{#if activity.distance > 0}
				<span class="font-mono whitespace-nowrap">{formatDistance(activity.distance, unit)}</span>
			{/if}
			<span class="font-mono whitespace-nowrap">{formatDuration(activity.duration)}</span>
			<span
				class="rounded-full bg-[var(--color-surface-elevated)] px-2 py-0.5 text-xs tracking-wider uppercase"
			>
				{sportNames[activity.type]}
			</span>
		</div>
	</div>
</div>
