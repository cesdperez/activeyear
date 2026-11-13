<script lang="ts">
	import { track } from '#lib/analytics/track.js';
	import { KOFI_URL } from '#lib/constants/site.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let { placement }: { placement: 'export' | 'footer' } = $props();
</script>

<p class:text-center={placement === 'footer'} class="text-sm text-[var(--color-text-muted)]">
	{placement === 'export' ? i18n.m.dashboard.supportExport : i18n.m.dashboard.supportFooter}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
	<a
		href={KOFI_URL}
		target="_blank"
		rel="noopener"
		onclick={() => track('support_clicked', placement)}
		class="underline decoration-[var(--color-border)] underline-offset-4 hover:text-[var(--color-text-primary)] hover:decoration-[var(--color-accent)]"
		>{i18n.m.dashboard.buyMeAGel}<span class="sr-only"> {i18n.m.dashboard.opensKofi}</span></a
	>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</p>
