<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { track } from '#lib/analytics/track.js';
	import type { EventValue } from '#lib/constants/events.js';
	import { KOFI_URL } from '#lib/constants/site.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let {
		placement,
		children,
		...rest
	}: HTMLAnchorAttributes & {
		placement: EventValue<'support_clicked'>;
		children: Snippet;
	} = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
<a
	{...rest}
	href={KOFI_URL}
	target="_blank"
	rel="noopener"
	onclick={() => track('support_clicked', placement)}
	>{@render children()}<span class="sr-only"> {i18n.m.dashboard.opensKofi}</span></a
>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
