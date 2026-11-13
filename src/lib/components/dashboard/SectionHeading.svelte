<script lang="ts">
	import type { WidgetVariant } from '#lib/types/index.js';

	interface Props {
		title: string;
		variant?: WidgetVariant;
		class?: string;
	}

	const VARIANTS = {
		dashboard: { title: 'mb-6 text-3xl md:text-4xl', tag: 'h2' },
		export: { title: 'export-heading mb-6', tag: 'p' }
	} as const;

	let { title, variant = 'dashboard', class: className }: Props = $props();

	const style = $derived(VARIANTS[variant]);
</script>

<svelte:element this={style.tag} class="display-heading {style.title} {className ?? ''}">
	{title}
</svelte:element>

<style>
	.export-heading {
		font-size: var(--heading-size);
		line-height: 1.1;
	}
</style>
