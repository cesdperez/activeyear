<script lang="ts">
	import { splitUnits } from '#lib/utils/totals.js';

	interface Props {
		value: string;
		/** One of `UNIT_SCALE`, so the drawn unit size matches the one `scaledLength` fits by. */
		unitScale: number;
		tone?: 'accent' | 'muted';
	}

	let { value, unitScale, tone = 'muted' }: Props = $props();

	const parts = $derived(splitUnits(value));
</script>

{#each parts as part, i (i)}{i > 0 ? ' ' : ''}{part.number}<span
		class="unit {tone}"
		style:--unit-scale={unitScale}>{part.unit}</span
	>{/each}

<style>
	.unit {
		font-size: calc(var(--unit-scale) * 1em);
	}

	.accent {
		margin-left: 0.06em;
		color: var(--color-accent);
		text-shadow: none;
	}

	.muted {
		color: var(--color-text-muted);
	}
</style>
