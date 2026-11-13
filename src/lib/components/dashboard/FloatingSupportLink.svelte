<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Lightning } from 'phosphor-svelte';
	import KofiLink from '#lib/components/KofiLink.svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { supportVisibility } from '#lib/stores/supportVisibility.svelte.js';

	let { header }: { header: HTMLElement | undefined } = $props();
	let headerVisible = $state(true);
	let shown = $derived(
		!headerVisible &&
			supportVisibility.count === 0 &&
			supportVisibility.busyAreas === 0 &&
			!exportLock.isExporting
	);

	$effect(() => {
		if (!header) return;
		const observer = new IntersectionObserver(([entry]) => {
			headerVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
		});
		observer.observe(header);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!shown) return;
		// Keyboard focus scrolls controls clear of the pill instead of under it.
		document.documentElement.style.scrollPaddingBottom = '5rem';
		return () => document.documentElement.style.removeProperty('scroll-padding-bottom');
	});
</script>

{#if shown}
	<div transition:fade={{ duration: 150 }}>
		<KofiLink
			placement="floating"
			class="fixed z-30 inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-accent)] shadow-lg"
			style="right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom));"
		>
			<Lightning class="h-4 w-4" weight="bold" aria-hidden="true" />{i18n.m.dashboard.buyMeAGel}
		</KofiLink>
	</div>
{/if}
