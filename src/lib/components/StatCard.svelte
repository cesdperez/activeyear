<script lang="ts">
	import { onMount } from "svelte";
	import { spring } from "svelte/motion";
	import type { Snippet } from "svelte";

	interface Props {
		value: string;
		label: string;
		detail?: string;
		icon?: Snippet;
		highlight?: boolean;
		delay?: number;
		equivalent?: string;
	}

	let {
		value,
		label,
		detail,
		icon,
		highlight = false,
		delay = 0,
		equivalent,
	}: Props = $props();

	// Animation state
	let visible = $state(false);
	let opacity = spring(0, { stiffness: 0.1, damping: 0.6 });
	let scale = spring(0.95, { stiffness: 0.15, damping: 0.5 });

	onMount(() => {
		// Staggered entry animation
		const timer = setTimeout(() => {
			visible = true;
			opacity.set(1);
			scale.set(1);
		}, delay);

		return () => clearTimeout(timer);
	});
</script>

<div
	class="stat-card p-8 flex flex-col justify-between h-full relative overflow-hidden group"
	class:glow-border={highlight}
	style="opacity: {$opacity}; transform: scale({$scale});"
>
	<!-- Decorative accent gradient -->
	<div
		class="absolute -top-12 -right-12 w-24 h-24 bg-[var(--color-accent)] opacity-[0.03] blur-3xl rounded-full pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-300"
	></div>

	<div class="mb-6">
		{#if icon}
			<div
				class="icon-container mb-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-300"
			>
				{@render icon()}
			</div>
		{/if}

		<div
			class="stat-value text-4xl md:text-5xl text-[var(--color-text-primary)] leading-none tracking-tight mb-2"
		>
			{value}
		</div>
	</div>

	<div class="mt-auto">
		<div class="stat-label mb-1">
			{label}
		</div>

		{#if detail}
			<div class="text-sm text-[var(--color-text-muted)] font-medium">
				{detail}
			</div>
		{/if}

		{#if equivalent}
			<div
				class="text-sm font-medium text-[var(--color-accent)] mt-2 opacity-90"
			>
				{equivalent}
			</div>
		{/if}
	</div>
</div>

<style>
	.icon-container {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.icon-container :global(svg) {
		width: 1.5rem;
		height: 1.5rem;
		stroke-width: 1.5; /* Guidelines say 1.5-2px */
	}
</style>
