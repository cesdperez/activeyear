<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Lightning } from 'phosphor-svelte';
	import KofiLink from '#lib/components/KofiLink.svelte';

	let { children, ...rest }: ComponentProps<typeof KofiLink> = $props();
</script>

<!-- Inline, not inline-flex: a flex box takes its baseline from the icon and lifts the text off the sentence. -->
<KofiLink
	{...rest}
	class="font-semibold whitespace-nowrap text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
	><Lightning
		class="mr-1 inline-block h-4 w-4 align-[-0.15em]"
		weight="bold"
		aria-hidden="true"
	/>{@render children()}</KofiLink
>
