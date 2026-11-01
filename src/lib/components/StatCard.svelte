<script lang="ts">
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		label: string;
		detail?: string;
		icon?: Snippet;
		highlight?: boolean;
		delay?: number;
		equivalent?: string;
	}

	let { value, label, detail, icon, highlight = false, delay = 0, equivalent }: Props = $props();

	// Animation state
	let opacity = spring(0, { stiffness: 0.1, damping: 0.6 });
	let scale = spring(0.95, { stiffness: 0.15, damping: 0.5 });

	onMount(() => {
		// Staggered entry animation
		const timer = setTimeout(() => {
			opacity.set(1);
			scale.set(1);
		}, delay);

		return () => clearTimeout(timer);
	});
</script>

<div
	class="stat-card group relative flex h-full flex-col justify-between overflow-hidden p-6 md:p-8"
	class:glow-border={highlight}
	style="opacity: {$opacity}; transform: scale({$scale});"
>
	<!-- Decorative accent gradient -->
	<div
		class="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.07]"
	></div>

	<div class="mb-6">
		{#if icon}
			<div
				class="icon-container mb-4 text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-accent)]"
			>
				{@render icon()}
			</div>
		{/if}

		<div
			class="stat-value {value.length > 10
				? 'text-2xl sm:text-3xl lg:text-4xl'
				: 'text-3xl sm:text-4xl lg:text-5xl'} mb-2 leading-none tracking-tight text-[var(--color-text-primary)]"
		>
			{value}
		</div>
	</div>

	<div class="mt-auto">
		<div class="stat-label mb-1">
			{label}
		</div>

		{#if detail}
			<div class="text-sm font-medium text-[var(--color-text-muted)]">
				{detail}
			</div>
		{/if}

		{#if equivalent}
			<div class="mt-2 text-sm font-medium text-[var(--color-accent)] opacity-90">
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
