<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { Unit } from '#lib/types/index.js';
	import { Confetti } from 'phosphor-svelte';

	const units: { unit: Unit; label: string }[] = [
		{ unit: 'km', label: 'km' },
		{ unit: 'miles', label: 'mi' }
	];
</script>

<div class="absolute top-4 right-4 z-10 flex items-center gap-2 md:right-8">
	<div
		role="group"
		aria-label={i18n.m.dashboard.distanceUnit}
		class="flex rounded-full border border-[rgba(255,255,255,0.05)] bg-[var(--color-surface-elevated)] p-0.5"
	>
		{#each units as { unit, label } (unit)}
			{@const pressed = appStore.unit === unit}
			<button
				class="rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase transition-all duration-200 {pressed
					? 'bg-[var(--color-accent)] text-black'
					: 'text-[var(--color-text-dim)] enabled:hover:text-white'} disabled:cursor-not-allowed disabled:opacity-50"
				aria-pressed={pressed}
				disabled={appStore.isExporting}
				onclick={() => (appStore.unit = unit)}
			>
				{label}
			</button>
		{/each}
	</div>
	<button
		class="rounded-full p-2 transition-all duration-300 hover:scale-110 {appStore.confettiEnabled
			? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent)] shadow-lg'
			: 'bg-transparent text-[var(--color-text-dim)] hover:text-white'}"
		onclick={() => (appStore.confettiEnabled = !appStore.confettiEnabled)}
		title={appStore.confettiEnabled
			? i18n.m.dashboard.disableCelebration
			: i18n.m.dashboard.enableCelebration}
		aria-label={i18n.m.dashboard.celebrationConfetti}
		aria-pressed={appStore.confettiEnabled}
	>
		<Confetti class="h-6 w-6" aria-hidden="true" />
	</button>
</div>
