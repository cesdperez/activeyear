<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { prefersReducedMotion, spring } from 'svelte/motion';
	import type { IconComponentProps } from 'phosphor-svelte';
	import type { WidgetVariant } from '#lib/types/index.js';

	interface Props {
		icon: Component<IconComponentProps>;
		value: string;
		label: string;
		activityTitle: string;
		variant: WidgetVariant;
		/** Dashboard entrance delay in ms. */
		delay?: number;
	}

	let { icon: Icon, value, label, activityTitle, variant, delay = 0 }: Props = $props();

	const animate = !prefersReducedMotion.current;
	let opacity = spring(animate ? 0 : 1, { stiffness: 0.1, damping: 0.6 });
	let scale = spring(animate ? 0.95 : 1, { stiffness: 0.15, damping: 0.5 });

	onMount(() => {
		if (!animate) return;
		const timer = setTimeout(() => {
			opacity.set(1);
			scale.set(1);
		}, delay);

		return () => clearTimeout(timer);
	});
</script>

{#if variant === 'dashboard'}
	<div
		class="pr-card group relative overflow-hidden"
		style="opacity: {$opacity}; transform: scale({$scale});"
	>
		<div
			class="absolute inset-0 z-0 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)]"
		></div>

		<div
			class="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[60px] transition-opacity duration-500 group-hover:opacity-[0.1]"
		></div>

		<div class="relative z-10 flex items-start gap-4 p-6">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.05)] bg-[var(--color-surface-hover)] text-[var(--color-gold)] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[rgba(250,204,21,0.3)]"
			>
				<div class="icon-inner">
					<Icon weight="fill" aria-hidden="true" />
				</div>
			</div>

			<div class="@container min-w-0 flex-1">
				<div class="stat-label mb-1 text-xs tracking-wider wrap-anywhere opacity-70">
					{label}
				</div>

				<div
					class="stat-value fit-value group-hover:glow-text mb-1 text-white transition-all duration-300"
					style:--fit-chars={value.length}
					style:--fit-max="1.875rem"
				>
					{value}
				</div>

				{#if activityTitle}
					<div
						class="mt-2 flex items-start gap-1.5 border-t border-[rgba(255,255,255,0.05)] pt-2 text-xs text-[var(--color-text-muted)]"
					>
						<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)] opacity-50"
						></span>
						<span class="line-clamp-3 min-w-0 wrap-anywhere" title={activityTitle}
							>{activityTitle}</span
						>
					</div>
				{/if}
			</div>
		</div>

		<div
			class="pointer-events-none absolute inset-0 rounded-2xl border border-[rgba(255,255,255,0.05)] transition-colors duration-300 group-hover:border-[rgba(34,211,238,0.3)]"
		></div>
	</div>
{:else}
	<div class="record-card-compact min-w-0">
		<div class="record-icon-compact">
			<Icon class="h-14 w-14" weight="fill" aria-hidden="true" />
		</div>
		<div
			class="text-[42px] leading-tight font-black whitespace-nowrap text-[var(--color-text-primary)]"
		>
			{value}
		</div>
		<div
			class="w-full text-[18px] tracking-widest text-balance wrap-anywhere text-[var(--color-text-muted)] uppercase"
		>
			{label}
		</div>
		<div class="mt-2 line-clamp-2 w-full text-[16px] font-medium text-[var(--color-accent)]">
			{activityTitle}
		</div>
	</div>
{/if}

<style>
	.pr-card {
		border-radius: 1rem;
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
