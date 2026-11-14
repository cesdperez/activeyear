<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { track } from '#lib/analytics/track.js';
	import type { EventValue } from '#lib/constants/events.js';
	import { KOFI_URL } from '#lib/constants/site.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import ExternalLink from '#lib/components/ExternalLink.svelte';

	let {
		placement,
		children,
		...rest
	}: Omit<ComponentProps<typeof ExternalLink>, 'href' | 'newTabLabel'> & {
		placement: EventValue<'support_clicked'>;
	} = $props();
</script>

<ExternalLink
	{...rest}
	href={KOFI_URL}
	newTabLabel={i18n.m.dashboard.opensKofi}
	onclick={() => track('support_clicked', placement)}>{@render children()}</ExternalLink
>
