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

<div class="flex items-center gap-2">
	<div role="group" aria-label={i18n.m.dashboard.distanceUnit} class="segmented">
		{#each units as { unit, label } (unit)}
			<button
				aria-pressed={appStore.unit === unit}
				disabled={appStore.isExporting}
				onclick={() => (appStore.unit = unit)}
			>
				{label}
			</button>
		{/each}
	</div>
	<button
		class="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] transition-colors duration-150 {appStore.confettiEnabled
			? 'text-[var(--color-accent)]'
			: 'text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]'}"
		onclick={() => (appStore.confettiEnabled = !appStore.confettiEnabled)}
		title={appStore.confettiEnabled
			? i18n.m.dashboard.disableCelebration
			: i18n.m.dashboard.enableCelebration}
		aria-label={i18n.m.dashboard.celebrationConfetti}
		aria-pressed={appStore.confettiEnabled}
	>
		<Confetti
			class="h-5 w-5"
			weight={appStore.confettiEnabled ? 'fill' : 'regular'}
			aria-hidden="true"
		/>
	</button>
</div>
