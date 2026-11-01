<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconComponentProps } from 'phosphor-svelte';

	let {
		value,
		ringStroke,
		ringDashArray,
		ringClass,
		icon: Icon,
		colorClass,
		label,
		caption
	}: {
		value: number;
		ringStroke: string;
		ringDashArray: string;
		ringClass: string;
		icon: Component<IconComponentProps>;
		/** Tailwind text colour for the icon and label row. */
		colorClass: string;
		label: string;
		caption: string;
	} = $props();
</script>

<div class="consistency-card flex flex-col items-center rounded-2xl p-8 text-center">
	<div class="mb-4 h-44 w-44">
		<svg viewBox="0 0 120 120" class="h-full w-full">
			<circle
				cx="60"
				cy="60"
				r="52"
				fill="none"
				stroke="rgba(0,0,0,0.05)"
				class="progress-ring-bg"
				stroke-width="10"
			/>
			<circle
				cx="60"
				cy="60"
				r="52"
				fill="none"
				stroke={ringStroke}
				stroke-width="10"
				stroke-dasharray={ringDashArray}
				stroke-linecap="round"
				transform="rotate(-90 60 60)"
				class={ringClass}
			/>
			<text
				x="60"
				y="60"
				text-anchor="middle"
				dominant-baseline="central"
				fill="var(--color-text-primary)"
				style="font-size: 38px; font-weight: 900; font-family: inherit;">{value}</text
			>
		</svg>
	</div>
	<div class="flex items-center gap-3 {colorClass}">
		<Icon class="h-8 w-8" weight="bold" />
		<span class="text-[28px] font-bold tracking-wider uppercase">{label}</span>
	</div>
	<div class="mt-2 text-[20px] whitespace-nowrap text-[var(--color-text-muted)]">
		{caption}
	</div>
</div>
