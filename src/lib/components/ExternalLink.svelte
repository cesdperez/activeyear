<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let {
		href,
		newTabLabel,
		children,
		...rest
	}: Omit<HTMLAnchorAttributes, 'href' | 'target' | 'rel'> & {
		href: string;
		/** Screen-reader note that the link opens a new tab. */
		newTabLabel?: string;
		children: Snippet;
	} = $props();
</script>

<!-- A new tab, so following a link never throws away the dashboard. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
<a {...rest} {href} target="_blank" rel="noopener noreferrer"
	>{@render children()}<span class="sr-only"> {newTabLabel ?? i18n.m.common.opensInNewTab}</span></a
>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
