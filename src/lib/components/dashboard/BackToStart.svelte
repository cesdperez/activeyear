<script lang="ts">
	import { ArrowLeft } from 'phosphor-svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { exportLock } from '#lib/stores/exportLock.svelte.js';
	import { leaveDashboard } from './startOver.js';

	$effect(() => {
		// Keyboard focus scrolls controls clear of this fixed button instead of under it.
		document.documentElement.style.scrollPaddingTop = '5rem';
		return () => document.documentElement.style.removeProperty('scroll-padding-top');
	});
</script>

<button
	type="button"
	aria-label={i18n.m.dashboard.backToStart}
	title={i18n.m.dashboard.backToStart}
	disabled={exportLock.isExporting}
	onclick={leaveDashboard}
	class="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-sm text-[var(--color-text-muted)] shadow-lg transition-colors duration-150 hover:text-[var(--color-text-primary)] disabled:opacity-50"
>
	<ArrowLeft class="h-5 w-5" aria-hidden="true" />
	<span class="hidden sm:inline">{i18n.m.dashboard.backToStart}</span>
</button>
