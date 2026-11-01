<script lang="ts">
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		label: string;
		detail?: string;
		icon?: Snippet;
		delay?: number;
	}

	let { value, label, detail, icon, delay = 0 }: Props = $props();

	// Animation state
	let opacity = spring(0, { stiffness: 0.1, damping: 0.6 });
	let scale = spring(0.95, { stiffness: 0.15, damping: 0.5 });

	onMount(() => {
		const timer = setTimeout(() => {
			opacity.set(1);
			scale.set(1);
		}, delay);

		return () => clearTimeout(timer);
	});
</script>

<div
	class="pr-card group relative overflow-hidden"
	style="opacity: {$opacity}; transform: scale({$scale});"
>
	<!-- Background Mesh Gradient -->
	<div
		class="absolute inset-0 z-0 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)]"
	></div>

	<!-- Subtle accent spotlight -->
	<div
		class="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[60px] transition-opacity duration-500 group-hover:opacity-[0.1]"
	></div>

	<!-- Content -->
	<div class="relative z-10 flex items-start gap-4 p-6">
		<!-- Icon Badge -->
		<div
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.05)] bg-[var(--color-surface-hover)] text-[var(--color-gold)] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[rgba(250,204,21,0.3)]"
		>
			{#if icon}
				<div class="icon-inner">
					{@render icon()}
				</div>
			{/if}
		</div>

		<div class="min-w-0 flex-1">
			<div class="stat-label mb-1 text-xs tracking-wider opacity-70">
				{label}
			</div>

			<div
				class="stat-value {value.length > 12
					? 'text-xl md:text-2xl'
					: 'text-2xl md:text-3xl'} group-hover:glow-text mb-1 text-white transition-all duration-300"
			>
				{value}
			</div>

			{#if detail}
				<div
					class="mt-2 flex items-center gap-1.5 truncate border-t border-[rgba(255,255,255,0.05)] pt-2 text-xs text-[var(--color-text-muted)]"
				>
					<span class="h-1 w-1 rounded-full bg-[var(--color-accent)] opacity-50"></span>
					{detail}
				</div>
			{/if}
		</div>
	</div>

	<!-- Interactive Border -->
	<div
		class="pointer-events-none absolute inset-0 rounded-2xl border border-[rgba(255,255,255,0.05)] transition-colors duration-300 group-hover:border-[rgba(34,211,238,0.3)]"
	></div>
</div>

<style>
	.pr-card {
		border-radius: 1rem;
		/* background: var(--color-surface-elevated); */
		box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.pr-card:hover {
		transform: translateY(-4px) scale(1.01) !important; /* Override spring for hover */
		box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.3);
	}

	.icon-inner :global(svg) {
		width: 1.5rem;
		height: 1.5rem;
		stroke-width: 1.75;
	}
</style>
