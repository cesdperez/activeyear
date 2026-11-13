<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
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
				aria-pressed={exportSettings.unit === unit}
				disabled={exportLock.isExporting}
				onclick={() => (exportSettings.unit = unit)}
			>
				{label}
			</button>
		{/each}
	</div>
	<!-- Confetti never falls under reduced motion, so a toggle there would do nothing. -->
	{#if !prefersReducedMotion.current}
		<button
			class="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] transition-colors duration-150 {exportSettings.confettiEnabled
				? 'text-[var(--color-accent)]'
				: 'text-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]'}"
			onclick={() => (exportSettings.confettiEnabled = !exportSettings.confettiEnabled)}
			title={i18n.m.dashboard.celebrationConfetti}
			aria-label={i18n.m.dashboard.celebrationConfetti}
			aria-pressed={exportSettings.confettiEnabled}
		>
			<Confetti
				class="h-5 w-5"
				weight={exportSettings.confettiEnabled ? 'fill' : 'regular'}
				aria-hidden="true"
			/>
		</button>
	{/if}
</div>
