<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion, Tween } from 'svelte/motion';
	import { UNIT_SCALE } from '#lib/utils/totals.js';
	import ValueWithUnits from '../ValueWithUnits.svelte';

	interface Props {
		total: number;
		value: string;
		format: (amount: number) => string;
	}

	let { total, value, format }: Props = $props();

	const COUNT_UP_MS = 1400;
	const progress = new Tween(
		untrack(() => (prefersReducedMotion.current ? 1 : 0)),
		{
			duration: COUNT_UP_MS,
			easing: cubicOut
		}
	);

	onMount(() => {
		progress.target = 1;
	});

	// The finished count shows `value` itself, never a re-format of a rounded fraction of the total.
	const shown = $derived(progress.current >= 1 ? value : format(total * progress.current));
</script>

<ValueWithUnits value={shown} unitScale={UNIT_SCALE.dashboardHeadline} tone="accent" />
