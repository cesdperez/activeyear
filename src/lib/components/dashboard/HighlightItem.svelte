<script lang="ts">
	import { sportNames, sportIcons } from '#lib/constants/sports.js';
	import { formatDistance, formatDuration } from '#lib/utils/format.js';
	import type { Activity, Unit } from '#lib/types/index.js';
	import { Star } from 'phosphor-svelte';

	interface Props {
		activity: Activity;
		unit: Unit;
		delay: number;
	}

	let { activity, unit, delay }: Props = $props();

	const IconComponent = $derived(sportIcons[activity.type]);
</script>

<div class="stat-card group flex items-center gap-4 p-4" style="animation-delay: {delay}ms">
	<div
		class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
	>
		<IconComponent class="h-6 w-6" weight="bold" />
	</div>
	<div class="min-w-0 flex-1">
		<div class="mb-1 flex items-center gap-2">
			<Star class="h-4 w-4 text-yellow-500" weight="fill" />
			<span class="truncate font-bold text-white" title={activity.title}>
				{activity.title || sportNames[activity.type] || 'Activity'}
			</span>
		</div>
		<div class="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
			{#if activity.distance > 0}
				<span class="font-mono">{formatDistance(activity.distance, unit)}</span>
			{/if}
			<span class="font-mono">{formatDuration(activity.duration)}</span>
			<span
				class="rounded-full bg-[var(--color-surface-elevated)] px-2 py-0.5 text-xs tracking-wider uppercase"
			>
				{sportNames[activity.type]}
			</span>
		</div>
	</div>
</div>
