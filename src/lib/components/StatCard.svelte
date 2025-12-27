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
	}

	let { value, label, detail, icon, highlight = false, delay = 0 }: Props = $props();

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
	class="stat-card p-6"
	class:glow-border={highlight}
	style="opacity: {$opacity}; transform: scale({$scale});"
>
	{#if icon}
		<div class="icon-container mb-3">
			{@render icon()}
		</div>
	{/if}

	<div class="stat-value text-3xl md:text-4xl text-white mb-1">
		{value}
	</div>

	<div class="stat-label">
		{label}
	</div>

	{#if detail}
		<div class="mt-2 text-sm text-zinc-500 truncate">
			{detail}
		</div>
	{/if}
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
		color: var(--color-accent);
		stroke-width: 1.75;
	}
</style>
