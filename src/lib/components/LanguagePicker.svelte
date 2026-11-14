<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Globe, Check, X } from 'phosphor-svelte';
	import { LOCALES, LOCALE_NAMES, LOCALE_STORAGE_KEY } from '#lib/constants/locales.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { isLocale } from '#lib/i18n/locale.js';
	import { PICKERS } from '#lib/i18n/messages/picker.js';
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import type { Locale } from '#lib/types/index.js';

	let open = $state(false);
	let suggestion = $state<Locale | null>(null);
	let button: HTMLButtonElement;
	let container = $state<HTMLDivElement>();
	let menu = $state<HTMLDivElement>();

	function save(locale: Locale) {
		try {
			localStorage.setItem(LOCALE_STORAGE_KEY, locale);
		} catch {
			/* Storage can be unavailable in private browsing. */
		}
	}

	onMount(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(LOCALE_STORAGE_KEY);
		} catch {
			/* Browser language remains available without storage. */
		}
		if (stored !== null) {
			if (isLocale(stored) && stored !== 'en') suggestion = stored;
		} else {
			const preferred = navigator.languages
				.map((language) => language.split('-')[0].toLowerCase())
				.find((language) => isLocale(language) && language !== 'en');
			if (preferred && isLocale(preferred)) suggestion = preferred;
		}
	});

	async function showMenu() {
		open = true;
		await tick();
		menu?.querySelector<HTMLAnchorElement>(`[hreflang="${i18n.locale}"]`)?.focus();
	}

	function menuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			open = false;
			button.focus();
			return;
		}
		if (event.key === 'Tab') {
			open = false;
			return;
		}
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const items = Array.from(menu!.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]'));
		const current = items.indexOf(document.activeElement as HTMLAnchorElement);
		const index =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? items.length - 1
					: (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
		items[index]?.focus();
	}
</script>

<svelte:document
	onpointerdown={(event) => {
		if (open && !container?.contains(event.target as Node)) open = false;
	}}
/>

<div bind:this={container} class="relative">
	<button
		bind:this={button}
		class="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-muted)] transition-colors duration-150 hover:border-[var(--color-text-dim)] hover:text-[var(--color-text-primary)]"
		aria-label={i18n.m.picker.languageButton(i18n.locale.toUpperCase(), LOCALE_NAMES[i18n.locale])}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open ? (open = false) : showMenu())}
		onkeydown={(event) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				showMenu();
			}
		}}
	>
		<Globe class="h-5 w-5" aria-hidden="true" />{i18n.locale.toUpperCase()}
	</button>
	{#if open}
		<div
			bind:this={menu}
			role="menu"
			tabindex="-1"
			aria-label={i18n.m.picker.language}
			onkeydown={menuKeydown}
			class="panel absolute top-full right-0 mt-2 min-w-44 p-1"
		>
			{#each LOCALES as locale (locale)}
				<a
					role="menuitem"
					href={resolve('/[[lang=locale]]', { lang: locale === 'en' ? undefined : locale })}
					hreflang={locale}
					lang={locale}
					aria-current={locale === i18n.locale || undefined}
					data-sveltekit-noscroll
					onclick={() => {
						save(locale);
						open = false;
						suggestion = null;
					}}
					class="flex min-h-11 items-center justify-between gap-4 rounded-[var(--radius-control)] px-3 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
				>
					{LOCALE_NAMES[locale]}{#if locale === i18n.locale}<Check
							class="h-4 w-4 text-[var(--color-accent)]"
							aria-hidden="true"
						/>{/if}
				</a>
			{/each}
		</div>
	{/if}
	{#if !open && suggestion && page.url.pathname === '/' && uploadStore.status !== 'ready'}
		<!-- Beside the button, not under it, so it never covers the landing logotype on a phone. -->
		<div
			class="panel absolute top-0 right-full mr-2 flex w-max max-w-[calc(100vw-7rem)] items-center gap-2 pr-1 text-sm text-balance text-[var(--color-text-primary)]"
		>
			<a
				href={resolve('/[[lang=locale]]', { lang: suggestion })}
				lang={suggestion}
				hreflang={suggestion}
				data-sveltekit-noscroll
				onclick={() => {
					if (suggestion) save(suggestion);
					suggestion = null;
				}}
				class="flex min-h-11 items-center py-1 pl-4 leading-tight">{PICKERS[suggestion].prompt}</a
			>
			<button
				class="flex h-11 w-11 shrink-0 items-center justify-center"
				lang={suggestion}
				aria-label={PICKERS[suggestion].dismiss}
				onclick={() => {
					save('en');
					suggestion = null;
					button.focus();
				}}><X class="h-4 w-4" aria-hidden="true" /></button
			>
		</div>
	{/if}
	<noscript>
		<nav aria-label={i18n.m.picker.language} class="panel absolute top-full right-0 mt-2 p-2">
			{#each LOCALES as locale (locale)}<a
					href={resolve('/[[lang=locale]]', { lang: locale === 'en' ? undefined : locale })}
					hreflang={locale}
					lang={locale}
					class="block px-3 py-2 text-[var(--color-text-primary)]">{LOCALE_NAMES[locale]}</a
				>{/each}
		</nav>
	</noscript>
</div>
