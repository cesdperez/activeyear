<script lang="ts">
	import { observeSupport } from '#lib/stores/supportVisibility.svelte.js';
	import GelLink from '#lib/components/GelLink.svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let { placement }: { placement: 'export' | 'footer' } = $props();
</script>

<p
	data-support-placement={placement}
	class:text-center={placement === 'footer'}
	class="text-sm text-[var(--color-text-muted)]"
>
	{placement === 'export' ? i18n.m.dashboard.supportExport : i18n.m.dashboard.supportFooter}
	<GelLink {placement} {@attach observeSupport}>{i18n.m.dashboard.buyMeAGel}</GelLink>
</p>
