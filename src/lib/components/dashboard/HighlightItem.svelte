<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { sportNames, sportIcons } from "#lib/constants/sports.js";
	import { formatDistance, formatDuration } from "#lib/utils/format.js";
	import type { Activity } from "#lib/types/index.js";
	import { Target, Star } from "phosphor-svelte";

	interface Props {
		activity: Activity;
		delay: number;
	}

	let { activity, delay }: Props = $props();

	const IconComponent = $derived(sportIcons[activity.type] ?? Target);
</script>

<div
	class="stat-card p-4 flex items-center gap-4 group"
	style="animation-delay: {delay}ms"
>
	<div
		class="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0"
	>
		<IconComponent class="w-6 h-6" weight="bold" />
	</div>
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2 mb-1">
			<Star class="w-4 h-4 text-yellow-500" weight="fill" />
			<span class="font-bold text-white truncate" title={activity.title}>
				{activity.title || sportNames[activity.type] || "Activity"}
			</span>
		</div>
		<div
			class="flex items-center gap-3 text-sm text-[var(--color-text-muted)]"
		>
			{#if activity.distance > 0}
				<span class="font-mono"
					>{formatDistance(activity.distance, appStore.unit)}</span
				>
			{/if}
			<span class="font-mono">{formatDuration(activity.duration)}</span>
			<span
				class="px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-xs uppercase tracking-wider"
			>
				{sportNames[activity.type] ?? activity.type}
			</span>
		</div>
	</div>
</div>
