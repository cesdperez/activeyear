<script lang="ts">
	import { observeSupport } from '#lib/stores/supportVisibility.svelte.js';
	import { Lightning } from 'phosphor-svelte';
	import KofiLink from '#lib/components/KofiLink.svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let { placement }: { placement: 'export' | 'footer' } = $props();
</script>

<p
	data-support-placement={placement}
	class:text-center={placement === 'footer'}
	class="text-sm text-[var(--color-text-muted)]"
>
	{placement === 'export' ? i18n.m.dashboard.supportExport : i18n.m.dashboard.supportFooter}
	<KofiLink
		{placement}
		{@attach observeSupport}
		class="inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
		><Lightning class="h-4 w-4" weight="bold" aria-hidden="true" />{i18n.m.dashboard
			.buyMeAGel}</KofiLink
	>
</p>
