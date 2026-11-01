<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { CalendarCheck, Lightning } from "phosphor-svelte";
</script>

{#snippet consistencyCard(
	Icon: typeof CalendarCheck,
	value: number,
	label: string,
	delayMs: number,
)}
	<div
		class="stat-card p-4 md:p-6 flex items-center gap-4 group"
		style="animation-delay: {delayMs}ms"
	>
		<div class="text-[var(--color-accent)] shrink-0">
			<Icon class="w-6 h-6 md:w-8 md:h-8" weight="bold" />
		</div>
		<div>
			<div class="text-2xl md:text-3xl font-bold text-white leading-none">
				{value}
			</div>
			<div
				class="text-xs md:text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wider"
			>
				{label}
			</div>
		</div>
	</div>
{/snippet}

<div class="grid grid-cols-2 gap-4 md:gap-6 mb-16 max-w-2xl mx-auto">
	{@render consistencyCard(
		CalendarCheck,
		appStore.stats?.activeDays ?? 0,
		"Active Days",
		350,
	)}
	{@render consistencyCard(
		Lightning,
		appStore.stats?.longestStreak ?? 0,
		"most consecutive active days",
		400,
	)}
</div>
