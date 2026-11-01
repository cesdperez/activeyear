<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { formatCount } from '#lib/utils/format.js';
	import { prefersReducedMotion } from 'svelte/motion';
	import { ArrowDown } from 'phosphor-svelte';

	let { activityCount, activeDays }: { activityCount: number; activeDays: number } = $props();

	function jumpToExport() {
		const heading = document.querySelector<HTMLElement>('#export-panel h2');
		if (!heading) return;
		heading.tabIndex = -1;
		heading.scrollIntoView({ behavior: prefersReducedMotion.current ? 'auto' : 'smooth' });
		heading.focus({ preventScroll: true });
	}
</script>

<header class="mb-16 text-center md:mb-24">
	<h1
		class="glow-text mb-6 text-5xl font-bold tracking-tight md:text-7xl"
		tabindex="-1"
		{@attach (heading) => heading.focus()}
	>
		Your {TARGET_YEAR}
	</h1>
	<div
		data-testid="activity-summary"
		class="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-[rgba(255,255,255,0.05)] bg-[var(--color-surface-elevated)] px-4 py-2"
	>
		<span class="inline-flex items-center gap-2 whitespace-nowrap">
			<span class="font-mono font-bold text-[var(--color-accent)]"
				>{formatCount(activityCount)}</span
			>
			<span class="text-[var(--color-text-muted)]"
				>{activityCount === 1 ? 'activity' : 'activities'} across</span
			>
		</span>
		<span class="inline-flex items-center gap-2 whitespace-nowrap">
			<span class="font-mono font-bold text-[var(--color-accent)]">{formatCount(activeDays)}</span>
			<span class="text-[var(--color-text-muted)]"
				>{activeDays === 1 ? 'active day' : 'active days'}</span
			>
		</span>
	</div>

	<div class="mt-8">
		<button
			class="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] transition-colors duration-200 hover:text-white"
			onclick={jumpToExport}
		>
			<span>Jump to Export</span>
			<ArrowDown
				class="h-4 w-4 transition-transform group-hover:translate-y-1"
				aria-hidden="true"
			/>
		</button>
	</div>
</header>
