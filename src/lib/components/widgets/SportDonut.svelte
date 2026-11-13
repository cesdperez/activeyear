<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { donutCentre, sportDonutSegments, type SportColors } from '#lib/utils/breakdown.js';
	import type {
		BreakdownMetric,
		SportBreakdown,
		WidgetVariant,
		WidgetVariantProps
	} from '#lib/types/index.js';

	let {
		sports,
		colors,
		metric,
		variant
	}: {
		sports: SportBreakdown[];
		colors: SportColors;
		metric: BreakdownMetric;
	} & WidgetVariantProps = $props();

	// Matches the r="80" of the circles below.
	const circumference = 2 * Math.PI * 80;

	const STYLES: Record<WidgetVariant, { size: string; value: string; label: string }> = {
		dashboard: {
			size: 'h-[280px] w-[280px] md:h-[340px] md:w-[340px]',
			value: '2.5rem',
			label: 'text-xs md:text-sm'
		},
		export: {
			size: 'h-[280px] w-[280px]',
			value: 'calc(64px * var(--stat-scale, 1))',
			label: 'card-label donut-label'
		}
	};

	const style = $derived(STYLES[variant]);
	const segments = $derived(sportDonutSegments(sports, colors, metric, circumference, variant));
	const centre = $derived(donutCentre(i18n.locale, sports, metric));
</script>

<div class="relative shrink-0">
	<div class="relative {style.size}">
		<!-- The ring is decorative; the legend and centre text carry the information. -->
		<svg
			viewBox="0 0 200 200"
			class="h-full w-full overflow-visible"
			aria-hidden="true"
			focusable="false"
		>
			<circle
				cx="100"
				cy="100"
				r="80"
				fill="none"
				stroke="var(--color-border)"
				class="donut-bg"
				stroke-width="24"
			/>
			{#each segments as segment, i (i)}
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke={segment.color}
					stroke-width="24"
					stroke-dasharray={segment.dashArray}
					stroke-dashoffset={-segment.offset}
					stroke-linecap="butt"
					transform="rotate(-90 100 100)"
					class="donut-segment"
				/>
			{/each}
		</svg>

		<div
			class="@container absolute top-1/2 left-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2 text-center"
		>
			<div
				class="stat-value fit-value leading-none text-[var(--color-text-primary)]"
				style:--fit-chars={centre.value.length}
				style:--fit-max={style.value}
			>
				{centre.value}
			</div>
			<div
				class="mt-1 whitespace-nowrap text-[var(--color-text-muted)] {style.label}"
				style:--label-chars={centre.label.length}
			>
				{centre.label}
			</div>
		</div>
	</div>
</div>

<style>
	/* The label is a translated word, so it shrinks to the hole, with 5% to spare. */
	:global(.export-card) .donut-label {
		font-size: min(var(--label-size), 100cqi / (var(--label-chars) * var(--label-char-em) * 1.05));
	}

	/* Press Start 2P is too wide for a word whose length varies by language.
	   0.44 is VT323's advance per character with a little air. */
	:global(.theme-retro) .donut-label {
		font-family: var(--font-text);
		font-size: min(calc(24px * var(--text-scale)), 100cqi / (var(--label-chars) * 0.44));
	}

	.donut-segment {
		transition: stroke-dasharray 0.3s ease;
	}
</style>
